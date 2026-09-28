<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'resident') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized', 'appointments' => []]);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

$pdo = getDBConnection();
if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed', 'appointments' => []]);
    exit();
}

$userId = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare("SELECT id FROM residents WHERE user_id = ?");
    $stmt->execute([$userId]);
    $resident = $stmt->fetch();
    
    if (!$resident) {
        echo json_encode(['success' => false, 'message' => 'Resident not found', 'appointments' => []]);
        exit();
    }
    
    $residentId = $resident['id'];
    
    $sql = "
        SELECT 
            id,
            appointment_date,
            appointment_time,
            type,
            location,
            status,
            notes,
            cancellation_requested,
            cancellation_reason,
            cancellation_notes,
            cancellation_status,
            cancellation_requested_at
        FROM appointments
        WHERE resident_id = ?
    ";
    
    $params = [$residentId];
    
    if (isset($_GET['status']) && $_GET['status'] !== '') {
        $sql .= " AND status = ?";
        $params[] = $_GET['status'];
    }
    
    if (isset($_GET['date']) && $_GET['date'] !== '') {
        $sql .= " AND appointment_date = ?";
        $params[] = $_GET['date'];
    }
    
    $sql .= " ORDER BY appointment_date DESC, appointment_time ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $appointments = $stmt->fetchAll();

    echo json_encode(['success' => true, 'appointments' => $appointments]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage(), 'appointments' => []]);
}
?>