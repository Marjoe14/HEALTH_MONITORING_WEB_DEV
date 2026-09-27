<?php
// ========================================
// DATABASE CONFIGURATION FOR RAILWAY
// ========================================

// Try DATABASE_URL first (from Railway)
$databaseUrl = getenv('DATABASE_URL');

if ($databaseUrl) {
    // Parse the connection string
    $parsed = parse_url($databaseUrl);
    $host = $parsed['host'] ?? 'turntable.proxy.rlwy.net';
    $port = $parsed['port'] ?? '59781';
    $database = ltrim($parsed['path'] ?? 'barangay_health', '/');
    $user = $parsed['user'] ?? 'root';
    $password = $parsed['pass'] ?? 'tisIzXSXPpzANHyfZsjdyQHsGVyICiqG';
} else {
    // Fallback to individual environment variables (your original code)
    $host = getenv('MYSQLHOST') ?: 'turntable.proxy.rlwy.net';
    $port = getenv('MYSQLPORT') ?: '59781';
    $database = getenv('MYSQLDATABASE') ?: 'barangay_health';
    $user = getenv('MYSQLUSER') ?: 'root';
    $password = getenv('MYSQLPASSWORD') ?: 'tisIzXSXPpzANHyfZsjdyQHsGVyICiqG';
}

// ⚠️ THESE NAMES ARE NOT CHANGED - They remain exactly as before
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
