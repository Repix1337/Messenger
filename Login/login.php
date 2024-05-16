<?php
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $login = $_POST['login'];
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
            echo "<script>
                    localStorage.setItem('loggedIn', 'true');
                    localStorage.setItem('username', '$login');
                    alert('You logged in');
                window.location.href = '../index.html';
                  </script>";
        } else {
            echo "Incorrect password.";
        }
    } else {
        echo "No user found.";
    }

    $stmt->close();
}

$conn->close();
?>
