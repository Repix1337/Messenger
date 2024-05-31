<?php
include 'config.php';
header('Content-Type: application/json');

$response = array();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $login = $_POST['login-register'];
    $password = $_POST['password-register'];
    $repeatPassword = $_POST['repeat-password'];

    // Check if login is longer than 18 characters
    if (strlen($login) > 18) {
        $response['status'] = 'error';
        $response['message'] = 'Login cannot be longer than 18 characters';
        echo json_encode($response);
        exit();
    }

    // Check if passwords match
    if ($password !== $repeatPassword) {
        $response['status'] = 'error';
        $response['message'] = 'Passwords do not match';
        echo json_encode($response);
        exit();
    }

    // Check if login already exists
    $stmt = $conn->prepare("SELECT login FROM users WHERE login = ?");
    $stmt->bind_param("s", $login);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $response['status'] = 'error';
        $response['message'] = 'Login already exists';
        echo json_encode($response);
        $stmt->close();
        $conn->close();
        exit();
    }

    $stmt->close();

    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Prepare and bind
    $stmt = $conn->prepare("INSERT INTO users (login, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $login, $hashedPassword);

    if ($stmt->execute()) {
        $response['status'] = 'success';
        $response['message'] = 'Your account got added';
        $response['username'] = $login;
    } else {
        $response['status'] = 'error';
        $response['message'] = 'Error: ' . $stmt->error;
    }

    echo json_encode($response);
    $stmt->close();
}

$conn->close();
?>
