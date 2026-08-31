<?php
// ========================================
// SMS CONFIGURATION - Semaphore
// ========================================

// Your Semaphore API Key from https://semaphore.co
define('SEMAPHORE_API_KEY', 'YOUR_SEMAPHORE_API_KEY_HERE');

// Your registered sender name (must be registered in Semaphore)
define('SEMAPHORE_SENDER_NAME', 'BarangayGarsika');

// Semaphore API URL
define('SEMAPHORE_API_URL', 'https://api.semaphore.co/api/v4/messages');

function getSemaphoreConfig() {
    return [
        'api_key' => SEMAPHORE_API_KEY,
        'sender_name' => SEMAPHORE_SENDER_NAME,
        'api_url' => SEMAPHORE_API_URL
    ];
}

function sendSemaphoreSMS($mobileNumber, $message) {
    // Clean phone number
    $mobileNumber = preg_replace('/[\s\-\.\(\)]/', '', $mobileNumber);
    
    // Ensure proper format (add 63 if starts with 0)
    if (substr($mobileNumber, 0, 1) === '0') {
        $mobileNumber = '63' . substr($mobileNumber, 1);
    }
    
    // Remove leading + if present
    $mobileNumber = ltrim($mobileNumber, '+');
    
    $config = getSemaphoreConfig();
    
    $data = [
        'apikey' => $config['api_key'],
        'number' => $mobileNumber,
        'message' => $message,
        'sendername' => $config['sender_name']
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $config['api_url']);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        return ['success' => false, 'error' => $error];
    }
    
    $result = json_decode($response, true);
    
    if ($httpCode == 200 && isset($result[0]['status']) && $result[0]['status'] != 'Failed') {
        return [
            'success' => true, 
            'message_id' => $result[0]['message_id'] ?? null,
            'response' => $result
        ];
    } else {
        $errorMsg = $result[0]['status'] ?? 'Unknown error';
        return ['success' => false, 'error' => $errorMsg, 'response' => $result];
    }
}

function getAppointmentSMSMessage($residentName, $date, $time, $type, $location) {
    return "📅 Appointment Reminder\n\n" .
           "Dear " . $residentName . ",\n" .
           "You have a scheduled " . $type . " appointment on:\n" .
           "📆 Date: " . $date . "\n" .
           "⏰ Time: " . $time . "\n" .
           "📍 Location: " . $location . "\n\n" .
           "Please come on time. Thank you!\n\n" .
           "Barangay Garsika Health Center";
}

function createAppointmentNotification($residentId, $residentName, $date, $time, $type, $status) {
    $title = "Appointment " . ($status === 'Completed' ? 'Completed' : 'Scheduled');
    $message = "Your " . $type . " appointment on " . $date . " at " . $time . " has been " . strtolower($status) . ".";
    
    return [
        'title' => $title,
        'message' => $message,
        'type' => 'appointment',
        'link' => '../resident-dashboard/#appointments'
    ];
}
?>