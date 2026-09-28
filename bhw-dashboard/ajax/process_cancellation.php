<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'bhw') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

$pdo = getDBConnection();
if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}

$appointmentId = $_POST['appointment_id'] ?? 0;
$decision = $_POST['decision'] ?? '';
$notes = $_POST['notes'] ?? '';

if (!$appointmentId || !$decision) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit();
}

if (!in_array($decision, ['approve', 'reject'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid decision']);
    exit();
}

try {
    // Verify appointment exists and has pending cancellation
    $stmt = $pdo->prepare("
        SELECT 
            a.id, 
            a.resident_id, 
            a.appointment_date,
            a.cancellation_reason,
            r.first_name,
            r.last_name,
            r.user_id AS resident_user_id,
            r.mobile_number
        FROM appointments a
        JOIN residents r ON a.resident_id = r.id
        WHERE a.id = ? AND a.cancellation_status = 'pending'
    ");
    $stmt->execute([$appointmentId]);
    $appointment = $stmt->fetch();

    if (!$appointment) {
        echo json_encode(['success' => false, 'message' => 'Appointment not found or no pending request']);
        exit();
    }

    $residentName = $appointment['first_name'] . ' ' . $appointment['last_name'];
    $residentUserId = $appointment['resident_user_id'];

    if ($decision === 'approve') {
        // Approve cancellation
        $stmt = $pdo->prepare("
            UPDATE appointments 
            SET status = 'Cancelled',
                cancellation_status = 'approved',
                cancellation_approved_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$appointmentId]);
        $message = 'Cancellation approved. Appointment has been cancelled.';
        $notifType = 'approved';
        $notifTitle = '✅ Cancellation Approved';
        $notifMessage = 'Your cancellation request for the appointment on ' . $appointment['appointment_date'] . ' has been APPROVED.';
    } else {
        // Reject cancellation
        $stmt = $pdo->prepare("
            UPDATE appointments 
            SET cancellation_status = 'rejected',
                cancellation_requested = 0
            WHERE id = ?
        ");
        $stmt->execute([$appointmentId]);
        $message = 'Cancellation rejected. Appointment remains scheduled.';
        $notifType = 'rejected';
        $notifTitle = '❌ Cancellation Rejected';
        $notifMessage = 'Your cancellation request for the appointment on ' . $appointment['appointment_date'] . ' has been REJECTED. Reason: ' . ($notes ?: 'Please contact the BHW for details.');
    }

    // Create notification for the resident
    if ($residentUserId) {
        $notifStmt = $pdo->prepare("
            INSERT INTO notifications 
            (user_id, resident_id, type, title, message, link, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        $notifStmt->execute([
            $residentUserId,
            $appointment['resident_id'],
            $notifType,
            $notifTitle,
            $notifMessage,
            '../resident-dashboard/#appointments'
        ]);
    }

    echo json_encode(['success' => true, 'message' => $message]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>