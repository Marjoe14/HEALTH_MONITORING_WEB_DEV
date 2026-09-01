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
$appointmentId = $_POST['appointment_id'] ?? 0;
$reason = $_POST['reason'] ?? '';
$details = $_POST['details'] ?? '';

if (!$appointmentId || !$reason) {
    echo json_encode(['success' => false, 'message' => 'Please provide all required information']);
    exit();
}

try {
    // Verify appointment belongs to this resident and is upcoming
    $stmt = $pdo->prepare("
        SELECT a.id, a.status, r.user_id, r.first_name, r.last_name, r.id as resident_id
        FROM appointments a
        JOIN residents r ON a.resident_id = r.id
        WHERE a.id = ? AND r.user_id = ? AND a.status = 'Upcoming'
    ");
    $stmt->execute([$appointmentId, $userId]);
    $appointment = $stmt->fetch();

    if (!$appointment) {
        echo json_encode(['success' => false, 'message' => 'Appointment not found or cannot be cancelled']);
        exit();
    }

    // Update appointment with cancellation request
    $stmt = $pdo->prepare("
        UPDATE appointments 
        SET cancellation_requested = 1,
            cancellation_reason = ?,
            cancellation_notes = ?,
            cancellation_status = 'pending',
            cancellation_requested_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$reason, $details, $appointmentId]);

    // ============================================================
    // 🔥 CREATE NOTIFICATION FOR ALL BHWs
    // ============================================================
    $residentName = $appointment['first_name'] . ' ' . $appointment['last_name'];
    
    // Get all BHW user IDs
    $bhwStmt = $pdo->prepare("SELECT id FROM users WHERE role = 'bhw' AND status = 'active'");
    $bhwStmt->execute();
    $bhwUsers = $bhwStmt->fetchAll();

    // 🔥 Check if there are BHW users
    if (empty($bhwUsers)) {
        error_log("No BHW users found to send notifications to.");
    } else {
        $notifTitle = 'New Cancellation Request';
        $notifMessage = $residentName . ' has requested to cancel their appointment. Reason: ' . $reason;
        $notifLink = '../bhw-dashboard/#appointments';

        foreach ($bhwUsers as $bhw) {
            $notifStmt = $pdo->prepare("
                INSERT INTO bhw_notifications 
                (user_id, type, title, message, link, created_at)
                VALUES (?, 'cancellation', ?, ?, ?, NOW())
            ");
            $notifStmt->execute([$bhw['id'], $notifTitle, $notifMessage, $notifLink]);
        }
    }

    echo json_encode([
        'success' => true, 
        'message' => 'Cancellation request submitted successfully',
        'bhw_notified' => count($bhwUsers)
    ]);
} catch (PDOException $e) {
    error_log("Error in request_cancellation.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>