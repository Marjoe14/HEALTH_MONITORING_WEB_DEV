<?php
// ========================================
// DATABASE CONFIGURATION FOR RAILWAY
// ========================================

// ✅ ALWAYS use barangay_health — Railway's default is "railway" (empty)
$database = 'barangay_health';

// Read connection details from Railway's DATABASE_URL
$databaseUrl = getenv('DATABASE_URL');

if ($databaseUrl) {
    // Parse Railway's connection string
    $parsed   = parse_url($databaseUrl);
    $host     = $parsed['host'] ?? 'turntable.proxy.rlwy.net';
    $port     = $parsed['port'] ?? '59781';
    $user     = $parsed['user'] ?? 'root';
    // Use URL password; fall back to MYSQLPASSWORD env var if URL has none
    $password = $parsed['pass'] ?? getenv('MYSQLPASSWORD') ?: '';
} else {
    // Fallback: individual environment variables
    $host     = getenv('MYSQLHOST')     ?: 'turntable.proxy.rlwy.net';
    $port     = getenv('MYSQLPORT')     ?: '59781';
    $user     = getenv('MYSQLUSER')     ?: 'root';
    $password = getenv('MYSQLPASSWORD') ?: 'tisIzXSXPpzANHyfZsjdyQHsGVyICiqG';
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
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return null;
    }
}
?>
