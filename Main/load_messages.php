<?php
include '../config.php';
$sql = "SELECT messageID, sender, message, isloaded FROM messages";

// Execute query and check for errors
$result = $conn->query($sql);

if ($result === false) {
    echo json_encode(["success" => false, "error" => "Query failed: " . $conn->error]);
    exit();
}

// Fetch messages
$messages = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }
}

// Output messages as JSON
echo json_encode($messages);

// Close connection
$conn->close();
?>
