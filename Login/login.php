<?php
include 'config.php';
header('Content-Type: application/json');

$response = array();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $login = strtolower(trim($_POST['login']));
    $password = $_POST['password'];

    // Fetch the user data
    $stmt = $conn->prepare("SELECT password FROM users WHERE login = ?");
    $stmt->bind_param("s", $login);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($hashedPassword);
        $stmt->fetch();

        // Verify the password
        if (password_verify($password, $hashedPassword)) {
            $response['status'] = 'success';
            $response['message'] = 'You logged in';
            $response['username'] = $login;
        } else {
            $response['status'] = 'error';
            $response['message'] = 'Incorrect password';
        }
    } else {
        $response['status'] = 'error';
        $response['message'] = 'No user found';
    }

    echo json_encode($response);
    $stmt->close();
}

$conn->close();
?>
