<?php
// ========================================
// SMART COMMUNITY HEALTH MONITORING SYSTEM
// REGISTRATION PAGE - PHP
// ========================================

// Start session
session_start();

// Include database configuration
require_once __DIR__ . '/../config/database.php';

// Initialize variables for form data and error messages
$formData = [
    'firstName' => '',
    'middleName' => '',
    'lastName' => '',
    'username' => '',
    'mobileNumber' => '',
    'email' => '',
    'dob' => '',
    'sex' => '',
    'purok' => '',
    'address' => '',
    'household' => '',
    'medicalHistory' => '',
    'emergencyContact' => '',
    'emergencyNumber' => '',
    'conditions' => []
];

$error = '';
$success = false;
$registrationData = null;

// Check if form was submitted via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Sanitize and collect form data
    $firstName = trim($_POST['firstName'] ?? '');
    $middleName = trim($_POST['middleName'] ?? '');
    $lastName = trim($_POST['lastName'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirmPassword'] ?? '';
    $mobileNumber = trim($_POST['mobileNumber'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $dob = $_POST['dob'] ?? '';
    $sex = $_POST['sex'] ?? '';
    $purok = $_POST['purok'] ?? '';
    $address = trim($_POST['address'] ?? '');
    $household = trim($_POST['household'] ?? '');
    $medicalHistory = trim($_POST['medicalHistory'] ?? '');
    $emergencyContact = trim($_POST['emergencyContact'] ?? '');
    $emergencyNumber = trim($_POST['emergencyNumber'] ?? '');
    $conditions = $_POST['conditions'] ?? [];
    $otherCondition = trim($_POST['otherCondition'] ?? '');

    // Add other condition to conditions array
    if (!empty($otherCondition)) {
        $conditions[] = $otherCondition;
    }

    // Validate required fields
    if (empty($firstName) || empty($lastName) || empty($username) || empty($password) || 
        empty($mobileNumber) || empty($dob) || empty($sex) || empty($purok) || 
        empty($address) || empty($emergencyContact) || empty($emergencyNumber)) {
        $error = 'Please fill in all required fields.';
    } elseif ($password !== $confirmPassword) {
        $error = 'Passwords do not match.';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters.';
    } elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        $error = 'Username can only contain letters, numbers, and underscores.';
    } elseif (strlen($username) < 3) {
        $error = 'Username must be at least 3 characters.';
    } elseif (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Please enter a valid email address.';
    } elseif (!preg_match('/^(\+?63|0)?[0-9]{10,13}$/', preg_replace('/[\s-]/', '', $mobileNumber))) {
        $error = 'Please enter a valid mobile number (e.g., 0912-345-6789).';
    } else {
        try {
            // Get database connection
            $pdo = getDBConnection();
            
            if ($pdo === null) {
                $error = 'Database connection failed. Please try again later.';
            } else {
                // Check if username already exists
                $checkUser = $pdo->prepare("SELECT id FROM users WHERE username = ?");
                $checkUser->execute([$username]);
                
                if ($checkUser->fetch()) {
                    $error = 'Username already exists. Please choose another.';
                } else {
                    // Check if mobile number already exists
                    $checkMobile = $pdo->prepare("SELECT id FROM residents WHERE mobile_number = ?");
                    $checkMobile->execute([$mobileNumber]);
                    
                    if ($checkMobile->fetch()) {
                        $error = 'Mobile number already registered.';
                    } else {
                        // Start transaction
                        $pdo->beginTransaction();
                        
                        // Hash password
                        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                        
                        // Insert into users table
                        $userStmt = $pdo->prepare("
                            INSERT INTO users (username, password, role, status, created_at) 
                            VALUES (?, ?, 'resident', 'active', NOW())
                        ");
                        $userStmt->execute([$username, $hashedPassword]);
                        $userId = $pdo->lastInsertId();
                        
                        // Calculate age from DOB
                        $age = null;
                        if (!empty($dob)) {
                            $birthDate = new DateTime($dob);
                            $today = new DateTime();
                            $age = $today->diff($birthDate)->y;
                        }
                        
                        // Insert into residents table
                        $residentStmt = $pdo->prepare("
                            INSERT INTO residents (
                                user_id, first_name, middle_name, last_name, 
                                date_of_birth, age, sex, purok, address, 
                                mobile_number, email, household, 
                                medical_history, emergency_contact, emergency_number, created_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                        ");
                        
                        $residentStmt->execute([
                            $userId,
                            $firstName,
                            $middleName ?: null,
                            $lastName,
                            $dob,
                            $age,
                            $sex,
                            $purok,
                            $address,
                            $mobileNumber,
                            $email ?: null,
                            $household ?: null,
                            $medicalHistory ?: null,
                            $emergencyContact,
                            $emergencyNumber
                        ]);
                        
                        $residentId = $pdo->lastInsertId();
                        
                        // Insert health conditions
                        if (!empty($conditions)) {
                            $conditionStmt = $pdo->prepare("
                                INSERT INTO health_conditions (resident_id, condition_name) 
                                VALUES (?, ?)
                            ");
                            
                            foreach ($conditions as $condition) {
                                if ($condition !== 'None') {
                                    $conditionStmt->execute([$residentId, $condition]);
                                }
                            }
                        }
                        
                        // Commit transaction
                        $pdo->commit();
                        
                        // Set success
                        $success = true;
                        $registrationData = [
                            'fullName' => $firstName . ' ' . $lastName,
                            'username' => $username,
                            'mobileNumber' => $mobileNumber,
                            'email' => $email ?: null
                        ];
                        
                        // Store success message in session
                        $_SESSION['registration_success'] = 'ACCOUNT CREATED SUCCESSFULLY';
                        
                        // Redirect to login immediately
                        header('Location: login.php');
                        exit();
                    }
                }
            }
        } catch (PDOException $e) {
            if (isset($pdo)) {
                $pdo->rollBack();
            }
            $error = 'Registration failed: ' . $e->getMessage();
        }
    }
}

// Check if success message exists in session
$successMessage = $_SESSION['registration_success'] ?? '';
unset($_SESSION['registration_success']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <title>Register · Smart Community Health Monitoring</title>
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- Google Font: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/register.css">
    <meta name="theme-color" content="#4A90D9">
</head>
<body>

    <!-- ===== REGISTRATION PAGE ===== -->
    <div class="register-container">
        
        <!-- Left Panel - Branding -->
        <div class="register-brand">
            <div class="brand-content">
                <div class="brand-logo">
                    <i class="fas fa-heartbeat"></i>
                    <span>Barangay<span class="brand-highlight">Garsika</span></span>
                </div>
                <h1>Create Your Account</h1>
                <p>Register as a resident of Barangay Garsika to access health services, view your records, and receive health updates.</p>
                
                <div class="brand-benefits">
                    <div class="brand-benefit">
                        <i class="fas fa-check-circle"></i>
                        <span>View your health records anytime</span>
                    </div>
                    <div class="brand-benefit">
                        <i class="fas fa-check-circle"></i>
                        <span>Receive appointment reminders via SMS</span>
                    </div>
                    <div class="brand-benefit">
                        <i class="fas fa-check-circle"></i>
                        <span>Stay updated on health advisories</span>
                    </div>
                </div>

                <div class="brand-footer">
                    <p>Already have an account? <a href="login.php">Sign In</a></p>
                    <p class="brand-sub">Barangay Garsika · Barangay Health Monitoring System</p>
                </div>
            </div>
        </div>

        <!-- Right Panel - Registration Form -->
        <div class="register-form-panel">
            <div class="form-wrapper">
                <!-- Back Link -->
                <a href="../index.html" class="back-link">
                    <i class="fas fa-arrow-left"></i> Back to Home
                </a>

                <!-- Display Error Message -->
                <?php if (!empty($error)): ?>
                    <div class="error-alert">
                        <i class="fas fa-exclamation-circle"></i>
                        <?php echo htmlspecialchars($error); ?>
                    </div>
                <?php endif; ?>

                <!-- Display Success Message from Session -->
                <?php if (!empty($successMessage)): ?>
                    <div class="success-alert" style="display:flex; align-items:center; gap:12px; padding:16px 20px; background:#E8F5E9; border:1px solid #C8E6C9; border-radius:8px; color:#2E7D32; font-weight:600; font-size:1.1rem; margin-bottom:16px;">
                        <i class="fas fa-check-circle" style="font-size:1.4rem; color:#2E7D32;"></i>
                        <span><?php echo htmlspecialchars($successMessage); ?></span>
                    </div>
                    <div style="text-align:center; margin-top:12px;">
                        <a href="login.php" class="btn btn-primary" style="display:inline-block; padding:12px 32px; background:#4A90D9; color:white; border-radius:50px; text-decoration:none; font-weight:600;">Proceed to Login</a>
                    </div>
                <?php endif; ?>

                <?php if (empty($successMessage) && empty($success)): ?>
                <!-- Progress Indicator -->
                <div class="progress-container">
                    <div class="progress-steps">
                        <div class="progress-step active" data-step="1">
                            <div class="step-number">1</div>
                            <span class="step-label">Account</span>
                        </div>
                        <div class="progress-line"></div>
                        <div class="progress-step" data-step="2">
                            <div class="step-number">2</div>
                            <span class="step-label">Personal</span>
                        </div>
                        <div class="progress-line"></div>
                        <div class="progress-step" data-step="3">
                            <div class="step-number">3</div>
                            <span class="step-label">Health</span>
                        </div>
                        <div class="progress-line"></div>
                        <div class="progress-step" data-step="4">
                            <div class="step-number">4</div>
                            <span class="step-label">Review</span>
                        </div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill" style="width: 25%;"></div>
                    </div>
                </div>

                <!-- Form Header -->
                <div class="form-header" id="formHeader">
                    <h2 id="stepTitle">Account Information</h2>
                    <p id="stepDescription">Create your login credentials to get started.</p>
                </div>

                <!-- Registration Form -->
                <form id="registerForm" method="POST" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>" novalidate>
                    
                    <!-- ===== STEP 1: ACCOUNT INFORMATION ===== -->
                    <div class="form-step active" data-step="1">
                        <!-- Name Fields - Separate First, Middle, Last -->
                        <div class="form-group">
                            <label>
                                <i class="fas fa-user"></i>
                                Full Name
                            </label>
                            <div class="name-fields">
                                <div class="name-field">
                                    <input type="text" id="firstName" name="firstName" placeholder="First Name" value="<?php echo htmlspecialchars($formData['firstName']); ?>" required>
                                </div>
                                <div class="name-field">
                                    <input type="text" id="middleName" name="middleName" placeholder="Middle Name" value="<?php echo htmlspecialchars($formData['middleName']); ?>">
                                    <span class="optional">(Optional)</span>
                                </div>
                                <div class="name-field">
                                    <input type="text" id="lastName" name="lastName" placeholder="Last Name" value="<?php echo htmlspecialchars($formData['lastName']); ?>" required>
                                </div>
                            </div>
                            <span class="error-message" id="nameError">Please enter your first and last name</span>
                        </div>

                        <div class="form-group">
                            <label for="username">
                                <i class="fas fa-user-tag"></i>
                                Username
                            </label>
                            <input type="text" id="username" name="username" placeholder="Choose a username" value="<?php echo htmlspecialchars($formData['username']); ?>" required>
                            <span class="error-message">Username must be at least 3 characters</span>
                            <span class="helper-text">3-20 characters, letters, numbers, and underscores only</span>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="password">
                                    <i class="fas fa-lock"></i>
                                    Password
                                </label>
                                <div class="password-wrapper">
                                    <input type="password" id="password" name="password" placeholder="Create a password" required>
                                    <button type="button" class="toggle-password" data-target="password">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <span class="error-message">Password must be at least 6 characters</span>
                                <span class="helper-text">At least 6 characters</span>
                            </div>

                            <div class="form-group">
                                <label for="confirmPassword">
                                    <i class="fas fa-check-double"></i>
                                    Confirm Password
                                </label>
                                <div class="password-wrapper">
                                    <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password" required>
                                    <button type="button" class="toggle-password" data-target="confirmPassword">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <span class="error-message">Passwords do not match</span>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="mobileNumber">
                                    <i class="fas fa-phone"></i>
                                    Mobile Number
                                </label>
                                <input type="tel" id="mobileNumber" name="mobileNumber" placeholder="09XX-XXX-XXXX" value="<?php echo htmlspecialchars($formData['mobileNumber']); ?>" required>
                                <span class="error-message">Please enter a valid mobile number</span>
                                <span class="helper-text">e.g., 0912-345-6789</span>
                            </div>

                            <div class="form-group">
                                <label for="email">
                                    <i class="fas fa-envelope"></i>
                                    Email Address <span class="optional">(Optional)</span>
                                </label>
                                <input type="email" id="email" name="email" placeholder="Enter your email address" value="<?php echo htmlspecialchars($formData['email']); ?>">
                                <span class="error-message">Please enter a valid email address</span>
                            </div>
                        </div>
                    </div>

                    <!-- ===== STEP 2: PERSONAL INFORMATION ===== -->
                    <div class="form-step" data-step="2">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="dob">
                                    <i class="fas fa-calendar"></i>
                                    Date of Birth
                                </label>
                                <input type="date" id="dob" name="dob" value="<?php echo htmlspecialchars($formData['dob']); ?>" required>
                                <span class="error-message">Please select your date of birth</span>
                            </div>

                            <div class="form-group">
                                <label for="age">
                                    <i class="fas fa-cake-candles"></i>
                                    Age
                                </label>
                                <input type="number" id="age" placeholder="Auto-calculated" readonly>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="sex">
                                    <i class="fas fa-venus-mars"></i>
                                    Sex
                                </label>
                                <select id="sex" name="sex" required>
                                    <option value="">Select Sex</option>
                                    <option value="Male" <?php echo $formData['sex'] === 'Male' ? 'selected' : ''; ?>>Male</option>
                                    <option value="Female" <?php echo $formData['sex'] === 'Female' ? 'selected' : ''; ?>>Female</option>
                                </select>
                                <span class="error-message">Please select your sex</span>
                            </div>

                            <div class="form-group">
                                <label for="purok">
                                    <i class="fas fa-map-pin"></i>
                                    Purok / Zone
                                </label>
                                <select id="purok" name="purok" required>
                                    <option value="">Select Purok</option>
                                    <option value="Purok 1" <?php echo $formData['purok'] === 'Purok 1' ? 'selected' : ''; ?>>Purok 1</option>
                                    <option value="Purok 2" <?php echo $formData['purok'] === 'Purok 2' ? 'selected' : ''; ?>>Purok 2</option>
                                    <option value="Purok 3" <?php echo $formData['purok'] === 'Purok 3' ? 'selected' : ''; ?>>Purok 3</option>
                                    <option value="Purok 4" <?php echo $formData['purok'] === 'Purok 4' ? 'selected' : ''; ?>>Purok 4</option>
                                    <option value="Purok 5" <?php echo $formData['purok'] === 'Purok 5' ? 'selected' : ''; ?>>Purok 5</option>
                                    <option value="Purok 6" <?php echo $formData['purok'] === 'Purok 6' ? 'selected' : ''; ?>>Purok 6</option>
                                    <option value="Purok 7" <?php echo $formData['purok'] === 'Purok 7' ? 'selected' : ''; ?>>Purok 7</option>
                                    <option value="Purok 8" <?php echo $formData['purok'] === 'Purok 8' ? 'selected' : ''; ?>>Purok 8</option>
                                </select>
                                <span class="error-message">Please select your purok</span>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="address">
                                <i class="fas fa-home"></i>
                                Complete Address
                            </label>
                            <input type="text" id="address" name="address" placeholder="Enter your complete address" value="<?php echo htmlspecialchars($formData['address']); ?>" required>
                            <span class="error-message">Please enter your address</span>
                        </div>

                        <div class="form-group">
                            <label for="household">
                                <i class="fas fa-people-group"></i>
                                Household Information
                            </label>
                            <input type="text" id="household" name="household" placeholder="e.g., Family of 5" value="<?php echo htmlspecialchars($formData['household']); ?>">
                            <span class="helper-text">Brief description of your household</span>
                        </div>
                    </div>

                    <!-- ===== STEP 3: HEALTH INFORMATION ===== -->
                    <div class="form-step" data-step="3">
                        <div class="form-group">
                            <label for="medicalHistory">
                                <i class="fas fa-notes-medical"></i>
                                Medical History
                            </label>
                            <textarea id="medicalHistory" name="medicalHistory" rows="3" placeholder="List any past illnesses, surgeries, or medical conditions"><?php echo htmlspecialchars($formData['medicalHistory']); ?></textarea>
                            <span class="helper-text">Include any relevant medical history (optional but recommended)</span>
                        </div>

                        <div class="form-group">
                            <label for="healthConditions">
                                <i class="fas fa-heart-pulse"></i>
                                Existing Health Conditions
                            </label>
                            <div class="checkbox-group">
                                <label class="checkbox-item">
                                    <input type="checkbox" name="conditions[]" value="Diabetes" <?php echo in_array('Diabetes', $formData['conditions']) ? 'checked' : ''; ?>>
                                    <span class="checkmark"></span> Diabetes
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" name="conditions[]" value="Hypertension" <?php echo in_array('Hypertension', $formData['conditions']) ? 'checked' : ''; ?>>
                                    <span class="checkmark"></span> Hypertension
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" name="conditions[]" value="Asthma" <?php echo in_array('Asthma', $formData['conditions']) ? 'checked' : ''; ?>>
                                    <span class="checkmark"></span> Asthma
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" name="conditions[]" value="Heart Disease" <?php echo in_array('Heart Disease', $formData['conditions']) ? 'checked' : ''; ?>>
                                    <span class="checkmark"></span> Heart Disease
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" name="conditions[]" value="Allergies" <?php echo in_array('Allergies', $formData['conditions']) ? 'checked' : ''; ?>>
                                    <span class="checkmark"></span> Allergies
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" name="conditions[]" value="None" <?php echo in_array('None', $formData['conditions']) ? 'checked' : ''; ?>>
                                    <span class="checkmark"></span> None
                                </label>
                            </div>
                            <span class="helper-text">Select all that apply</span>
                            
                            <!-- Other Condition Input -->
                            <div class="other-condition-wrapper">
                                <label class="checkbox-item other-checkbox">
                                    <input type="checkbox" id="otherConditionCheck">
                                    <span class="checkmark"></span> Other
                                </label>
                                <input type="text" id="otherConditionInput" name="otherCondition" class="other-condition-input" placeholder="Please specify" disabled>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="emergencyContact">
                                    <i class="fas fa-user-tie"></i>
                                    Emergency Contact Person
                                </label>
                                <input type="text" id="emergencyContact" name="emergencyContact" placeholder="Full name of emergency contact" value="<?php echo htmlspecialchars($formData['emergencyContact']); ?>" required>
                                <span class="error-message">Please enter emergency contact name</span>
                            </div>

                            <div class="form-group">
                                <label for="emergencyNumber">
                                    <i class="fas fa-phone"></i>
                                    Emergency Contact Number
                                </label>
                                <input type="tel" id="emergencyNumber" name="emergencyNumber" placeholder="09XX-XXX-XXXX" value="<?php echo htmlspecialchars($formData['emergencyNumber']); ?>" required>
                                <span class="error-message">Please enter emergency contact number</span>
                            </div>
                        </div>
                    </div>

                    <!-- ===== STEP 4: REVIEW & CONFIRM ===== -->
                    <div class="form-step" data-step="4">
                        <div class="review-section">
                            <h4>Review Your Information</h4>
                            <p>Please verify that all information is correct before submitting.</p>
                        </div>

                        <div class="review-grid">
                            <div class="review-card">
                                <h5><i class="fas fa-user"></i> Account Information</h5>
                                <div class="review-item"><span>Full Name:</span> <span id="reviewFullName">-</span></div>
                                <div class="review-item"><span>Username:</span> <span id="reviewUsername">-</span></div>
                                <div class="review-item"><span>Mobile:</span> <span id="reviewMobile">-</span></div>
                                <div class="review-item"><span>Email:</span> <span id="reviewEmail">-</span></div>
                            </div>

                            <div class="review-card">
                                <h5><i class="fas fa-id-card"></i> Personal Information</h5>
                                <div class="review-item"><span>Date of Birth:</span> <span id="reviewDob">-</span></div>
                                <div class="review-item"><span>Age:</span> <span id="reviewAge">-</span></div>
                                <div class="review-item"><span>Sex:</span> <span id="reviewSex">-</span></div>
                                <div class="review-item"><span>Purok:</span> <span id="reviewPurok">-</span></div>
                                <div class="review-item"><span>Address:</span> <span id="reviewAddress">-</span></div>
                                <div class="review-item"><span>Household:</span> <span id="reviewHousehold">-</span></div>
                            </div>

                            <div class="review-card">
                                <h5><i class="fas fa-heartbeat"></i> Health Information</h5>
                                <div class="review-item"><span>Medical History:</span> <span id="reviewMedicalHistory">-</span></div>
                                <div class="review-item"><span>Health Conditions:</span> <span id="reviewConditions">-</span></div>
                                <div class="review-item"><span>Emergency Contact:</span> <span id="reviewEmergencyContact">-</span></div>
                                <div class="review-item"><span>Emergency Number:</span> <span id="reviewEmergencyNumber">-</span></div>
                            </div>
                        </div>

                        <div class="confirmation-check">
                            <label class="confirm-checkbox">
                                <input type="checkbox" id="confirmCheck">
                                <span class="checkmark"></span>
                                <span class="confirm-text">I confirm that the information I provided is correct and complete.</span>
                            </label>
                            <span class="error-message" id="confirmError">Please confirm that the information is correct</span>
                        </div>
                    </div>

                    <!-- ===== NAVIGATION BUTTONS ===== -->
                    <div class="form-navigation">
                        <button type="button" class="btn-back" id="prevStep" style="display:none;">
                            <i class="fas fa-arrow-left"></i> Back
                        </button>
                        <button type="button" class="btn-next" id="nextStep">
                            Next <i class="fas fa-arrow-right"></i>
                        </button>
                        <button type="submit" class="btn-submit" id="submitBtn" style="display:none;">
                            <span class="btn-text">Submit Registration</span>
                            <i class="fas fa-spinner fa-spin loading-icon" style="display:none;"></i>
                        </button>
                    </div>

                </form>
                <?php endif; ?>

                <!-- Success Message (fallback if not redirected) -->
                <div class="success-message" id="successMessage" style="display:none;">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>Registration Successful!</h3>
                    <p>Your account has been created. You will be redirected to the login page.</p>
                    <a href="login.php" class="btn btn-primary">Proceed to Login</a>
                </div>

            </div>
        </div>
    </div>

    <script src="../js/register.js"></script>
</body>
</html>