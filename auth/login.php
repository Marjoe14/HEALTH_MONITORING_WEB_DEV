<?php
// ========================================
// SMART COMMUNITY HEALTH MONITORING SYSTEM
// LOGIN PAGE - PHP (FIXED - Role Validation)
// ========================================
// Check if registration success message exists
$registrationSuccess = $_SESSION['registration_success'] ?? '';
unset($_SESSION['registration_success']);
// Start session for user login
session_start();

// ============================================================
// 🔥 HANDLE LOGOUT
// ============================================================
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: login.php');
    exit();
}

// Include database configuration
require_once __DIR__ . '/../config/database.php';

// Initialize variables
$error = '';
$username = '';
$role = 'resident';

// Check if user is already logged in
if (isset($_SESSION['user_id'])) {
    $role = $_SESSION['role'];
    if ($role === 'bhw') {
        header('Location: ../bhw-dashboard/bhw.php');
        exit();
    } elseif ($role === 'official') {
        header('Location: ../official-dashboard/official.php');
        exit();
    } else {
        header('Location: ../resident-dashboard/resident.php');
        exit();
    }
}

// Handle login form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $selectedRole = $_POST['role'] ?? 'resident';
    $remember = isset($_POST['remember']) ? true : false;

    // Validate input
    if (empty($username) || empty($password)) {
        $error = 'Please enter your username and password.';
    } else {
        try {
            // Get database connection
            $pdo = getDBConnection();
            
            if ($pdo === null) {
                $error = 'Database connection failed. Please try again later.';
            } else {
                // Get user from database
                $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
                $stmt->execute([$username]);
                $user = $stmt->fetch();

                if ($user && password_verify($password, $user['password'])) {
                    // Check if user status is active
                    if ($user['status'] !== 'active') {
                        $error = 'Your account is inactive. Please contact the administrator.';
                    } else {
                        // Validate that selected role matches user's actual role
                        $actualRole = $user['role'];
                        
                        // If user selected a role that doesn't match their actual role
                        if ($selectedRole !== $actualRole) {
                            $roleNames = [
                                'bhw' => 'BHW',
                                'official' => 'Official',
                                'resident' => 'Resident'
                            ];
                            $error = 'Invalid login. You are trying to log in as ' . ($roleNames[$selectedRole] ?? $selectedRole) . 
                                     ' but your account is registered as ' . ($roleNames[$actualRole] ?? $actualRole) . '.';
                        } else {
                            // Set session variables
                            $_SESSION['user_id'] = $user['id'];
                            $_SESSION['username'] = $user['username'];
                            $_SESSION['role'] = $user['role'];
                            
                            // Try to get name from residents or officials or bhw
                            $fullName = $username;
                            $nameData = null;
                            
                            if ($user['role'] === 'resident') {
                                $nameStmt = $pdo->prepare("SELECT first_name, middle_name, last_name FROM residents WHERE user_id = ?");
                                $nameStmt->execute([$user['id']]);
                                $nameData = $nameStmt->fetch();
                                if ($nameData) {
                                    $fullName = trim($nameData['first_name'] . ' ' . ($nameData['middle_name'] ?? '') . ' ' . $nameData['last_name']);
                                }
                            } elseif ($user['role'] === 'bhw') {
                                $nameStmt = $pdo->prepare("SELECT first_name, middle_name, last_name FROM bhw WHERE user_id = ?");
                                $nameStmt->execute([$user['id']]);
                                $nameData = $nameStmt->fetch();
                                if ($nameData) {
                                    $fullName = trim($nameData['first_name'] . ' ' . ($nameData['middle_name'] ?? '') . ' ' . $nameData['last_name']);
                                }
                            } elseif ($user['role'] === 'official') {
                                $nameStmt = $pdo->prepare("SELECT first_name, middle_name, last_name FROM officials WHERE user_id = ?");
                                $nameStmt->execute([$user['id']]);
                                $nameData = $nameStmt->fetch();
                                if ($nameData) {
                                    $fullName = trim($nameData['first_name'] . ' ' . ($nameData['middle_name'] ?? '') . ' ' . $nameData['last_name']);
                                }
                            }
                            
                            $_SESSION['full_name'] = $fullName;
                            $_SESSION['first_name'] = $nameData['first_name'] ?? '';
                            $_SESSION['last_name'] = $nameData['last_name'] ?? '';

                            // Set remember me cookie
                            if ($remember) {
                                setcookie('remember_username', $username, time() + (86400 * 30), '/');
                            } else {
                                setcookie('remember_username', '', time() - 3600, '/');
                            }

                            // Redirect based on role
                            $role = $user['role'];
                            if ($role === 'bhw') {
                                header('Location: ../bhw-dashboard/bhw.php');
                            } elseif ($role === 'official') {
                                header('Location: ../official-dashboard/official.php');
                            } else {
                                header('Location: ../resident-dashboard/resident.php');
                            }
                            exit();
                        }
                    }
                } else {
                    $error = 'Invalid username or password. Please try again.';
                }
            }
        } catch (PDOException $e) {
            $error = 'Login failed. Please try again later.';
            error_log('Login error: ' . $e->getMessage());
        }
    }
}

