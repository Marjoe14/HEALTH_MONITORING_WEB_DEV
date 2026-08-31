<?php
// ========================================
// GET RESIDENT HEALTH RECORDS (Including Family Members)
// ========================================

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'resident') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

$pdo = getDBConnection();
if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}

$userId = $_SESSION['user_id'];

try {
    // Get resident ID
    $stmt = $pdo->prepare("SELECT id, first_name, last_name FROM residents WHERE user_id = ?");
    $stmt->execute([$userId]);
    $resident = $stmt->fetch();
    
    if (!$resident) {
        echo json_encode(['success' => false, 'message' => 'Resident not found']);
        exit();
    }
    
    $residentId = $resident['id'];
    $residentName = $resident['first_name'] . ' ' . $resident['last_name'];
    
    // ============================================================
    // GET ALL FAMILY MEMBERS (Children of this resident)
    // ============================================================
    $familyStmt = $pdo->prepare("
        SELECT 
            id, 
            first_name, 
            middle_name, 
            last_name,
            relationship,
            CONCAT(first_name, ' ', last_name) AS full_name
        FROM residents 
        WHERE parent_id = ?
        ORDER BY first_name
    ");
    $familyStmt->execute([$residentId]);
    $familyMembers = $familyStmt->fetchAll();
    
    // Build list of resident IDs to fetch records for (resident + family members)
    $residentIds = [$residentId];
    $familyMap = [];
    
    // Add family members
    foreach ($familyMembers as $member) {
        $residentIds[] = $member['id'];
        $familyMap[$member['id']] = [
            'name' => $member['full_name'],
            'relationship' => $member['relationship']
        ];
    }
    
    // Create placeholders for IN clause
    $placeholders = implode(',', array_fill(0, count($residentIds), '?'));
    
    // ============================================================
    // BMI RECORDS WITH FAMILY INFO
    // ============================================================
    $bmiStmt = $pdo->prepare("
        SELECT 
            b.resident_id,
            b.height,
            b.weight,
            b.bmi,
            b.category,
            b.recorded_at AS date,
            CONCAT(bhw.first_name, ' ', bhw.last_name) AS bhw_name,
            CONCAT(r.first_name, ' ', r.last_name) AS resident_name,
            r.relationship
        FROM bmi_records b
        LEFT JOIN residents r ON b.resident_id = r.id
        LEFT JOIN bhw ON b.recorded_by = bhw.user_id
        WHERE b.resident_id IN ($placeholders)
        ORDER BY b.recorded_at DESC
    ");
    $bmiStmt->execute($residentIds);
    $bmiRecords = $bmiStmt->fetchAll();
    
    // ============================================================
    // PRENATAL RECORDS WITH FAMILY INFO
    // ============================================================
    $prenatalStmt = $pdo->prepare("
        SELECT 
            p.resident_id,
            p.lmp,
            p.due_date,
            p.gestational_age,
            p.checkup_date AS date,
            p.status,
            CONCAT(bhw.first_name, ' ', bhw.last_name) AS bhw_name,
            CONCAT(r.first_name, ' ', r.last_name) AS resident_name,
            r.relationship
        FROM prenatal_records p
        LEFT JOIN residents r ON p.resident_id = r.id
        LEFT JOIN bhw ON p.recorded_by = bhw.user_id
        WHERE p.resident_id IN ($placeholders)
        ORDER BY p.checkup_date DESC
    ");
    $prenatalStmt->execute($residentIds);
    $prenatalRecords = $prenatalStmt->fetchAll();
    
    // ============================================================
    // IMMUNIZATION RECORDS WITH FAMILY INFO
    // ============================================================
    $immunizationStmt = $pdo->prepare("
        SELECT 
            i.resident_id,
            i.vaccine,
            i.dose,
            i.date_administered AS date,
            i.status,
            CONCAT(bhw.first_name, ' ', bhw.last_name) AS bhw_name,
            CONCAT(r.first_name, ' ', r.last_name) AS resident_name,
            r.relationship
        FROM immunization_records i
        LEFT JOIN residents r ON i.resident_id = r.id
        LEFT JOIN bhw ON i.recorded_by = bhw.user_id
        WHERE i.resident_id IN ($placeholders)
        ORDER BY i.date_administered DESC
    ");
    $immunizationStmt->execute($residentIds);
    $immunizationRecords = $immunizationStmt->fetchAll();
    
    // ============================================================
    // OPT RECORDS WITH FAMILY INFO
    // ============================================================
    $optStmt = $pdo->prepare("
        SELECT 
            o.resident_id,
            o.weight,
            o.height,
            o.nutritional_status,
            o.recorded_date AS date,
            CONCAT(bhw.first_name, ' ', bhw.last_name) AS bhw_name,
            CONCAT(r.first_name, ' ', r.last_name) AS resident_name,
            r.relationship
        FROM opt_records o
        LEFT JOIN residents r ON o.resident_id = r.id
        LEFT JOIN bhw ON o.recorded_by = bhw.user_id
        WHERE o.resident_id IN ($placeholders)
        ORDER BY o.recorded_date DESC
    ");
    $optStmt->execute($residentIds);
    $optRecords = $optStmt->fetchAll();

    echo json_encode([
        'success' => true,
        'resident_id' => $residentId,
        'resident_name' => $residentName,
        'family_members' => $familyMembers,
        'bmi_records' => $bmiRecords,
        'prenatal_records' => $prenatalRecords,
        'immunization_records' => $immunizationRecords,
        'opt_records' => $optRecords
    ]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>