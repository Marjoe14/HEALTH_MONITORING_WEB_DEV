<?php
// ========================================
// SMS CONFIGURATION - IPROG API (FIXED)
// ========================================

// Your API Token
define('IPROG_API_TOKEN', 'f34d751d4e547c854bd44c86d350c8994ac15f5f');

// Correct API URL (GET method with parameters in URL)
define('IPROG_API_URL', 'https://www.iprogsms.com/api/v1/sms_messages');

// ========================================
// SEND SMS USING IPROG API - GET METHOD
// ========================================
function sendIProgSMS($mobileNumber, $message) {
    // Remove any non-numeric characters from mobile number
    $mobileNumber = preg_replace('/[^0-9]/', '', $mobileNumber);
    
    // Ensure mobile number has the correct format
    // Philippines: 09XXXXXXXXX -> 639XXXXXXXXX
    if (substr($mobileNumber, 0, 1) === '0') {
        $mobileNumber = '63' . substr($mobileNumber, 1);
    }
    
    // If mobile number is empty or invalid, return false
    if (empty($mobileNumber) || strlen($mobileNumber) < 10) {
        return ['success' => false, 'message' => 'Invalid mobile number'];
    }
    
    $apiToken = IPROG_API_TOKEN;
    $apiUrl = IPROG_API_URL;
    
    // Build URL with query parameters (GET method) - MATCHES YOUR URL FORMAT
    $queryParams = http_build_query([
        'api_token' => $apiToken,
        'phone_number' => $mobileNumber,
        'message' => $message
    ]);
    
    $fullUrl = $apiUrl . '?' . $queryParams;
    
    // Log what we're sending
    error_log("📱 SMS Request URL: " . $fullUrl);
    
    // Send GET request
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $fullUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'User-Agent: Barangay Garsika Health System/1.0'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    // Log the response
    error_log("📱 SMS Response - HTTP Code: {$httpCode}");
    error_log("📱 SMS Response Body: " . $response);
    
    if ($error) {
        error_log("📱 SMS CURL Error: " . $error);
        return ['success' => false, 'message' => 'CURL error: ' . $error];
    }
    
    // Try to parse JSON response
    $responseData = json_decode($response, true);
    
    // Check if the response indicates success (status code 200 or success message)
    if ($httpCode == 200) {
        // Check if there's a success indicator in the response
        if ($responseData) {
            // Check for different success indicators
            if (isset($responseData['status']) && $responseData['status'] == 200) {
                return ['success' => true, 'message' => 'SMS sent successfully'];
            }
            if (isset($responseData['success']) && $responseData['success'] === true) {
                return ['success' => true, 'message' => 'SMS sent successfully'];
            }
            if (isset($responseData['message']) && stripos($responseData['message'], 'success') !== false) {
                return ['success' => true, 'message' => 'SMS sent successfully'];
            }
            // If there's an error message
            if (isset($responseData['error']) || isset($responseData['errors']) || isset($responseData['message'])) {
                $errorMsg = $responseData['error'] ?? $responseData['errors'] ?? $responseData['message'];
                return ['success' => false, 'message' => 'API Error: ' . $errorMsg];
            }
        }
        // If response is empty or contains "ok", assume success
        if (empty($response) || stripos($response, 'ok') !== false) {
            return ['success' => true, 'message' => 'SMS sent successfully'];
        }
        // If we got a 200 with any content, assume success
        return ['success' => true, 'message' => 'SMS sent successfully'];
    }
    
    // If we got a different HTTP code, check for error message
    if ($responseData && isset($responseData['message'])) {
        return ['success' => false, 'message' => 'API Error: ' . $responseData['message']];
    }
    
    return ['success' => false, 'message' => 'Failed to send SMS (HTTP ' . $httpCode . ')'];
}

// ========================================
// SEND SMS (Wrapper function)
// ========================================
function sendSemaphoreSMS($mobileNumber, $message) {
    // Check if running on Railway
    $isRailway = getenv('RAILWAY_ENVIRONMENT') !== false || getenv('RAILWAY_SERVICE_ID') !== false;
    
    if ($isRailway) {
        return sendIProgSMS($mobileNumber, $message);
    } else {
        // Local test mode
        error_log("📱 LOCAL SMS TEST - To: {$mobileNumber}, Message: " . substr($message, 0, 100));
        return ['success' => true, 'message' => 'Local test SMS logged', 'test_mode' => true];
    }
}

// ========================================
// SMS MESSAGE TEMPLATES
// ========================================
function getAppointmentSMSMessage($residentName, $date, $time, $type, $location) {
    return "📋 Appointment Reminder\n\nDear " . $residentName . ",\n\nYour " . $type . " appointment is scheduled on:\n📅 Date: " . $date . "\n⏰ Time: " . $time . "\n📍 Location: " . $location . "\n\nPlease come on time. Thank you!\n\n— Barangay Garsika Health Center";
}

function createAppointmentNotification($residentId, $residentName, $date, $time, $type, $status) {
    return [
        'type' => 'appointment',
        'title' => 'Appointment Scheduled',
        'message' => 'Your ' . $type . ' appointment on ' . $date . ' at ' . $time . ' has been ' . strtolower($status) . '.',
        'link' => '../resident-dashboard/#appointments'
    ];
}

function getImmunizationSMSMessage($childName, $parentName, $vaccine, $dose, $date, $location) {
    return "💉 Immunization Reminder\n\nDear " . $parentName . ",\n\nYour child " . $childName . " is due for:\n💉 Vaccine: " . $vaccine . "\n💊 Dose: " . $dose . "\n📅 Date: " . $date . "\n📍 Location: " . $location . "\n\nPlease visit the health center.\n\n— Barangay Garsika Health Center";
}

function getPrenatalSMSMessage($residentName, $checkupDate, $location) {
    return "🤰 Prenatal Check-up Reminder\n\nDear " . $residentName . ",\n\nYour prenatal check-up is scheduled on:\n📅 Date: " . $checkupDate . "\n📍 Location: " . $location . "\n\nPlease bring your prenatal records.\n\n— Barangay Garsika Health Center";
}

function getOptSMSMessage($childName, $parentName, $weight, $height, $status, $date) {
    return "⚖️ OPT Result\n\nDear " . $parentName . ",\n\nYour child " . $childName . " had their OPT checkup on " . $date . ":\n📊 Weight: " . $weight . " kg\n📏 Height: " . $height . " cm\n✅ Nutritional Status: " . $status . "\n\nKeep monitoring your child's health!\n\n— Barangay Garsika Health Center";
}

function getBmiSMSMessage($residentName, $bmi, $category, $date) {
    return "⚖️ BMI Result\n\nDear " . $residentName . ",\n\nYour BMI assessment on " . $date . ":\n📊 BMI: " . $bmi . "\n✅ Category: " . $category . "\n\nMaintain a healthy lifestyle!\n\n— Barangay Garsika Health Center";
}
?>
