<?php
// ========================================
// CHECK SESSION - For AJAX calls
// ========================================

session_start();

header('Content-Type: application/json');

$response = [
    'logged_in' => isset($_SESSION['user_id']) && $_SESSION['role'] === 'official'
];

echo json_encode($response);
?>