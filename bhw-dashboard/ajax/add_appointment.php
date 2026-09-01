<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'bhw') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/sms_config.php';

$pdo = getDBConnection();
if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}

$residentId = $_POST['resident_id'] ?? 0;
$date = $_POST['date'] ?? '';
$time = $_POST['time'] ?? '';
$type = $_POST['type'] ?? 'General Check-up';
$location = $_POST['location'] ?? 'Barangay Health Center';
$status = $_POST['status'] ?? 'Upcoming';
$notes = $_POST['notes'] ?? '';
$scheduledBy = $_SESSION['user_id'];

if (!$residentId || !$date || !$time || !$type) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields']);
    exit();
}

try {
    // Start transaction
    $pdo->beginTransaction();

    // Insert appointment
    $stmt = $pdo->prepare("
        INSERT INTO appointments 
        (resident_id, appointment_date, appointment_time, type, location, status, notes, scheduled_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $result = $stmt->execute([
        $residentId,
        $date,
        $time,
        $type,
        $location,
        $status,
        $notes,
        $scheduledBy
    ]);

    if (!$result) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Failed to schedule appointment']);
        exit();
    }

    $appointmentId = $pdo->lastInsertId();

    // ============================================================
    // GET RESIDENT DETAILS FOR NOTIFICATIONS
    // ============================================================
    $stmt = $pdo->prepare("
        SELECT 
            r.id,
            r.first_name,
            r.last_name,
            r.mobile_number,
            r.user_id,
            r.parent_id,
            p.mobile_number AS parent_mobile,
            u.id AS has_account
        FROM residents r
        LEFT JOIN residents p ON r.parent_id = p.id
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
    ");
    $stmt->execute([$residentId]);
    $resident = $stmt->fetch();

    if (!$resident) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Resident not found']);
        exit();
    }

    $residentName = $resident['first_name'] . ' ' . $resident['last_name'];
    $hasAccount = !empty($resident['has_account']);
    
    // Get mobile number (use parent's if child has no mobile)
    $mobileNumber = $resident['mobile_number'] ?? $resident['parent_mobile'] ?? null;

    // ============================================================
    // SEND SMS (if mobile number exists)
    // ============================================================
    $smsSent = false;
    if ($mobileNumber) {
        $smsMessage = getAppointmentSMSMessage($residentName, $date, $time, $type, $location);
        $smsResult = sendSemaphoreSMS($mobileNumber, $smsMessage);
        $smsSent = $smsResult['success'];
    }

    // ============================================================
    // CREATE DASHBOARD NOTIFICATION (if resident has account)
    // ============================================================
    $notificationSent = false;
    if ($hasAccount) {
        $notifData = createAppointmentNotification(
            $residentId,
            $residentName,
            $date,
            $time,
            $type,
            $status
        );
        
        $stmt = $pdo->prepare("
            INSERT INTO notifications 
            (user_id, resident_id, type, title, message, link, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        $notificationSent = $stmt->execute([
            $resident['user_id'],
            $residentId,
            $notifData['type'],
            $notifData['title'],
            $notifData['message'],
            $notifData['link']
        ]);
    }

    // Commit transaction
    $pdo->commit();

    echo json_encode([
        'success' => true, 
        'id' => $appointmentId, 
        'message' => 'Appointment scheduled successfully',
        'sms_sent' => $smsSent,
        'notification_sent' => $notificationSent,
        'has_account' => $hasAccount,
        'mobile_number' => $mobileNumber ? '***' . substr($mobileNumber, -4) : null
    ]);

} catch (PDOException $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>