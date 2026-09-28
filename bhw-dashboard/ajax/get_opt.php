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
            o.id,
            o.resident_id,
            o.weight,
            o.height,
            o.nutritional_status,
            o.recorded_date AS date,
            o.notes,
            o.created_at,
            CONCAT(r.first_name, ' ', IFNULL(r.middle_name, ''), ' ', r.last_name) AS child_name,
            TIMESTAMPDIFF(YEAR, r.date_of_birth, CURDATE()) AS child_age,
            TIMESTAMPDIFF(MONTH, r.date_of_birth, CURDATE()) AS child_age_months,
            r.purok,
            CONCAT(p.first_name, ' ', IFNULL(p.middle_name, ''), ' ', p.last_name) AS parent_name
        FROM opt_records o
        LEFT JOIN residents r ON o.resident_id = r.id
        LEFT JOIN residents p ON r.parent_id = p.id
        ORDER BY o.recorded_date DESC
    ";

    $stmt = $pdo->query($sql);
    $records = $stmt->fetchAll();

    $formattedRecords = array_map(function($row) {
        // ✅ Return JUST the number, NO "yrs" or "mos"
        if (isset($row['child_age']) && $row['child_age'] > 0) {
            // Just the number (e.g., 2, 3, 5)
            $row['child_age_display'] = $row['child_age'];
        } else if (isset($row['child_age_months']) && $row['child_age_months'] > 0) {
            // Just the number for months too (e.g., 6, 10, 11)
            $row['child_age_display'] = $row['child_age_months'];
        } else {
            $row['child_age_display'] = '—';
        }
        
        if (empty($row['parent_name'])) {
            $row['parent_name'] = '—';
        }
        
        return $row;
    }, $records);

    echo json_encode(['success' => true, 'records' => $formattedRecords]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage(), 'records' => []]);
}
?>