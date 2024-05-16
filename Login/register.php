<?php
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $login = $_POST['login-register'];
    $password = $_POST['password-register'];
    $repeatPassword = $_POST['repeat-password'];

    // Check if passwords match
    if ($password !== $repeatPassword) {
        echo "<script>
                alert('Passwords do not match!');
                window.history.back();
              </script>";
        exit();
    }

    // Check if login already exists
    $stmt = $conn->prepare("SELECT login FROM users WHERE login = ?");
    $stmt->bind_param("s", $login);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        echo "<script>
                alert('Login already exists!');
                window.history.back();
              </script>";
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
        echo "<script>
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('username', '$login');
                alert('Your account got added');
                window.location.href = '../index.html';
              </script>";
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
}

$conn->close();
?>
