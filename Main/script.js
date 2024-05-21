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
        const messagesToRemove = [];
    
        Object.keys(loadedMessages).forEach(messageID => {
            const receivedMessage = messages.find(message => message.messageID === messageID);
    
            if (!receivedMessage) {
                messagesToRemove.push(messageID);
            } else {
                if (loadedMessages[messageID] !== receivedMessage.message) {
                    const parentElement = document.getElementById(messageID);
                    let parentTextContent = "";
                    for (let i = 0; i < parentElement.childNodes.length; i++) {
                        const childNode = parentElement.childNodes[i];
                        if (childNode.nodeType === Node.TEXT_NODE) {
                            parentTextContent += childNode.textContent;
                        }
                    }
    
                    if (parentTextContent !== receivedMessage.message) {
                        const messageToUpdate = document.getElementById(messageID);
                        if (messageToUpdate) {
                            messageToUpdate.textContent = receivedMessage.message;
                        }
                    }
                }
            }
        });
    
        messagesToRemove.forEach(messageID => {
            const messageElements = document.querySelectorAll(`[data-message-id="${messageID}"]`);
            messageElements.forEach(element => {
                element.remove();
            });
            delete loadedMessages[messageID];
        });
    
        messages.forEach(message => {
            const { sender, message: messageText, messageID, isloaded } = message;
    
            if (!loadedMessages[messageID]) {
                const newMessageLine = document.createElement('div');
                const newMessage = document.createElement('div');
                const newMessageText = document.createElement('div');
                const newMessageSender = document.createElement('div');
    
                newMessageLine.style.width = "100%";
                newMessageLine.style.marginTop = "5px";
                newMessage.classList.add('message');
                newMessage.dataset.messageId = messageID;
                newMessageText.dataset.messageId = messageID;
                newMessageSender.dataset.messageId = messageID;
                newMessageLine.dataset.messageId = messageID;
                newMessage.style.width = "300px";
                newMessage.dataset.isloaded = isloaded;
    
                newMessageSender.textContent = `${sender}: `;
                if (sender === username) {
                    newMessageSender.style.display = 'none'; // Hide for current user's messages
                    newMessageText.textContent = `${messageText} `;
                    newMessage.style.float = "right"; 
                    newMessage.style.textAlign = "right";
                    newMessage.style.backgroundColor = "rgb(32, 14, 107)";
                    newMessage.style.marginRight = "2rem";
                    newMessageText.classList.add("MyMessage");
                } else {
                    newMessageText.textContent = `${messageText} `;
                    newMessage.style.float = "left";
                    newMessage.style.textAlign = "left";
                    newMessage.style.marginLeft = "2rem";
                }
    
                newMessageText.id = messageID;
                chatMessages.appendChild(newMessageLine);
                newMessageLine.appendChild(newMessage);
                newMessage.appendChild(newMessageSender); // Always append newMessageSender
                newMessage.appendChild(newMessageText);
    
                const newMessageHeight = newMessage.offsetHeight;
                newMessageLine.style.height = newMessageHeight + "px";
                loadedMessages[messageID] = true;
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        });
    }
    
    
    function loadMessages() {
        if (konto.textContent.trim() != "Zaloguj sie") {
            fetch('Main/load_messages.php')
                .then(response => response.json())
                .then(messages => {
                    handleReceivedMessages(messages);
                })
                .catch(error => console.error('Error loading messages:', error));
        }
    }
    


    function sendMessage(event) {
        event.preventDefault();
        console.log(canEdit);
        if (canEdit == false){
        const messageText = textArea.value;
        const sender = username;
        messageID = Date.now() + Math.random().toString(36).substr(2, 9); 
        const formData = new FormData();
        formData.append('message', messageText);
        formData.append('sender', sender);
        formData.append('messageID', messageID);

        const xhr = new XMLHttpRequest();
        if (textArea.value != '')
        {
        xhr.open("POST", "Main/save_message.php", true);
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
        const sender = username;
        const formData = new FormData();
        console.log(messageID);
        formData.append('message', message);
        formData.append('sender', sender);
        formData.append('messageID', messageID);
        const xhr = new XMLHttpRequest();
        if (textArea.value != '')
        {
        document.getElementById(messageID).textContent = textArea.value;
        xhr.open("POST", "Main/edit_message.php", true);
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
        fetch('Main/save_message.php', {
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
        if (konto.textContent.trim() != "Zaloguj sie") {
            popup.style.display = "block";
            chatroom.classList.add("blur");
        }
    }

    const loggedIn = localStorage.getItem('loggedIn');
    const username = localStorage.getItem('username');
    
    if (loggedIn === 'true' && username) {
        // Automatically log the user in
        const accountLink = document.getElementById('accountLink');
        loadMessages();
        setInterval(loadMessages,500);
        id = username;
        accountLink.textContent = username;
        accountLink.href = "#";
        // Show chat messages and text input
        document.getElementById('chat-messages').style.display = 'block';
        document.querySelector('.text').style.display = 'block';
        document.getElementById('chatTitle').textContent = username;
        document.querySelector('.chat h1').textContent = 'Chatuj';
    }

    function Logout(){
        document.querySelector('.text').style.display = 'none';
        document.getElementById('chat-messages').style.display = 'none';
        const accountLink = document.getElementById('accountLink');
        accountLink.textContent = "Zaloguj sie";
        accountLink.href = "LogIn.html";
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('username');
        document.getElementById('chatTitle').textContent = 'Wybierz Konto';
        popup.style.display = "none";
        chatroom.classList.remove("blur");
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
            xhr.open('POST', 'Main/delete_message.php', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        document.querySelectorAll(`[data-message-id="${messageID}"]`).forEach(element => {
                            element.remove(); // Remove elements instead of hiding them
                        });
                        MessageMenu.style.display = 'none'; // Hide menu after deletion
                        delete loadedMessages[messageID]; // Properly remove the message from loadedMessages
                    } else {
                        console.error('Error deleting message');
                    }
                }
            };
            xhr.send('messageID=' + encodeURIComponent(messageID));
        }
        
        
    
    

    // Nasłuchiwacze zdarzeń
    
    document.getElementById('messageForm').addEventListener('submit', sendMessage);
    document.getElementById('reset-button').addEventListener('click', clearMessages);
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