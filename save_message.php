<?php
header('Content-Type: application/json'); // Ustawienie nagłówka Content-Type na application/json

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $messages = file_get_contents('messages.json');
    echo $messages; // Zwrócenie zawartości pliku messages.json jako odpowiedzi
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postData = json_decode(file_get_contents("php://input"), true); // Odczyt danych POST w formacie JSON
    if (isset($postData['clearAll']) && $postData['clearAll'] === true) {
        // Usunięcie wszystkich wiadomości
        file_put_contents('messages.json', json_encode([]));
        echo json_encode(['success' => true]);
    } else {
        if (isset($_POST['message']) && isset($_POST['sender'])) {
            $message = $_POST['message'];
            $sender = $_POST['sender'];
            $messageID = $_POST['messageID'];

            $messages = file_get_contents('messages.json');
            $messagesArray = json_decode($messages, true);
            
            $newMessage = array("sender" => $sender, "message" => $message, "messageID" => $messageID);
            $messagesArray[] = $newMessage;
            
            file_put_contents('messages.json', json_encode($messagesArray));
            
            // Zwrócenie nowej wiadomości jako odpowiedzi na żądanie AJAX
            echo json_encode($newMessage);
        } else {
            file_put_contents('messages.json', json_encode([]));
        }
    }
}
?>
