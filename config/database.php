<?php
// ========================================
// DATABASE CONFIGURATION FOR RAILWAY
// ========================================

// Try MYSQL_URL first
$mysqlUrl = getenv('MYSQL_URL') ?: getenv('MYSQL_PRIVATE_URL');

if ($mysqlUrl) {
    $parsed = parse_url($mysqlUrl);
    $host = $parsed['host'] ?? 'localhost';
    $port = $parsed['port'] ?? '3306';
    $database = ltrim($parsed['path'] ?? '', '/');
    $user = $parsed['user'] ?? 'root';
    $password = $parsed['pass'] ?? '';
} else {
    $host = getenv('MYSQLHOST') ?: 'localhost';
    $port = getenv('MYSQLPORT') ?: '3306';
    $database = getenv('MYSQLDATABASE') ?: 'railway';
    $user = getenv('MYSQLUSER') ?: 'root';
    $password = getenv('MYSQLPASSWORD') ?: '';
}

define('DB_HOST', $host);
define('DB_PORT', $port);
define('DB_NAME', $database);
define('DB_USER', $user);
define('DB_PASS', $password);

function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO(
            $dsn,
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return null;
    }
}
?>
