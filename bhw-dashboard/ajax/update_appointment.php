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

$id = $_POST['id'] ?? 0;
$residentId = $_POST['resident_id'] ?? 0;
$date = $_POST['date'] ?? '';
$time = $_POST['time'] ?? '';
$type = $_POST['type'] ?? '';
$location = $_POST['location'] ?? 'Barangay Health Center';
$status = $_POST['status'] ?? 'Upcoming';
$notes = $_POST['notes'] ?? '';

if (!$id || !$residentId || !$date || !$time || !$type) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields']);
    exit();
}

try {
    $pdo->beginTransaction();

    // Get old appointment data for comparison
    $oldStmt = $pdo->prepare("SELECT * FROM appointments WHERE id = ?");
    $oldStmt->execute([$id]);
    $oldAppointment = $oldStmt->fetch();

    // Update appointment
    $stmt = $pdo->prepare("
        UPDATE appointments 
        SET resident_id = ?, appointment_date = ?, appointment_time = ?, 
            type = ?, location = ?, status = ?, notes = ?, updated_at = NOW()
        WHERE id = ?
    ");
    $result = $stmt->execute([
        $residentId,
        $date,
        $time,
        $type,
        $location,
        $status,
        $notes,
        $id
    ]);

    if (!$result || $stmt->rowCount() == 0) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'No changes made or appointment not found']);
        exit();
    }

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

    if ($resident) {
        $residentName = $resident['first_name'] . ' ' . $resident['last_name'];
        $hasAccount = !empty($resident['has_account']);
        $mobileNumber = $resident['mobile_number'] ?? $resident['parent_mobile'] ?? null;

        // Send SMS if status changed to Upcoming or Completed
        if ($status !== $oldAppointment['status'] || $date !== $oldAppointment['appointment_date']) {
            if ($mobileNumber) {
                $smsMessage = getAppointmentSMSMessage($residentName, $date, $time, $type, $location);
                if ($status === 'Completed') {
                    $smsMessage = "✅ Appointment Completed\n\nDear " . $residentName . ",\n\nYour " . $type . " appointment on " . $date . " at " . $time . " has been marked as COMPLETED.\n\nThank you for visiting Barangay Garsika Health Center!";
                } elseif ($status === 'Cancelled') {
                    $smsMessage = "❌ Appointment Cancelled\n\nDear " . $residentName . ",\n\nYour " . $type . " appointment on " . $date . " at " . $time . " has been CANCELLED.\n\nPlease contact the Barangay Health Center for rescheduling.";
                }
                sendSemaphoreSMS($mobileNumber, $smsMessage);
            }
        }

        // Create dashboard notification if resident has account
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
            $stmt->execute([
                $resident['user_id'],
                $residentId,
                $notifData['type'],
                $notifData['title'],
                $notifData['message'],
                $notifData['link']
            ]);
        }
    }

    $pdo->commit();

    echo json_encode([
        'success' => true, 
        'message' => 'Appointment updated successfully'
    ]);

} catch (PDOException $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>