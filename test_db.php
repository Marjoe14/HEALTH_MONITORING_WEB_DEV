<?php
echo "=== DATABASE DEBUG ===<br><br>";

// Show environment variables
echo "MYSQLHOST: " . (getenv('MYSQLHOST') ?: 'NOT SET') . "<br>";
echo "MYSQLPORT: " . (getenv('MYSQLPORT') ?: 'NOT SET') . "<br>";
echo "MYSQLDATABASE: " . (getenv('MYSQLDATABASE') ?: 'NOT SET') . "<br>";
echo "MYSQLUSER: " . (getenv('MYSQLUSER') ?: 'NOT SET') . "<br>";
echo "MYSQLPASSWORD: " . (getenv('MYSQLPASSWORD') ? 'SET (hidden)' : 'NOT SET') . "<br><br>";

// Try to connect
require_once 'config/database.php';
$pdo = getDBConnection();

if ($pdo) {
    echo "✅ Database connected successfully!<br>";
    echo "Connected to: " . DB_NAME . " at " . DB_HOST . ":" . DB_PORT;
} else {
    echo "❌ Database connection failed!<br>";
    echo "Check your Railway MySQL service and variables.";
}
?>
