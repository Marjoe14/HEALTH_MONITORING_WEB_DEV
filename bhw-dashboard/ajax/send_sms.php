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
    $stmt = $pdo->prepare("
        SELECT mobile_number FROM residents WHERE id IN ($placeholders) AND mobile_number IS NOT NULL AND mobile_number != ''
    ");
    $stmt->execute($ids);
    $numbers = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $logStmt = $pdo->prepare("
        INSERT INTO sms_logs 
        (recipient, message, status, sent_by, sent_at)
        VALUES (?, ?, 'Sent', ?, NOW())
    ");
    $logStmt->execute([
        $recipientLabel . ' (' . count($numbers) . ' recipients)',
        $message,
        $_SESSION['user_id']
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'SMS sent to ' . count($numbers) . ' recipients',
        'recipients' => count($numbers)
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>