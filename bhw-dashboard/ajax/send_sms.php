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

$recipientIds = $_POST['recipient_ids'] ?? '';
$message = $_POST['message'] ?? '';
$recipientLabel = $_POST['recipient_label'] ?? '';

if (empty($recipientIds) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Missing recipient or message']);
    exit();
}

$ids = array_filter(explode(',', $recipientIds));
$placeholders = implode(',', array_fill(0, count($ids), '?'));

try {
    // Get residents with mobile numbers
    $stmt = $pdo->prepare("
        SELECT id, mobile_number FROM residents 
        WHERE id IN ($placeholders) 
        AND mobile_number IS NOT NULL 
        AND mobile_number != ''
    ");
    $stmt->execute($ids);
    $residents = $stmt->fetchAll();
    
    $sentCount = 0;
    $failedCount = 0;
    $totalRecipients = count($residents);
    
    if ($totalRecipients === 0) {
        echo json_encode(['success' => false, 'message' => 'No valid mobile numbers found']);
        exit();
    }
    
    // Send SMS to each resident and log individually
    foreach ($residents as $resident) {
        $mobileNumber = $resident['mobile_number'];
        $residentId = $resident['id'];
        
        // Send SMS using IProg API
        $result = sendIProgSMS($mobileNumber, $message);
        $status = $result['success'] ? 'Sent' : 'Failed';
        
        if ($result['success']) {
            $sentCount++;
        } else {
            $failedCount++;
        }
        
        // Log each SMS in sms_logs table (matching your exact table structure)
        $logStmt = $pdo->prepare("
            INSERT INTO sms_logs 
            (resident_id, recipient_number, message, status, sent_at, sent_by)
            VALUES (?, ?, ?, ?, NOW(), ?)
        ");
        $logStmt->execute([
            $residentId,
            $mobileNumber,
            $message,
            $status,
            $_SESSION['user_id']
        ]);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'SMS sent to ' . $sentCount . ' recipients' . ($failedCount > 0 ? ' (' . $failedCount . ' failed)' : ''),
        'recipients' => $sentCount,
        'failed' => $failedCount,
        'total' => $totalRecipients
    ]);
    
} catch (PDOException $e) {
    error_log("SMS Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>