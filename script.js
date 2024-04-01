document.addEventListener("DOMContentLoaded", () => {
    // Elementy interfejsu użytkownika
    const theme = document.getElementById('theme');
    const chatMessages = document.getElementById('chat-messages');
    const textArea = document.getElementById('textarea');
    const sendButton = document.getElementById('send');
    const osoba1 = document.getElementById('osoba-1');
    const osoba2 = document.getElementById('osoba-2');
    const konto = document.querySelector(".konto");
    const popup = document.getElementById('popup'); 
    const MessageMenu = document.getElementById('MessageMenu'); 
    const chatroom = document.querySelector('.chatroom');
    const DeleteMessageButton = document.getElementById('DeleteMessageButton');
    
    // Zmienne stanu
    let isDarkTheme = false;
    let canChangeTheme = true;
    let id;
    
    let loadedMessages = {}; // Obiekt przechowujący informacje o załadowanych wiadomościach

    // Funkcje pomocnicze
    function handleReceivedMessages(messages) {
        messages.forEach(message => {
            const { sender, message: messageText, messageID, isloaded } = message;
            const newMessage = document.createElement('div');
            newMessage.classList.add('message', sender);
            newMessage.dataset.isloaded = isloaded; // Ustawienie atrybutu 'data-isloaded'
            if (sender === konto.textContent.trim()) {
                newMessage.textContent = `${messageText} :${sender}`;
                newMessage.style.float = "right";
                newMessage.style.textAlign = "right";
            } else {
                newMessage.textContent = `${sender} :${messageText}`;
                newMessage.style.float = "left";
                newMessage.style.textAlign = "left";
            }
            newMessage.id = messageID;
            chatMessages.appendChild(newMessage);
            loadedMessages[messageID] = true;
        });
    }
    
    function loadMessages() {
        if (konto.textContent.trim() != "Niezalogowany") {
            fetch('load_messages.php')
                .then(response => response.json())
                .then(messages => {
                    const messagesToLoad = messages.filter(message => !loadedMessages[message.messageID]);
                    handleReceivedMessages(messagesToLoad);
                })
                .catch(error => console.error('Error loading messages:', error));
        }
    }

    function checkAccountAvailability(accountId) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "is_account_taken.php", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                var isTaken = JSON.parse(xhr.responseText).istaken;
                var element = document.getElementById(accountId);
                if (isTaken) {
                    element.style.display = "none";
                } else if (isTaken == false && konto.textContent == "Niezalogowany") {
                    element.style.display = "flex";
                }
            }
        };
        var params = "id=" + encodeURIComponent(accountId); 
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
        messageID = Date.now() + Math.random().toString(36).substr(2, 9); 
        const formData = new FormData();
        formData.append('message', messageText);
        formData.append('sender', sender);
        formData.append('messageID', messageID);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "save_message.php", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
                textArea.value = ''; // Wyczyszczenie pola tekstowego po wysłaniu wiadomości
                sendButton.disabled = true;
                setTimeout(() => {
                    sendButton.disabled = false;
                }, 800);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        };
        xhr.send(formData);
    }

    function clearMessages() {
        fetch('save_message.php', {
            method: 'POST',
            body: JSON.stringify({ clearAll: true }), // Dodanie informacji o usuwaniu wszystkich wiadomości
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Usunięto wszystkie wiadomości, więc wyczyść również wyświetlanie wiadomości
                chatMessages.innerHTML = '';
            } else {
                console.error('Error clearing messages:', data.error);
            }
        })
        .catch(error => console.error('Error clearing messages:', error));
    }

    function logoutPopUp() {
        if (konto.textContent == "osoba-1" || konto.textContent == "osoba-2") {
            popup.style.display = "block";
            chatroom.classList.add("blur");
        }
    }

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
        loadedMessages = {};
        chatMessages.innerHTML = '';
    }

    let messageID;

    function ClickMessage(event){
        let mess = event.target;
        if (mess.classList.contains('message') && mess.classList.contains(id)) {
            messageID = mess.id;
            console.log(messageID)
            MessageMenu.style.display = 'flex';
            MessageMenu.style.justifyContent = 'space-between';
            mess.append(MessageMenu);
            return messageID;
        }
    }
        
    function DeleteSpecificMessage() {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'delete_message.php', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    document.getElementById(messageID).remove();
                    MessageMenu.style.display = 'none'; // Hide menu after deletion
                } else {
                    console.error('Error deleting message');
                }
            }
        };
        xhr.send('messageID=' + encodeURIComponent(messageID));
    }
    
    function selectAccount(accountId) {
        id = accountId;
        konto.textContent = id;
        loadMessages();
        setInterval(loadMessages,500);
        updateAccountStatus(id, "take");
        document.querySelectorAll('.person').forEach(function(person) {
            person.style.display = 'none';
        });
        document.querySelector('.text').style.display = 'flex';
        chatMessages.style.display = 'block';
        document.querySelector('.chat h1').textContent = `CZATUJ z osobą ${id === "osoba-1" ? "2" : "1"}`;
        checkAccountAvailability(accountId);
    }

    // Nasłuchiwacze zdarzeń
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
    chatMessages.addEventListener('click', (event) => ClickMessage(event));
    DeleteMessageButton.addEventListener('click', DeleteSpecificMessage);
    MessageMenu.addEventListener('mouseleave', () => {
        MessageMenu.style.display = 'none';
    });
     
    window.addEventListener('beforeunload', function(event) {
        updateAccountStatus(id, "release");
        document.getElementById(id).style.display = "flex";
    });

    // Sprawdzanie dostępności kont
    function CheckAccount(){
        checkAccountAvailability("osoba-1");
        checkAccountAvailability("osoba-2");
    }
    setInterval(CheckAccount,500);

    // Przełączanie motywu
    function toggleTheme() {
        if (!canChangeTheme) return;
        const otherElements = document.querySelectorAll('.side-menu, .popup,.chat,#theme');

        canChangeTheme = false;
        setTimeout(() => {
            canChangeTheme = true;
        }, 1500);

        isDarkTheme = !isDarkTheme;
        chatroom.classList.add('animate-theme');

        otherElements.forEach(element => {
            element.classList.toggle('hidden');
        });

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
            
            setTimeout(() => {
                chatroom.classList.remove('animate-theme');
                otherElements.forEach(element => {
                    element.classList.toggle('hidden');
                });
            }, 1300);
        }, 10);
    }
});
