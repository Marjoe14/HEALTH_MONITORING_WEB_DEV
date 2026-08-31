<?php
// ========================================
// AJAX HANDLER FOR OFFICIAL DASHBOARD
// ========================================

// Start session
session_start();

// Check if user is logged in as official
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'official') {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Unauthorized access.']);
    exit();
}

// Check if action is set
if (!isset($_POST['action'])) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'No action specified.']);
    exit();
}

// Include database configuration
require_once __DIR__ . '/../config/database.php';

$pdo = getDBConnection();

if (!$pdo) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit();
}

$action = $_POST['action'];

// ============================================================
// ADD BHW
// ============================================================
if ($action === 'add_bhw') {
    $firstName = trim($_POST['first_name'] ?? '');
    $middleName = trim($_POST['middle_name'] ?? '');
    $lastName = trim($_POST['last_name'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    $contact = trim($_POST['contact'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $purok = trim($_POST['purok'] ?? '');
    $role = $_POST['role'] ?? 'bhw';
    
    // Validate
    $errors = [];
    
    if (empty($firstName)) $errors[] = 'First name is required.';
    if (empty($lastName)) $errors[] = 'Last name is required.';
    if (empty($username)) $errors[] = 'Username is required.';
    if (empty($password)) $errors[] = 'Password is required.';
    if ($password !== $confirmPassword) $errors[] = 'Passwords do not match.';
    if (strlen($password) < 6) $errors[] = 'Password must be at least 6 characters.';
    
    if (!empty($errors)) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
        exit();
    }
    
    try {
        // Check if username already exists
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $checkStmt->execute([$username]);
        if ($checkStmt->fetch()) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Username already taken.']);
            exit();
        }
        
        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Insert user
        $pdo->beginTransaction();
        
        $userStmt = $pdo->prepare("
            INSERT INTO users (username, password, role, status) 
            VALUES (?, ?, ?, 'active')
        ");
        $userStmt->execute([$username, $hashedPassword, $role]);
        $userId = $pdo->lastInsertId();
        
        // Insert BHW
        $bhwStmt = $pdo->prepare("
            INSERT INTO bhw (user_id, first_name, middle_name, last_name, contact_number, email, assigned_purok) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $bhwStmt->execute([
            $userId,
            $firstName,
            $middleName,
            $lastName,
            $contact,
            $email,
            $purok ?: null
        ]);
        
        $pdo->commit();
        
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true, 
            'message' => 'BHW account created successfully!'
        ]);
        
    } catch (PDOException $e) {
        $pdo->rollBack();
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false, 
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
    exit();
}

// ============================================================
// DEACTIVATE BHW
// ============================================================
if ($action === 'deactivate_bhw') {
    $userId = $_POST['user_id'] ?? 0;
    
    if (!$userId) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'User ID required.']);
        exit();
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE users SET status = 'inactive' WHERE id = ? AND role = 'bhw'");
        $stmt->execute([$userId]);
        
        header('Content-Type: application/json');
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'BHW deactivated successfully.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'BHW not found.']);
        }
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Database error.']);
    }
    exit();
}

// ============================================================
// REACTIVATE BHW
// ============================================================
if ($action === 'reactivate_bhw') {
    $userId = $_POST['user_id'] ?? 0;
    
    if (!$userId) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'User ID required.']);
        exit();
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE users SET status = 'active' WHERE id = ? AND role = 'bhw'");
        $stmt->execute([$userId]);
        
        header('Content-Type: application/json');
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'BHW reactivated successfully.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'BHW not found or already active.']);
        }
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Database error.']);
    }
    exit();
}

// ============================================================
// GET BHW DETAILS (for View/Edit)
// ============================================================
if ($action === 'get_bhw') {
    $bhwId = $_POST['bhw_id'] ?? 0;
    
    // Debug log
    error_log("get_bhw called with ID: " . $bhwId);
    
    if (!$bhwId) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'BHW ID required.']);
        exit();
    }
    
    try {
        $stmt = $pdo->prepare("
            SELECT b.*, u.username, u.status 
            FROM bhw b 
            JOIN users u ON b.user_id = u.id 
            WHERE b.id = ?
        ");
        $stmt->execute([$bhwId]);
        $bhw = $stmt->fetch(PDO::FETCH_ASSOC);
        
        header('Content-Type: application/json');
        if ($bhw) {
            echo json_encode(['success' => true, 'data' => $bhw]);
        } else {
            echo json_encode(['success' => false, 'message' => 'BHW not found.']);
        }
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
    exit();
}

// ============================================================
// UPDATE BHW
// ============================================================
if ($action === 'update_bhw') {
    $bhwId = $_POST['bhw_id'] ?? 0;
    $firstName = trim($_POST['first_name'] ?? '');
    $lastName = trim($_POST['last_name'] ?? '');
    $contact = trim($_POST['contact'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $purok = trim($_POST['purok'] ?? '');
    $status = trim($_POST['status'] ?? 'active');
    
    // Debug log
    error_log("update_bhw called with ID: " . $bhwId);
    
    if (!$bhwId || empty($firstName) || empty($lastName)) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Required fields missing.']);
        exit();
    }
    
    try {
        // Start transaction
        $pdo->beginTransaction();
        
        // Update BHW details
        $stmt = $pdo->prepare("
            UPDATE bhw 
            SET first_name = ?, 
                last_name = ?, 
                contact_number = ?, 
                email = ?, 
                assigned_purok = ? 
            WHERE id = ?
        ");
        $stmt->execute([$firstName, $lastName, $contact, $email, $purok ?: null, $bhwId]);
        
        // Also update user status if changed
        $userStmt = $pdo->prepare("
            UPDATE users 
            SET status = ? 
            WHERE id = (SELECT user_id FROM bhw WHERE id = ?)
        ");
        $userStmt->execute([$status, $bhwId]);
        
        $pdo->commit();
        
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => 'BHW updated successfully!']);
        
    } catch (PDOException $e) {
        $pdo->rollBack();
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
    exit();
}

// If no action matched
header('Content-Type: application/json');
echo json_encode(['success' => false, 'message' => 'Invalid action: ' . $action]);
exit();
?>