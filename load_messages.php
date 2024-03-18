    <?php
    $messages = file_get_contents('messages.json');
    $messagesArray = json_decode($messages, true);
    foreach ($messagesArray as $message) {
        $senderClass = strtolower(str_replace(' ', '-', $message['sender'])); 
        if ($senderClass == "osoba-1")
        {
            
        echo "<div style='float: left' class='$senderClass'>{$message['sender']}: {$message['message']}</div>";
        echo "<br>";
    }
        elseif ($senderClass == "osoba-2")
        {
        echo "<div style='float: right' class='$senderClass'>{$message['message']} :{$message['sender']}</div>";
        echo "<br>";
        }  
    }
    ?>
