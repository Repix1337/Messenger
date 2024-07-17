<?php
include '../config.php';

if (isset($_POST['clearAll']) && $_POST['clearAll'] == 'true') {
    $sql = "DELETE * FROM messages";
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $conn->error]);
    }
} else {
    $messageID = $_POST['messageID'];
    $sender = $_POST['sender'];
    $message = $_POST['message'];

    $sql = "INSERT INTO messages (messageID, sender, message) VALUES ('$messageID', '$sender', '$message')";
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $conn->error]);
    }
}

$conn->close();
?>
