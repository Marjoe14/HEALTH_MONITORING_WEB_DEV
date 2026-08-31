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
            p.id,
            p.resident_id,
            p.lmp,
            p.due_date,
            p.gestational_age,
            p.status,
            p.milestone_notes,
            p.vital_signs,
            p.next_checkup,
            p.delivery_date,
            p.created_at,
            CONCAT(r.first_name, ' ', IFNULL(r.middle_name, ''), ' ', r.last_name) AS resident_name,
            r.purok,
            r.mobile_number
        FROM prenatal_records p
        LEFT JOIN residents r ON p.resident_id = r.id
        ORDER BY p.created_at DESC
    ";

    $stmt = $pdo->query($sql);
    $records = $stmt->fetchAll();

    $formattedRecords = array_map(function($row) {
        return [
            'id' => $row['id'],
            'residentId' => $row['resident_id'],
            'residentName' => $row['resident_name'] ?? 'Unknown',
            'purok' => $row['purok'] ?? '—',
            'mobile' => $row['mobile_number'] ?? '—',
            'lmp' => $row['lmp'] ?? '—',
            'dueDate' => $row['due_date'] ?? '—',
            'gestationalAge' => $row['gestational_age'] ?? 0,
            'status' => $row['status'] ?? 'Active',
            'milestoneNotes' => $row['milestone_notes'] ?? '',
            'vitalSigns' => $row['vital_signs'] ?? '',
            'nextCheckup' => $row['next_checkup'] ?? '',
            'deliveryDate' => $row['delivery_date'] ?? null,
            'created_at' => $row['created_at'] ?? date('Y-m-d H:i:s')
        ];
    }, $records);

    echo json_encode(['success' => true, 'records' => $formattedRecords]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage(), 'records' => []]);
}
?>