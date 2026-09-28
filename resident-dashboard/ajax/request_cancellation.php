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
        SELECT 
            a.id, 
            a.status, 
            a.appointment_date,
            a.appointment_time,
            a.type,
            a.location,
            r.user_id, 
            r.id as resident_id,
            r.first_name, 
            r.last_name
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

    $residentName = $appointment['first_name'] . ' ' . $appointment['last_name'];
    $residentId = $appointment['resident_id'];
    $residentUserId = $appointment['user_id'];

    // ============================================================
    // NOTIFICATION FOR THE RESIDENT (confirmation)
    // ============================================================
    $residentNotifTitle = '📋 Cancellation Request Submitted';
    $residentNotifMessage = 'Your cancellation request for the appointment on ' 
        . $appointment['appointment_date'] . ' at ' 
        . ($appointment['appointment_time'] ?: 'scheduled time') 
        . ' has been submitted. Please wait for BHW approval.';

    $notifStmt = $pdo->prepare("
        INSERT INTO notifications 
        (user_id, resident_id, type, title, message, link, created_at)
        VALUES (?, ?, 'appointment', ?, ?, '../resident-dashboard/#appointments', NOW())
    ");
    $notifStmt->execute([
        $residentUserId,
        $residentId,
        $residentNotifTitle,
        $residentNotifMessage
    ]);

    // ============================================================
    // NOTIFICATION FOR ALL BHWs
    // ============================================================
    $bhwStmt = $pdo->prepare("SELECT id FROM users WHERE role = 'bhw' AND status = 'active'");
    $bhwStmt->execute();
    $bhwUsers = $bhwStmt->fetchAll();

    if (!empty($bhwUsers)) {
        $bhwNotifTitle = 'New Cancellation Request';
        $bhwNotifMessage = $residentName . ' has requested to cancel their appointment. Reason: ' . $reason;
        $bhwNotifLink = '../bhw-dashboard/#appointments';

        foreach ($bhwUsers as $bhw) {
            $bhwNotifStmt = $pdo->prepare("
                INSERT INTO bhw_notifications 
                (user_id, type, title, message, link, created_at)
                VALUES (?, 'cancellation', ?, ?, ?, NOW())
            ");
            $bhwNotifStmt->execute([$bhw['id'], $bhwNotifTitle, $bhwNotifMessage, $bhwNotifLink]);
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