<?php
// Read JSON file
$messages = file_get_contents('messages.json');
$messagesArray = json_decode($messages, true);

// Get messageID from POST data
$messageID = $_POST['messageID'];

// Find and remove the message with the specified messageID
foreach ($messagesArray as $key => $message) {
    if ($message['messageID'] === $messageID) {
        unset($messagesArray[$key]);
        break; // Stop looping once the message is found and removed
    }
}

// Encode the updated messages array back to JSON
$updatedMessages = json_encode(array_values($messagesArray));

// Write the updated JSON back to the file
file_put_contents('messages.json', $updatedMessages);

// Respond with success status
http_response_code(200);
?>
