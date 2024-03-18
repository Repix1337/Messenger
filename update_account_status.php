<?php
if (isset($_POST['action']) && isset($_POST['id'])) {
    $action = $_POST['action'];
    $id = $_POST['id'];

    // Load is_account_taken.json file
    $is_account_taken = json_decode(file_get_contents('is_account_taken.json'), true);

    // Check if the account exists
    if (isset($is_account_taken[$id])) {
        // Update the account status based on the action
        if ($action === "take") {
            $is_account_taken[$id]['istaken'] = true;
        } elseif ($action === "release") {
            $is_account_taken[$id]['istaken'] = false;
        }

        // Save updated data back to the JSON file
        file_put_contents('is_account_taken.json', json_encode($is_account_taken));

        // Respond with a success message
        echo json_encode(array("success" => true));
    } else {
        // Respond with an error message if the account doesn't exist
        echo json_encode(array("error" => "Account not found"));
    }
} else {
    // Respond with an error message if action or id is missing
    echo json_encode(array("error" => "Action or ID parameter is missing"));
}
?>
