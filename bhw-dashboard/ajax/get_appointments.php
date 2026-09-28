<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'bhw') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized', 'records' => []]);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

$pdo = getDBConnection();
if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed', 'records' => []]);
    exit();
}

try {
    $sql = "
        SELECT 
            a.id,
            a.resident_id,
            a.appointment_date,
            a.appointment_time,
            a.type,
            a.location,
            a.status,
            a.notes,
            a.scheduled_by,
            a.created_at,
            a.updated_at,
            a.cancellation_requested,
            a.cancellation_reason,
            a.cancellation_notes,
            a.cancellation_status,
            a.cancellation_requested_at,
            a.cancellation_approved_at,
            CONCAT(r.first_name, ' ', IFNULL(r.middle_name, ''), ' ', r.last_name) AS resident_name,
            r.purok,
            r.mobile_number
        FROM appointments a
        LEFT JOIN residents r ON a.resident_id = r.id
        ORDER BY a.appointment_date DESC, a.appointment_time ASC
    ";

    $stmt = $pdo->query($sql);
    $records = $stmt->fetchAll();

    $formattedRecords = array_map(function($row) {
        // Format date for display
        $dateDisplay = '—';
        if (!empty($row['appointment_date']) && $row['appointment_date'] !== '0000-00-00') {
            try {
                $dateObj = new DateTime($row['appointment_date']);
                $dateDisplay = $dateObj->format('M d, Y');
            } catch (Exception $e) {
                $dateDisplay = $row['appointment_date'];
            }
        }
        
        // Format time for display
        $timeDisplay = '—';
        if (!empty($row['appointment_time'])) {
            $timeDisplay = $row['appointment_time'];
        }
        
        return [
            'id' => (int)$row['id'],
            'resident_id' => (int)$row['resident_id'],
            'resident_name' => $row['resident_name'] ?? 'Unknown',
            'date' => $dateDisplay,
            'time' => $timeDisplay,
            'type' => $row['type'] ?? 'General Check-up',
            'location' => $row['location'] ?? 'Barangay Health Center',
            'status' => $row['status'] ?? 'Upcoming',
            'notes' => $row['notes'] ?? '',
            'scheduled_by' => $row['scheduled_by'] ?? null,
            'created_at' => $row['created_at'] ?? date('Y-m-d H:i:s'),
            'updated_at' => $row['updated_at'] ?? date('Y-m-d H:i:s'),
            'cancellation_requested' => (bool)$row['cancellation_requested'],
            'cancellation_reason' => $row['cancellation_reason'] ?? '',
            'cancellation_notes' => $row['cancellation_notes'] ?? '',
            'cancellation_status' => $row['cancellation_status'] ?? '',
            'cancellation_requested_at' => $row['cancellation_requested_at'] ?? null,
            'cancellation_approved_at' => $row['cancellation_approved_at'] ?? null
        ];
    }, $records);

    echo json_encode(['success' => true, 'records' => $formattedRecords]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage(), 'records' => []]);
}
?>