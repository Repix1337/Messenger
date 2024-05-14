document.addEventListener("DOMContentLoaded", () => {
    // Elementy interfejsu użytkownika
    const theme = document.getElementById('theme');
    const chatMessages = document.getElementById('chat-messages');
    const textArea = document.getElementById('textarea');
    const sendButton = document.getElementById('send');
    const konto = document.querySelector(".konto");
    const popup = document.getElementById('popup'); 
    const MessageMenu = document.getElementById('MessageMenu'); 
    const chatroom = document.querySelector('.chatroom');
    const DeleteMessageButton = document.getElementById('DeleteMessageButton');
    const EditMessageButton = document.getElementById('EditMessageButton');
    
    // Zmienne stanu
    let isDarkTheme = false;
    let canChangeTheme = true;
    let id;
    let messageID;
    let loadedMessages = {}; // Obiekt przechowujący informacje o załadowanych wiadomościach

    function handleReceivedMessages(messages) {
        // Store IDs of messages to be removed
        const messagesToRemove = [];
    
        // Loop through loaded messages
        Object.keys(loadedMessages).forEach(messageID => {
            // Find the corresponding message in the received messages array
            const receivedMessage = messages.find(message => message.messageID === messageID);
    
            // Check if the message ID is not present in the received messages
            if (!receivedMessage) {
                // Add the message ID to the list of messages to remove
                messagesToRemove.push(messageID);
            } else {
                // Check if the message content is different
                if (loadedMessages[messageID] !== receivedMessage.message) {
                    // Get the parent element
                    const parentElement = document.getElementById(messageID);
                
                    // Get the text content of the parent element and its children
                    let parentTextContent = "";
                    for (let i = 0; i < parentElement.childNodes.length; i++) {
                        const childNode = parentElement.childNodes[i];
                        if (childNode.nodeType === Node.TEXT_NODE) {
                            parentTextContent += childNode.textContent;
                        }
                    }
                
                    // Check if the text content of the parent element is different
                    if (parentTextContent !== receivedMessage.message) {
                        // Update the message content in the DOM
                        const messageToUpdate = document.getElementById(messageID);
                        if (messageToUpdate) {
                            messageToUpdate.textContent = receivedMessage.message;
                        }
                    }
                }
            }});
                
    
        // Remove messages from DOM
        messagesToRemove.forEach(messageID => {
            const messageToRemove = document.getElementById(messageID);
            if (messageToRemove) {
                messageToRemove.remove();
                // Remove from loadedMessages object as well
                delete loadedMessages[messageID];
            }
        });
    
        // Add new messages to DOM
        messages.forEach(message => {
            const { sender, message: messageText, messageID, isloaded } = message;
    
            // Check if message is not already loaded
            if (!loadedMessages[messageID]) {
                const newMessageLine = document.createElement('div');
                const newMessage = document.createElement('div');
                const newMessageText = document.createElement('div');
                const newMessageSender = document.createElement('div');
                newMessageLine.style.width = "100%";
                newMessageLine.style.marginTop = "5px";
                newMessage.style.width = "300px";
                newMessage.classList.add('message', messageID);
                newMessage.dataset.isloaded = isloaded; // Set 'data-isloaded' attribute
                if (sender === konto.textContent.trim()) {
                    newMessageSender.textContent = `${sender}: `;
                    newMessageText.textContent = `${messageText} `;
                    newMessage.style.float = "right"; 
                    newMessage.style.textAlign = "right";
                    newMessage.style.backgroundColor = "rgb(32, 14, 107)";
                    newMessage.style.marginRight = "2rem";
                    newMessageText.classList.add("MyMessage");
                } else {
                    newMessageSender.textContent = `${sender}: `;
                    newMessageText.textContent = `${messageText} `;
                    newMessage.style.float = "left";
                    newMessage.style.textAlign = "left";
                    newMessage.style.marginLeft = "2rem";
                    newMessage.appendChild(newMessageSender);
                }
                newMessageText.id = messageID;
                chatMessages.appendChild(newMessageLine);
                newMessageLine.appendChild(newMessage);
                newMessage.appendChild(newMessageText);
                newMessageText.classList.add(messageID);
                newMessageLine.classList.add(messageID);
                newMessage.classList.add(messageID);
                newMessageText.id = messageID;
                newMessageSender.classList.add(messageID);
                const newMessageHeight = newMessage.offsetHeight;
                newMessageLine.style.height = newMessageHeight + "px";
                loadedMessages[messageID] = true;
            }
        });
    }
    function loadMessages() {
        if (konto.textContent.trim() != "Niezalogowany") {
            fetch('load_messages.php')
                .then(response => response.json())
                .then(messages => {
                    handleReceivedMessages(messages);
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
        console.log(canEdit);
        if (canEdit == false){
        const messageText = textArea.value;
        const sender = konto.textContent.trim();
        messageID = Date.now() + Math.random().toString(36).substr(2, 9); 
        const formData = new FormData();
        formData.append('message', messageText);
        formData.append('sender', sender);
        formData.append('messageID', messageID);

        const xhr = new XMLHttpRequest();
        if (textArea.value != '')
        {
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
            
        }};
        xhr.send(formData);
    }}
    else{
        canEdit = false;
        const message = textArea.value;
        const sender = konto.textContent.trim();
        const formData = new FormData();
        console.log(messageID);
        formData.append('message', message);
        formData.append('sender', sender);
        formData.append('messageID', messageID);
        const xhr = new XMLHttpRequest();
        if (textArea.value != '')
        {
        document.getElementById(messageID).textContent = textArea.value;
        xhr.open("POST", "edit_message.php", true);
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
    }}
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
        if (konto.textContent.trim() != "Niezalogowany") {
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
    function ClickMessage(event){
        let mess = event.target;
        if (mess.classList.contains(mess.id) && mess.classList.contains("MyMessage")) {
            messageID = mess.id;
            messageText = mess.textContent;
            console.log(messageID)
            MessageMenu.style.display = 'block';
            mess.append(MessageMenu);
            return messageID;
        }
    }
    let canEdit = false;
    function EditMessage(){
var parentElement = document.getElementById(messageID);
var parentTextContent = "";
for (var i = 0; i < parentElement.childNodes.length; i++) {
    var childNode = parentElement.childNodes[i];
    if (childNode.nodeType === Node.TEXT_NODE) {
        parentTextContent += childNode.textContent;
    }
}
textArea.value = parentTextContent.trim();
MessageMenu.style.display = 'none'; 
canEdit = true;
        }  
    function DeleteSpecificMessage() {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'delete_message.php', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    document.querySelectorAll('[class*="' + messageID + '"]').forEach(element => {
                        element.remove();
                    });
                    MessageMenu.style.display = 'none'; // Hide menu after deletion
                    loadedMessages[messageID] = false;
                    
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
        document.querySelector('.chat h1').textContent = 'Chatuj';
        checkAccountAvailability(accountId);
    }

    // Nasłuchiwacze zdarzeń
    document.querySelectorAll('.person').forEach(person => {
        let personID = person.id
        person.addEventListener('click', () => selectAccount(personID));
    });
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
    EditMessageButton.addEventListener('click', EditMessage);
    MessageMenu.addEventListener('mouseleave', () => {
        MessageMenu.style.display = 'none';
    });
     
    window.addEventListener('beforeunload', function(event) {
        updateAccountStatus(id, "release");
        document.getElementById(id).style.display = "flex";
    });

    // Sprawdzanie dostępności kont
    function CheckAccount(){
        document.querySelectorAll('.person').forEach(person => {
            let personID = person.id
            checkAccountAvailability(personID);
        } )
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
