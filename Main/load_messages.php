<?php
header('Content-Type: application/json'); // Ustawienie nagłówka Content-Type na application/json

$messages = file_get_contents('messages.json');
echo $messages; // Zwrócenie zawartości pliku messages.json jako odpowiedzi
?>
