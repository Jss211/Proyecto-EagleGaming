<?php
declare(strict_types=1);
require dirname(__DIR__).'/vendor/autoload.php';
$store = new \Eagle\RestVerification\PrivateStore($argv[1], str_repeat('test-only-', 4));
echo $store->reserve([['concurrent', 1, 60]]) ? 'allowed' : 'limited';