// Get remembered username
$rememberedUsername = $_COOKIE['remember_username'] ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <title>Login · Smart Community Health Monitoring</title>
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- Google Font: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/login.css">
    <meta name="theme-color" content="#4A90D9">
</head>
<body>

    <!-- ===== LOGIN PAGE ===== -->
    <div class="login-container">
        
        <!-- Left Panel - Branding -->
        <div class="login-brand">
            <div class="brand-content">
                <div class="brand-logo">
                    <i class="fas fa-heartbeat"></i>
                    <span>Barangay<span class="brand-highlight">Garsika</span></span>
                </div>
                <h1>Welcome Back</h1>
                <p>Sign in to access the Smart Community Health Monitoring System and manage community health records.</p>
                
                <div class="brand-features">
                    <div class="brand-feature">
                        <i class="fas fa-check-circle"></i>
                        <span>Centralized resident profiling</span>
                    </div>
                    <div class="brand-feature">
                        <i class="fas fa-check-circle"></i>
                        <span>Prenatal & immunization tracking</span>
                    </div>
                    <div class="brand-feature">
                        <i class="fas fa-check-circle"></i>
                        <span>Offline data sync & SMS alerts</span>
                    </div>
                </div>

                <div class="brand-footer">
                    <p>Smart Community Health Monitoring System</p>
                    <p class="brand-sub">Barangay Garsika · Barangay Health Monitoring System</p>
                </div>
            </div>
        </div>

        <!-- Right Panel - Login Form -->
        <div class="login-form-panel">
            <div class="form-wrapper">
                <!-- Close / Back Button -->
                <a href="../index.html" class="back-link">
                    <i class="fas fa-arrow-left"></i> Back to Home
                </a>

                <div class="form-header">
                    <h2 id="signInLabel">Sign In</h2>
                    <p id="signInSubLabel">Enter your credentials to access your dashboard.</p>
                </div>

                <!-- Display Error Message -->
                <?php if (!empty($error)): ?>
                    <div class="login-error" style="display:flex; margin-bottom:16px;">
                        <i class="fas fa-exclamation-circle"></i>
                        <span><?php echo htmlspecialchars($error); ?></span>
                    </div>
                <?php endif; ?>

                <!-- Role Selector - 3 Roles Only -->
                <div class="role-selector">
                    <button type="button" class="role-btn <?php echo $role === 'bhw' ? 'active' : ''; ?>" data-role="bhw" id="roleBHW">
                        <i class="fas fa-user-md"></i>
                        <span>BHW</span>
                    </button>
                    <button type="button" class="role-btn <?php echo $role === 'official' ? 'active' : ''; ?>" data-role="official" id="roleOfficial">
                        <i class="fas fa-users"></i>
                        <span>Official</span>
                    </button>
                    <button type="button" class="role-btn role-btn-resident <?php echo $role === 'resident' ? 'active' : ''; ?>" data-role="resident" id="roleResident">
                        <i class="fas fa-user-friends"></i>
                        <span>Resident</span>
                    </button>
                </div>

                <!-- Login Form -->
                <form id="loginForm" method="POST" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>" novalidate>
                    <!-- Username / Email -->
                    <div class="form-group">
                        <label for="username">
                            <i class="fas fa-user"></i>
                            Username or Email
                        </label>
                        <input type="text" id="username" name="username" placeholder="Enter your username or email" value="<?php echo htmlspecialchars($rememberedUsername); ?>" required autocomplete="username">
                        <span class="error-message" id="usernameError">Please enter your username</span>
                    </div>

                    <!-- Password -->
                    <div class="form-group">
                        <label for="password">
                            <i class="fas fa-lock"></i>
                            Password
                        </label>
                        <div class="password-wrapper">
                            <input type="password" id="password" name="password" placeholder="Enter your password" required autocomplete="current-password">
                            <button type="button" class="toggle-password" id="togglePassword" aria-label="Toggle password visibility">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <span class="error-message" id="passwordError">Please enter your password</span>
                    </div>

                    <!-- Hidden Role Input -->
                    <input type="hidden" name="role" id="roleInput" value="<?php echo htmlspecialchars($role); ?>">

                    <!-- Remember Me & Forgot Password -->
                    <div class="form-options">
                        <label class="remember-me">
                            <input type="checkbox" name="remember" id="rememberMe" <?php echo !empty($rememberedUsername) ? 'checked' : ''; ?>>
                            <span class="checkmark"></span>
                            Remember me
                        </label>
                        <a href="#" class="forgot-link">Forgot Password?</a>
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" class="btn-login" id="loginBtn">
                        <span class="btn-text" id="btnText">Sign In</span>
                        <i class="fas fa-spinner fa-spin loading-icon" style="display:none;"></i>
                    </button>
                </form>

                <!-- Register Link - FIXED: Always visible, JS handles hiding -->
                <div class="register-link" id="registerLink">
                    <p>Don't have an account? <a href="register.php">Register here</a></p>
                    <p class="register-note">Residents can register using the Resident Registration page.</p>
                </div>

            </div>
        </div>

    </div>

    <script src="../js/login.js"></script>
</body>
</html>