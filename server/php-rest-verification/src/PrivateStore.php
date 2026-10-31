<?php
declare(strict_types=1);
namespace Eagle\RestVerification;

use PDO;

final class PrivateStore
{
    private PDO $db;
    private \Closure $clock;
    public function __construct(string $file, #[\SensitiveParameter] private readonly string $hmacKey, ?\Closure $clock = null)
    {
        if (strlen($hmacKey) < 32 || !is_dir(dirname($file)) || is_link($file)) {
            throw new \RuntimeException('Invalid private store');
        }
        $this->clock = $clock ?? static fn (): int => time();
        $previousMask = umask(0077);
        try { $this->db = new PDO('sqlite:'.$file, options: [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]); }
        finally { umask($previousMask); }
        if (PHP_OS_FAMILY !== 'Windows' && (fileperms($file) & 0077) !== 0) {
            throw new \RuntimeException('Private file permissions required');
        }
        $this->db->exec('PRAGMA busy_timeout=5000');
        $this->db->exec('CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires INTEGER NOT NULL)');
        $this->db->exec('CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, value TEXT NOT NULL, expires INTEGER NOT NULL)');
    }
    /** Atomic all-or-none reservations across PHP processes on the same SQLite file. */
    public function reserve(array $rules): bool
    {
        $now = ($this->clock)();
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            $this->db->prepare('DELETE FROM limits WHERE expires <= ?')->execute([$now]);
            $this->db->prepare('DELETE FROM cache WHERE expires <= ?')->execute([$now]);
            $select = $this->db->prepare('SELECT hits FROM limits WHERE key = ?');
            $keys = [];
            foreach ($rules as [$key, $limit, $seconds]) {
                if ($limit < 1 || $seconds < 1) { throw new \RuntimeException('Invalid limit'); }
                $hash = hash_hmac('sha256', $key, $this->hmacKey);
                if (isset($keys[$hash])) { throw new \RuntimeException('Duplicate limit'); }
                $keys[$hash] = $seconds;
                $select->execute([$hash]); $hits = $select->fetchColumn();
                if ($hits !== false && (int) $hits >= $limit) { $this->db->exec('ROLLBACK'); return false; }
            }
            $insert = $this->db->prepare('INSERT INTO limits VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET hits=hits+1');
            foreach ($keys as $hash => $seconds) { $insert->execute([$hash, $now + $seconds]); }
            $this->db->exec('COMMIT'); return true;
        } catch (\Throwable $error) { $this->db->exec('ROLLBACK'); throw $error; }
    }
    public function get(string $key): ?array
    {
        $query = $this->db->prepare('SELECT value FROM cache WHERE key=? AND expires>?');
        $query->execute([$key, ($this->clock)()]); $value = $query->fetchColumn();
        return $value === false ? null : json_decode($value, true, 32, JSON_THROW_ON_ERROR);
    }
    public function put(string $key, #[\SensitiveParameter] array $value, int $seconds): void
    {
        $query = $this->db->prepare('INSERT INTO cache VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, expires=excluded.expires');
        $query->execute([$key, json_encode($value, JSON_THROW_ON_ERROR), ($this->clock)() + $seconds]);
    }
}
