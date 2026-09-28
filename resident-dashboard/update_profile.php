<?php
// ========================================
// UPDATE PROFILE - Resident
// ========================================

session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'resident') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

// Include database configuration
require_once __DIR__ . '/../config/database.php';

// Get POST data
$firstName = trim($_POST['first_name'] ?? '');
$middleName = trim($_POST['middle_name'] ?? '');
$lastName = trim($_POST['last_name'] ?? '');
$mobile = trim($_POST['mobile'] ?? '');
$email = trim($_POST['email'] ?? '');
$purok = trim($_POST['purok'] ?? '');
$address = trim($_POST['address'] ?? '');
$household = trim($_POST['household'] ?? '');
$userId = $_SESSION['user_id'];

// Validate
if (empty($firstName) || empty($lastName)) {
    echo json_encode(['success' => false, 'message' => 'First name and last name are required.']);
    exit();
}

try {
    $pdo = getDBConnection();
    
    if ($pdo === null) {
        echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
        exit();
    }
    
    // Update resident record
    $stmt = $pdo->prepare("
        UPDATE residents 
        SET first_name = ?, middle_name = ?, last_name = ?, 
            mobile_number = ?, email = ?, purok = ?, 
            address = ?, household = ?
        WHERE user_id = ?
    ");
    
    $stmt->execute([
        $firstName,
        $middleName ?: null,
        $lastName,
        $mobile ?: null,
        $email ?: null,
        $purok ?: null,
        $address ?: null,
        $household ?: null,
        $userId
    ]);
    
    // Update session data
    $_SESSION['first_name'] = $firstName;
    $_SESSION['last_name'] = $lastName;
    $_SESSION['full_name'] = trim($firstName . ' ' . $lastName);
    
    echo json_encode(['success' => true, 'message' => 'Profile updated successfully.']);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Update failed: ' . $e->getMessage()]);
}
?>