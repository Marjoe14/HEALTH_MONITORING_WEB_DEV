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

$firstName = $_POST['first_name'] ?? '';
$middleName = $_POST['middle_name'] ?? '';
$lastName = $_POST['last_name'] ?? '';
$dob = $_POST['dob'] ?? '';
$sex = $_POST['sex'] ?? 'Male';
$purok = $_POST['purok'] ?? '';
$address = $_POST['address'] ?? '';
$parentId = $_POST['parent_id'] ?? '';
$relationship = $_POST['relationship'] ?? '';

try {
    // Insert child with relationship
    $stmt = $pdo->prepare("
        INSERT INTO residents 
        (first_name, middle_name, last_name, date_of_birth, sex, purok, address, parent_id, relationship, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $result = $stmt->execute([
        $firstName, $middleName, $lastName, $dob, $sex, $purok,
        $address, $parentId, $relationship
    ]);

    if ($result) {
        $childId = $pdo->lastInsertId();
        echo json_encode([
            'success' => true, 
            'id' => $childId, 
            'message' => 'Child added successfully',
            'child_id' => $childId
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add child']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>