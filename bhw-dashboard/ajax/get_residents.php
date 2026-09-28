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
    // Fetch all residents with parent info
    $sql = "
        SELECT 
            r.id,
            r.first_name,
            r.middle_name,
            r.last_name,
            r.date_of_birth AS dob,
            TIMESTAMPDIFF(YEAR, r.date_of_birth, CURDATE()) AS age_years,
            TIMESTAMPDIFF(MONTH, r.date_of_birth, CURDATE()) AS age_months,
            r.sex,
            r.purok,
            r.address,
            r.mobile_number AS mobile,
            r.household,
            r.emergency_contact,
            r.emergency_number,
            r.medical_history,
            r.created_at,
            r.parent_id,
            r.relationship,
            u.id AS user_id,
            u.username,
            CONCAT(p.first_name, ' ', IFNULL(p.middle_name, ''), ' ', p.last_name) AS parent_name,
            p.mobile_number AS parent_contact,
            CASE 
                WHEN u.id IS NOT NULL THEN 'Has Account'
                ELSE 'No Account'
            END AS account_status
        FROM residents r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN residents p ON r.parent_id = p.id
        ORDER BY r.first_name
    ";

    $stmt = $pdo->query($sql);
    $records = $stmt->fetchAll();

    // Format records
    $formattedRecords = array_map(function($row) {
        // Format age display
        if (isset($row['age_years']) && $row['age_years'] > 0) {
            if ($row['age_years'] < 1 && isset($row['age_months'])) {
                $row['age_display'] = $row['age_months'] . ' mos';
            } else {
                $row['age_display'] = $row['age_years'] . ' yr' . ($row['age_years'] > 1 ? 's' : '');
            }
        } else if (isset($row['age_months']) && $row['age_months'] > 0) {
            $row['age_display'] = $row['age_months'] . ' mos';
        } else {
            $row['age_display'] = '—';
        }
        
        // Determine type
        if (isset($row['age_years'])) {
            if ($row['age_years'] < 18) {
                $row['type'] = 'Child';
            } else if ($row['age_years'] >= 60) {
                $row['type'] = 'Elderly';
            } else {
                $row['type'] = 'Adult';
            }
        } else {
            $row['type'] = 'Unknown';
        }
        
        // Ensure parent name is set
        if (empty($row['parent_name'])) {
            $row['parent_name'] = null;
        }
        
        return $row;
    }, $records);

    echo json_encode(['success' => true, 'records' => $formattedRecords]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage(), 'records' => []]);
}
?>