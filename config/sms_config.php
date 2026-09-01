<?php
// ========================================
// SMS CONFIGURATION - IProg API
// ========================================

// IProg SMS API Configuration
define('IPROG_API_KEY', 'f34d751d4e547c854bd44c86d350c8994ac15f5f');
define('IPROG_API_URL', 'https://api.iprog.com/sms/send'); // Adjust URL as needed

// ========================================
// SEND SMS USING IPROG API
// ========================================
function sendIProgSMS($mobileNumber, $message) {
    // Remove any non-numeric characters from mobile number
    $mobileNumber = preg_replace('/[^0-9]/', '', $mobileNumber);
    
    // Ensure mobile number has the correct format (add country code if needed)
    // Philippines: 09XXXXXXXXX -> 639XXXXXXXXX
    if (substr($mobileNumber, 0, 1) === '0') {
        $mobileNumber = '63' . substr($mobileNumber, 1);
    }
    
    // If mobile number is empty or invalid, return false
    if (empty($mobileNumber) || strlen($mobileNumber) < 10) {
        return ['success' => false, 'message' => 'Invalid mobile number'];
    }
    
    $apiKey = IPROG_API_KEY;
    $apiUrl = IPROG_API_URL;
    
    // Prepare data for API request
    $data = [
        'api_key' => $apiKey,
        'number' => $mobileNumber,
        'message' => $message,
        // Add other required parameters based on IProg API documentation
    ];
    
    // Send request
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    // Log the response for debugging
    error_log("IProg SMS Response: " . $response);
    
    if ($error) {
        error_log("IProg SMS Error: " . $error);
        return ['success' => false, 'message' => 'SMS sending failed: ' . $error];
    }
    
    // Parse response based on IProg API format
    $responseData = json_decode($response, true);
    
    if ($responseData && isset($responseData['status']) && $responseData['status'] === 'success') {
        return ['success' => true, 'message' => 'SMS sent successfully'];
    } elseif ($responseData && isset($responseData['error'])) {
        return ['success' => false, 'message' => 'SMS failed: ' . $responseData['error']];
    } else {
        return ['success' => false, 'message' => 'SMS sending failed: Unknown error'];
    }
}

// ========================================
// GENERATE APPOINTMENT SMS MESSAGE
// ========================================
function getAppointmentSMSMessage($residentName, $date, $time, $type, $location) {
    return "📋 Appointment Reminder\n\nDear " . $residentName . ",\n\nYour " . $type . " appointment is scheduled on:\n📅 Date: " . $date . "\n⏰ Time: " . $time . "\n📍 Location: " . $location . "\n\nPlease come on time. Thank you!\n\n— Barangay Garsika Health Center";
}

// ========================================
// GENERATE IMMUNIZATION SMS MESSAGE
// ========================================
function getImmunizationSMSMessage($childName, $parentName, $vaccine, $dose, $date, $location) {
    return "💉 Immunization Reminder\n\nDear " . $parentName . ",\n\nYour child " . $childName . " is due for:\n💉 Vaccine: " . $vaccine . "\n💊 Dose: " . $dose . "\n📅 Date: " . $date . "\n📍 Location: " . $location . "\n\nPlease visit the health center.\n\n— Barangay Garsika Health Center";
}

// ========================================
// GENERATE PRENATAL SMS MESSAGE
// ========================================
function getPrenatalSMSMessage($residentName, $checkupDate, $location) {
    return "🤰 Prenatal Check-up Reminder\n\nDear " . $residentName . ",\n\nYour prenatal check-up is scheduled on:\n📅 Date: " . $checkupDate . "\n📍 Location: " . $location . "\n\nPlease bring your prenatal records.\n\n— Barangay Garsika Health Center";
}

// ========================================
// CREATE APPOINTMENT NOTIFICATION
// ========================================
function createAppointmentNotification($residentId, $residentName, $date, $time, $type, $status) {
    return [
        'type' => 'appointment',
        'title' => 'Appointment Scheduled',
        'message' => 'Your ' . $type . ' appointment on ' . $date . ' at ' . $time . ' has been ' . strtolower($status) . '.',
        'link' => '../resident-dashboard/#appointments'
    ];
}

// ========================================
// SEND SMS (Wrapper function for backward compatibility)
// ========================================
function sendSemaphoreSMS($mobileNumber, $message) {
    // This function name is kept for backward compatibility
    // It now uses the IProg API
    return sendIProgSMS($mobileNumber, $message);
}

// ========================================
// GENERATE OPT SMS MESSAGE
// ========================================
function getOptSMSMessage($childName, $parentName, $weight, $height, $status, $date) {
    return "⚖️ OPT Result\n\nDear " . $parentName . ",\n\nYour child " . $childName . " had their OPT checkup on " . $date . ":\n📊 Weight: " . $weight . " kg\n📏 Height: " . $height . " cm\n✅ Nutritional Status: " . $status . "\n\nKeep monitoring your child's health!\n\n— Barangay Garsika Health Center";
}

// ========================================
// GENERATE BMI SMS MESSAGE
// ========================================
function getBmiSMSMessage($residentName, $bmi, $category, $date) {
    return "⚖️ BMI Result\n\nDear " . $residentName . ",\n\nYour BMI assessment on " . $date . ":\n📊 BMI: " . $bmi . "\n✅ Category: " . $category . "\n\nMaintain a healthy lifestyle!\n\n— Barangay Garsika Health Center";
}
?>
