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

$id = $_POST['id'] ?? 0;
$firstName = $_POST['first_name'] ?? '';
$middleName = $_POST['middle_name'] ?? '';
$lastName = $_POST['last_name'] ?? '';
$dateOfBirth = $_POST['dob'] ?? '';
$sex = $_POST['sex'] ?? '';
$purok = $_POST['purok'] ?? '';
$address = $_POST['address'] ?? '';
$mobile = $_POST['mobile'] ?? '';
$household = $_POST['household'] ?? '';
$emergencyContact = $_POST['emergency_contact'] ?? '';
$emergencyNumber = $_POST['emergency_number'] ?? '';
$medicalHistory = $_POST['medical_history'] ?? '';

try {
    $stmt = $pdo->prepare("
        UPDATE residents 
        SET first_name = ?, middle_name = ?, last_name = ?, date_of_birth = ?, sex = ?, 
            purok = ?, address = ?, mobile_number = ?, household = ?, 
            emergency_contact = ?, emergency_number = ?, medical_history = ?
        WHERE id = ?
    ");
    $result = $stmt->execute([
        $firstName, $middleName, $lastName, $dateOfBirth, $sex, $purok,
        $address, $mobile, $household, $emergencyContact, $emergencyNumber,
        $medicalHistory, $id
    ]);

    if ($result && $stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Resident updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No changes made or resident not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>