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
    // Get filter parameters
    $search = isset($_GET['search']) ? '%' . $_GET['search'] . '%' : '%';
    $purok = isset($_GET['purok']) && $_GET['purok'] !== '' ? $_GET['purok'] : null;
    $vaccineType = isset($_GET['vaccine_type']) && $_GET['vaccine_type'] !== '' ? $_GET['vaccine_type'] : null;
    $doseFilter = isset($_GET['dose']) && $_GET['dose'] !== '' ? $_GET['dose'] : null;
    $dateFilter = isset($_GET['date']) && $_GET['date'] !== '' ? $_GET['date'] : null;
    $statusFilter = isset($_GET['status']) && $_GET['status'] !== '' ? $_GET['status'] : null;

    // FIXED: Use 'resident_id' since that's the column name in the table
    $sql = "
        SELECT 
            i.id,
            i.resident_id,
            i.vaccine,
            i.dose,
            i.date_administered,
            i.next_dose_date AS next_dose,
            i.status,
            i.notes,
            i.created_at,
            CONCAT(r.first_name, ' ', IFNULL(r.middle_name, ''), ' ', r.last_name) AS child_name,
            TIMESTAMPDIFF(YEAR, r.date_of_birth, CURDATE()) AS child_age,
            TIMESTAMPDIFF(MONTH, r.date_of_birth, CURDATE()) AS child_age_months,
            r.purok AS child_purok,
            CONCAT(p.first_name, ' ', IFNULL(p.middle_name, ''), ' ', p.last_name) AS parent_name,
            p.mobile_number AS parent_contact,
            p.id AS parent_id,
            r.parent_id AS child_parent_id,
            r.relationship
        FROM immunization_records i
        LEFT JOIN residents r ON i.resident_id = r.id
        LEFT JOIN residents p ON r.parent_id = p.id
        WHERE 1=1
    ";

    $params = [];

    // Fix: Proper search condition
    if (isset($_GET['search']) && $_GET['search'] !== '') {
        $sql .= " AND (r.first_name LIKE ? OR r.last_name LIKE ? OR CONCAT(r.first_name, ' ', r.last_name) LIKE ?)";
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
    }

    if ($purok) {
        $sql .= " AND r.purok = ?";
        $params[] = $purok;
    }

    if ($vaccineType) {
        $sql .= " AND i.vaccine = ?";
        $params[] = $vaccineType;
    }

    if ($doseFilter) {
        $sql .= " AND i.dose = ?";
        $params[] = $doseFilter;
    }

    if ($dateFilter) {
        $sql .= " AND DATE(i.date_administered) = ?";
        $params[] = $dateFilter;
    }

    if ($statusFilter) {
        $sql .= " AND i.status = ?";
        $params[] = $statusFilter;
    }

    $sql .= " ORDER BY i.date_administered DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $records = $stmt->fetchAll();

    // Format records for JavaScript
    $formattedRecords = array_map(function($row) {
        // Fix: If no child_name, try using resident_id
        if (empty($row['child_name']) && !empty($row['resident_id'])) {
            $row['child_name'] = 'Unknown Child';
        }
        
        // Ensure status is set
        if (empty($row['status'])) {
            $row['status'] = 'Upcoming';
        }
        
        // FIXED: Proper age display (months for infants, years for older)
        if (isset($row['child_age']) && $row['child_age'] > 0) {
            if ($row['child_age'] < 1 && isset($row['child_age_months'])) {
                $row['child_age_display'] = $row['child_age_months'] . ' mos';
            } else {
                $row['child_age_display'] = $row['child_age'] . ' yr' . ($row['child_age'] > 1 ? 's' : '');
            }
        } else if (isset($row['child_age_months']) && $row['child_age_months'] > 0) {
            $row['child_age_display'] = $row['child_age_months'] . ' mos';
        } else {
            $row['child_age_display'] = '—';
        }
        
        // If no parent, show '—'
        if (empty($row['parent_name']) || $row['parent_name'] === '') {
            $row['parent_name'] = '—';
            $row['parent_contact'] = '—';
        }
        
        return $row;
    }, $records);

    echo json_encode(['success' => true, 'records' => $formattedRecords]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage(), 'records' => []]);
}
?>