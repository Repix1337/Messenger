document.addEventListener("DOMContentLoaded", () => {
    const theme = document.getElementById('theme');
    const chatMessages = document.getElementById('chat-messages');
    const textArea = document.getElementById('textarea');
    const sendButton = document.getElementById('send');
    const osoba1 = document.getElementById('osoba-1');
    const osoba2 = document.getElementById('osoba-2');
    const konto = document.querySelector(".konto");
    const popup = document.querySelector('.popup');
    const chatroom = document.querySelector('.chatroom');

    let id;

    function loadMessages() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "load_messages.php", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                chatMessages.innerHTML = xhr.responseText;
                chatMessages.scrollTop = chatMessages.scrollHeight;
                // Check account availability after loading messages
                checkAccountAvailability("osoba-1");
                checkAccountAvailability("osoba-2");
            }
        };
        xhr.send();
    }
    loadMessages();

    function checkAccountAvailability(accountId) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "is_account_taken.php", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                console.log(xhr.responseText);
    
                var isTaken = JSON.parse(xhr.responseText).istaken;
                var element = document.getElementById(accountId);
                if (isTaken) {
                    element.style.display = "none";
                } else if (isTaken == false && konto.textContent == "Niezalogowany") {
                    element.style.display = "flex";
                }
            }
        };
        var params = "id=" + encodeURIComponent(accountId); // Encode parameter value
        xhr.send(params);
    }
    window.addEventListener('beforeunload', function(event) {
        if (id == "osoba 1") {
            updateAccountStatus("osoba-1", "release");
            osoba1.style.display = "flex";
        } else if (id == "osoba 2") {
            updateAccountStatus("osoba-2", "release");
            osoba2.style.display = "flex";
        }
    });
    
    function updateAccountStatus(id, action) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "update_account_status.php", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                if (response.success) {
                    console.log("Account status updated successfully.");
                } else {
                    console.error("Failed to update account status.");
                }
            }
        };
        var params = "action=" + action + "&id=" + encodeURIComponent(id);
        xhr.send(params);
    }
    // Event listener for selecting account 1
    osoba1.addEventListener('click', () => {
        id = "osoba 1";
        konto.textContent = id;
        updateAccountStatus("osoba-1", "take");
        document.querySelectorAll('.person').forEach(function(person) {
            person.style.display = 'none';
        });
        document.querySelector('.text').style.display = 'flex';
        chatMessages.style.display = 'block';
        document.querySelector('.chat h1').textContent = 'CZATUJ z osobą 2';
        checkAccountAvailability("osoba-1"); 
    });
    
    // Event listener for selecting account 2
    osoba2.addEventListener('click', () => {
        id = "osoba 2";
        konto.textContent = id;
        updateAccountStatus("osoba-2", "take");
        document.querySelectorAll('.person').forEach(function(person) {
            person.style.display = 'none';
        });
        document.querySelector('.text').style.display = 'flex';
        chatMessages.style.display = 'block';
        document.querySelector('.chat h1').textContent = 'CZATUJ z osobą 1';
        checkAccountAvailability("osoba-2"); 
    });

    // Event listener for sending a message
    document.getElementById('messageForm').addEventListener('submit', function(event) {
        event.preventDefault();
        var messageText = textArea.value;
        var sender = konto.textContent.trim();

        var formData = new FormData();
        formData.append('message', messageText);
        formData.append('sender', sender);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "save_message.php", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                var newMessage = document.createElement('div');
                if (sender === konto.textContent.trim()) {
                    newMessage.classList.add('self');
                } else {
                    newMessage.classList.add('other');
                }
                if (sender == "osoba 1") {
                    newMessage.textContent = sender + ': ' + messageText;
                    newMessage.style.float = "left";
                } else if (sender == "osoba 2") {
                    newMessage.textContent = messageText + ' :' + sender;
                    newMessage.style.float = "right";
                }
                let br = document.createElement('br');
                chatMessages.appendChild(newMessage);
                chatMessages.appendChild(br);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                textArea.value = '';
                sendButton.disabled = true;
                setTimeout(() => {
                    sendButton.disabled = false;
                }, 500);
            }
        };
        xhr.send(formData);
    });

    // Event listener for clearing messages
    document.getElementById('bin').addEventListener('click', () => {
        fetch('save_message.php')
    });

    // Periodically load messages
    setInterval(loadMessages, 500);

    // Event listener for clicking on the account name
    konto.addEventListener('click', () => {
        if (konto.textContent == "osoba 1" || konto.textContent == "osoba 2") {
            popup.style.display = "block";
            chatroom.classList.add("blur");
        }
    });

    // Event listener for confirming account selection
    document.getElementById("tak").addEventListener('click', () => {
        document.querySelector('.text').style.display = 'none';
        chatMessages.style.display = 'none';
        document.querySelectorAll('.person').forEach(function(person) {
            person.style.display = 'flex';
        });
        konto.textContent = "Niezalogowany";
        chatroom.classList.remove("blur");
        popup.style.display = "none";
        document.querySelector('.chat h1').textContent = 'Wybierz konto';
        if (id == "osoba 1") {
            // Make account 1 available again
            updateAccountStatus("osoba-1", "release");
            osoba1.style.display = "flex";
        } else if (id == "osoba 2") {
            // Make account 2 available again
            updateAccountStatus("osoba-2", "release");
            osoba2.style.display = "flex";
        }
    });

    // Event listener for cancelling account selection
    document.getElementById("nie").addEventListener('click', () => {
        popup.style.display = "none";
        chatroom.classList.remove("blur");
    });

    let isDarkTheme = false;
    let canChangeTheme = true;
    
    document.getElementById('theme').addEventListener('click', () => {
        if (!canChangeTheme) return;
    
        const chatroom = document.querySelector('.chatroom');
        const otherElements = document.querySelectorAll('.side-menu, .popup,.chat,#theme');
    
        // Disable the theme button
        canChangeTheme = false;
        setTimeout(() => {
            canChangeTheme = true;
        }, 1500); // Adjust delay as needed
    
        // Toggle theme
        isDarkTheme = !isDarkTheme;
    
        // Add animation class to trigger transition
        chatroom.classList.add('animate-theme');
    
        // Hide other elements
        otherElements.forEach(element => {
            element.classList.toggle('hidden');
        });
    
        // Update styles after a delay to ensure animation starts
        setTimeout(() => {
            if (isDarkTheme) {
                chatroom.style.background = "radial-gradient(circle at center, #ffffff, #ffff00 30%, #00ff00 60%, #ffffff 90%)";
                chatroom.style.color = "black";
            } else {
                chatroom.style.background = "radial-gradient(circle at center, #000000, #0000ff 30%, #800080 60%, #000000 90%)";
                chatroom.style.color = "white";
            }
    
            // Remove animation class after transition ends
            setTimeout(() => {
                chatroom.classList.remove('animate-theme');
    
                // Show other elements
                otherElements.forEach(element => {
                    element.classList.toggle('hidden');
                });
            }, 500); // Adjust delay as needed
        }, 10); // A small delay to ensure animation class is applied before changing styles
    });
});

