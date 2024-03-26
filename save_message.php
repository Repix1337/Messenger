<?php
if (isset($_POST['message']) && isset($_POST['sender'])) {
    $message = $_POST['message'];
    $sender = $_POST['sender'];
    $messageID = $_POST['messageID'];

    
    $messages = file_get_contents('messages.json');
    $messagesArray = json_decode($messages, true);
    
    $newMessage = array("sender" => $sender, "message" => $message,"messageID" => $messageID);
    $messagesArray[] = $newMessage;
    
    file_put_contents('messages.json', json_encode($messagesArray));
}
else{
    file_put_contents('messages.json', json_encode([]));
}
?>