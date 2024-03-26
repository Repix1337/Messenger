<?php
$messages = file_get_contents('messages.json');
$messagesArray = json_decode($messages, true);

foreach ($messagesArray as $message) {
    $senderClass = strtolower(str_replace(' ', '-', $message['sender'])); 
    $messageID = $message['messageID']; // Get messageID from each message object
    if ($senderClass == "osoba-1") {
        echo "<div style='float: left' class='message' id='$messageID'>{$message['sender']}: {$message['message']}</div>";
        echo "<br>";
    } elseif ($senderClass == "osoba-2") {
        echo "<div style='float: right' class='message' id='$messageID'>{$message['message']} :{$message['sender']}</div>";
        echo "<br>";
    }  
}
?>
