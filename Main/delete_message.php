<?php
include '../config.php';

$messageID = $_POST['messageID'];

$sql = "DELETE FROM messages WHERE messageID='$messageID'";
if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}

$conn->close();
?>
