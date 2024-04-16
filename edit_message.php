<?php
header('Content-Type: application/json');

// Load messages from JSON file
$messages = file_get_contents('messages.json');
$messagesArray = json_decode($messages, true);

// Decode JSON data from the POST request
$postData = json_decode(file_get_contents("php://input"), true);

// Check if message and sender are set in the POST data
if (isset($postData['message']) && isset($postData['sender']) && isset($postData['messageID'])) {
    $message = $postData['message'];
    $sender = $postData['sender'];
    $messageID = $postData['messageID'];

    // Loop through messages to find the one with matching messageID
    foreach ($messagesArray as &$messageItem) {
        if ($messageItem['messageID'] === $messageID) {
            // Change the message content
            $messageItem['message'] = $message;
            break; // Stop looping once the target message is found
        }
    }

    // Write the updated messages back to the JSON file
    file_put_contents('messages.json', json_encode($messagesArray));

    // Return the updated message as a response to the AJAX request
    $response = array(
        'status' => 'success',
        'message' => 'Message updated successfully'
    );
    echo json_encode($response);
} else {
    // Return an error response if message or sender is not set
    $response = array(
        'status' => 'error',
        'message' => 'Message or sender not provided'
    );
    echo json_encode($response);
}
?>
