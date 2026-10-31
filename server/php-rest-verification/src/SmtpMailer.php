<?php
declare(strict_types=1);
namespace Eagle\RestVerification;

use PHPMailer\PHPMailer\PHPMailer;

final readonly class SmtpMailer implements Mailer
{
    public function __construct(#[\SensitiveParameter] private array $config) {}
    public function compose(#[\SensitiveParameter] Mail $message): PHPMailer
    {
        $c = $this->config;
        if (($c['enabled'] ?? false) !== true || !preg_match('/\A[a-zA-Z0-9][a-zA-Z0-9.-]*\z/', $c['host'] ?? '') ||
            !in_array([$c['security'] ?? '', $c['port'] ?? 0], [['smtps', 465], ['starttls', 587]], true) ||
            empty($c['username']) || empty($c['password']) || !filter_var($c['from'] ?? '', FILTER_VALIDATE_EMAIL)) {
            throw new \RuntimeException('SMTP not configured');
        }
        $mail = new PHPMailer(true); $mail->isSMTP(); $mail->SMTPAuth = true; $mail->SMTPDebug = 0;
        $mail->Host = $c['host']; $mail->Port = $c['port']; $mail->Username = $c['username']; $mail->Password = $c['password'];
        $mail->SMTPSecure = $c['security'] === 'smtps' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
        $mail->SMTPOptions = ['ssl' => ['verify_peer' => true, 'verify_peer_name' => true, 'allow_self_signed' => false]];
        $mail->Timeout = 10; $mail->getSMTPInstance()->Timelimit = 15; $mail->CharSet = PHPMailer::CHARSET_UTF8;
        $mail->setFrom($c['from'], 'Eagle Gaming Perú'); $mail->addAddress($message->to);
        $mail->Subject = $message->subject; $mail->isHTML(true); $mail->Body = $message->html; $mail->AltBody = $message->text;
        return $mail;
    }
    public function send(#[\SensitiveParameter] Mail $mail): void { $this->compose($mail)->send(); }
}
