<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'resident') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

$pdo = getDBConnection();
if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}

$userId = $_SESSION['user_id'];
$appointmentId = $_POST['id'] ?? 0;

try {
    // Verify the appointment belongs to this resident
    $stmt = $pdo->prepare("
        SELECT a.id 
        FROM appointments a
        JOIN residents r ON a.resident_id = r.id
        WHERE a.id = ? AND r.user_id = ?
    ");
    $stmt->execute([$appointmentId, $userId]);
    
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Appointment not found or unauthorized']);
        exit();
    }
    
    // Update status to Cancelled
    $stmt = $pdo->prepare("
        UPDATE appointments 
        SET status = 'Cancelled' 
        WHERE id = ?
    ");
    $stmt->execute([$appointmentId]);

    echo json_encode(['success' => true, 'message' => 'Appointment cancelled successfully']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>