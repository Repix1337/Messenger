document.addEventListener("DOMContentLoaded", () => {
    const theme = document.getElementById('theme');
    const chatMessages = document.getElementById('chat-messages');
    const textArea = document.getElementById('textarea');
    const sendButton = document.getElementById('send');
    const osoba1 = document.getElementById('osoba-1');
    const osoba2 = document.getElementById('osoba-2');
    const konto = document.querySelector(".konto");
    const popup = document.getElementById('popup'); // Corrected selector
    const chatroom = document.querySelector('.chatroom');
    const messages = document.querySelector('.message');
    let id;
    let messageID;

    function loadMessages() {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "load_messages.php", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                chatMessages.innerHTML = xhr.responseText;
                chatMessages.scrollTop = chatMessages.scrollHeight;
                // Check account availability after loading messages
                checkAccountAvailability("osoba-1");
                checkAccountAvailability("osoba-2");            
            }
        };
        var params = "messageID=" + encodeURIComponent(messageID); // Correctly format the data
        xhr.send(params);
    }
    

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

    function sendMessage(event) {
        event.preventDefault();
        const messageText = textArea.value;
        const sender = konto.textContent.trim();
        messageID = Date.now() + Math.random().toString(36).substr(2, 9); // Generate unique messageID
        // AJAX request to send message
        const formData = new FormData();
        formData.append('message', messageText);
        formData.append('sender', sender);
        formData.append('messageID', messageID);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "save_message.php", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                var newMessage = document.createElement('div');
                if (sender === konto.textContent.trim()) {
                    newMessage.classList.add('self');
                } else {
                    newMessage.classList.add('other');
                }
                if (sender == "osoba-1") {
                    newMessage.textContent = sender + ': ' + messageText;
                    newMessage.style.float = "left";
                } else if (sender == "osoba-2") {
                    newMessage.textContent = messageText + ' :' + sender;
                    newMessage.style.float = "right";
                }
                newMessage.setAttribute("id", messageID);
                let br = document.createElement('br');
                chatMessages.appendChild(newMessage);
                chatMessages.appendChild(br);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                textArea.value = '';
                sendButton.disabled = true;
                setTimeout(() => {
                    sendButton.disabled = false;
                }, 800);
            }
        };
        xhr.send(formData);
    }

    function clearMessages() {
        // Functionality to clear messages
        fetch('save_message.php');
    }

    function logoutPopUp() {
        if (konto.textContent == "osoba-1" || konto.textContent == "osoba-2") {
            popup.style.display = "block";
            chatroom.classList.add("blur");
        }
    }
    // Event listener for confirming account selection
    function Logout(){
        document.querySelector('.text').style.display = 'none';
        chatMessages.style.display = 'none';
        document.querySelectorAll('.person').forEach(function(person) {
            person.style.display = 'flex';
        });
        konto.textContent = "Niezalogowany";
        chatroom.classList.remove("blur");
        popup.style.display = "none";
        document.querySelector('.chat h1').textContent = 'Wybierz konto';
            updateAccountStatus(id, "release");
            document.getElementById(id).style.display = "flex";
    };

    function toggleTheme() {
        let isDarkTheme = false;
        let canChangeTheme = true;

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
                document.querySelector("body").style.background = "rgb(255,255,255)";
            } else {
                chatroom.style.background = "radial-gradient(circle at center, #000000, #0000ff 30%, #800080 60%, #000000 90%)";
                chatroom.style.color = "white";
                document.querySelector("body").style.background = "rgb(0,0,0)";

            }

            // Remove animation class after transition ends
            setTimeout(() => {
                chatroom.classList.remove('animate-theme');

                // Show other elements
                otherElements.forEach(element => {
                    element.classList.toggle('hidden');
                });
            }, 1300); // Adjust delay as needed
        }, 10); // A small delay to ensure animation class is applied before changing styles
    }

    function selectAccount(accountId) {
        id = accountId;
        konto.textContent = id;
        updateAccountStatus(id, "take");
        document.querySelectorAll('.person').forEach(function(person) {
            person.style.display = 'none';
        });
        document.querySelector('.text').style.display = 'flex';
        chatMessages.style.display = 'block';
        document.querySelector('.chat h1').textContent = `CZATUJ z osobą ${id === "osoba-1" ? "2" : "1"}`;
        checkAccountAvailability(accountId);
    }

    // Event listeners
    osoba1.addEventListener('click', () => selectAccount("osoba-1"));
    osoba2.addEventListener('click', () => selectAccount("osoba-2"));
    document.getElementById('messageForm').addEventListener('submit', sendMessage);
    document.getElementById('bin').addEventListener('click', clearMessages);
    konto.addEventListener('click', logoutPopUp);
    document.getElementById("tak").addEventListener('click', Logout);
    document.getElementById("nie").addEventListener('click', () => {
        popup.style.display = "none";
        chatroom.classList.remove("blur");
    });
    theme.addEventListener('click', toggleTheme);

    // Additional functionality
   
        chatMessages.addEventListener('mouseover', () => {
            console.log('Mouseover event triggered');
        });
     
    window.addEventListener('beforeunload', function(event) {
            updateAccountStatus(id, "release");
            document.getElementById(id).style.display = "flex";
    });

    // Periodically load messages
    setInterval(loadMessages, 500);
});


