<?php
if (isset($_POST['id'])) {
    $id = $_POST['id'];
    
    // Load is_account_taken.json file
    $is_account_taken = json_decode(file_get_contents('is_account_taken.json'), true);

    // Check if the account is already taken
    if (isset($is_account_taken[$id]) && $is_account_taken[$id]['istaken'] === true) {
        echo '{"istaken":true}';
    } else {
        echo '{"istaken":false}';
    }
} else {
    // Handle the case where $_POST['id'] is not set
    echo '{"error":"id parameter is missing"}';
}
?>
