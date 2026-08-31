<?php
// ========================================
// SMART COMMUNITY HEALTH MONITORING SYSTEM
// GET RESIDENT APPOINTMENT DETAIL
// ========================================

session_start();
header('Content-Type: application/json');

// ============================================================
// 🔥 CHECK IF USER IS LOGGED IN AS RESIDENT
// ============================================================
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'resident') {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit();
}

// ============================================================
// 🔥 INCLUDE DATABASE CONFIGURATION
// ============================================================
require_once __DIR__ . '/../../config/database.php';

// ============================================================
// 🔥 GET APPOINTMENT ID
// ============================================================
$appointmentId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($appointmentId <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid appointment ID'
    ]);
    exit();
}

// ============================================================
// 🔥 DATABASE CONNECTION
// ============================================================
$pdo = getDBConnection();
if (!$pdo) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed'
    ]);
    exit();
}

$userId = $_SESSION['user_id'];

try {
    // ============================================================
    // 🔥 FETCH APPOINTMENT DETAIL WITH RESIDENT VALIDATION
    // ============================================================
    $stmt = $pdo->prepare("
        SELECT 
            a.id,
            a.resident_id,
            a.appointment_date,
            a.appointment_time,
            a.type,
            a.location,
            a.status,
            a.notes,
            a.cancellation_requested,
            a.cancellation_reason,
            a.cancellation_notes,
            a.cancellation_status,
            a.cancellation_requested_at,
            a.created_at,
            a.updated_at,
            CONCAT(r.first_name, ' ', r.last_name) AS resident_name,
            r.purok,
            r.mobile_number
        FROM appointments a
        JOIN residents r ON a.resident_id = r.id
        WHERE a.id = ? AND r.user_id = ?
    ");
    $stmt->execute([$appointmentId, $userId]);
    $appointment = $stmt->fetch();

    // ============================================================
    // 🔥 CHECK IF APPOINTMENT EXISTS
    // ============================================================
    if (!$appointment) {
        echo json_encode([
            'success' => false,
            'message' => 'Appointment not found or you do not have permission to view it'
        ]);
        exit();
    }

    // ============================================================
    // 🔥 FORMAT THE DATA FOR RESPONSE
    // ============================================================
    $response = [
        'success' => true,
        'appointment' => [
            'id' => (int)$appointment['id'],
            'resident_id' => (int)$appointment['resident_id'],
            'resident_name' => htmlspecialchars($appointment['resident_name']),
            'purok' => htmlspecialchars($appointment['purok'] ?? '—'),
            'mobile_number' => htmlspecialchars($appointment['mobile_number'] ?? '—'),
            'appointment_date' => $appointment['appointment_date'],
            'appointment_time' => $appointment['appointment_time'] ?? '—',
            'type' => htmlspecialchars($appointment['type'] ?? 'General Check-up'),
            'location' => htmlspecialchars($appointment['location'] ?? 'Barangay Health Center'),
            'status' => htmlspecialchars($appointment['status']),
            'notes' => htmlspecialchars($appointment['notes'] ?? ''),
            'cancellation_requested' => (bool)$appointment['cancellation_requested'],
            'cancellation_reason' => htmlspecialchars($appointment['cancellation_reason'] ?? ''),
            'cancellation_notes' => htmlspecialchars($appointment['cancellation_notes'] ?? ''),
            'cancellation_status' => htmlspecialchars($appointment['cancellation_status'] ?? ''),
            'cancellation_requested_at' => $appointment['cancellation_requested_at'],
            'created_at' => $appointment['created_at'],
            'updated_at' => $appointment['updated_at']
        ]
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>