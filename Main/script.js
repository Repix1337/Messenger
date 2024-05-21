document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const theme = document.getElementById('theme');
    const chatMessages = document.getElementById('chat-messages');
    const textArea = document.getElementById('textarea');
    const sendButton = document.getElementById('send');
    const konto = document.querySelector(".konto");
    const popup = document.getElementById('popup'); 
    const messageMenu = document.getElementById('MessageMenu'); 
    const chatroom = document.querySelector('.chatroom');
    const deleteMessageButton = document.getElementById('DeleteMessageButton');
    const editMessageButton = document.getElementById('EditMessageButton');
    
    // State Variables
    let isDarkTheme = false;
    let canChangeTheme = true;
    let currentUser;
    let messageID;
    let loadedMessages = {}; // Object storing loaded messages
    let canEdit = false;

    // Handle received messages and update the DOM
    function handleReceivedMessages(messages) {
        const messagesToRemove = [];
    
        Object.keys(loadedMessages).forEach(messageID => {
            const receivedMessage = messages.find(message => message.messageID === messageID);
    
            if (!receivedMessage) {
                messagesToRemove.push(messageID);
            } else {
                updateMessageContentIfNeeded(messageID, receivedMessage.message);
            }
        });
    
        removeMessages(messagesToRemove);
        displayNewMessages(messages);
    }

    function updateMessageContentIfNeeded(messageID, newMessageContent) {
        const messageElement = document.getElementById(messageID);
        if (!messageElement) return;

        const messageTextContent = Array.from(messageElement.childNodes)
                                        .filter(node => node.nodeType === Node.TEXT_NODE)
                                        .map(node => node.textContent)
                                        .join('');

        if (messageTextContent !== newMessageContent) {
            messageElement.textContent = newMessageContent;
        }
    }

    function removeMessages(messageIDs) {
        messageIDs.forEach(messageID => {
            document.querySelectorAll(`[data-message-id="${messageID}"]`).forEach(element => {
                element.remove();
            });
            delete loadedMessages[messageID];
        });
    }

    function displayNewMessages(messages) {
        messages.forEach(message => {
            const { sender, message: messageText, messageID, isloaded } = message;
    
            if (!loadedMessages[messageID]) {
                createMessageElement(sender, messageText, messageID, isloaded);
                loadedMessages[messageID] = true;
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        });
    }

    function createMessageElement(sender, messageText, messageID, isloaded) {
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
        if (sender === currentUser) {
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
    }
    
    function loadMessages() {
        if (konto.textContent.trim() != "Zaloguj sie") {
            fetch('Main/load_messages.php')
                .then(response => response.json())
                .then(messages => handleReceivedMessages(messages))
                .catch(error => console.error('Error loading messages:', error));
        }
    }

    function sendMessage(event) {
        event.preventDefault();
        const messageText = textArea.value;
        if (messageText.trim() === '') return;

        if (!canEdit) {
            sendMessageToServer(messageText);
        } else {
            editMessageOnServer(messageText);
        }
    }

    function sendMessageToServer(messageText) {
        const sender = currentUser;
        messageID = Date.now() + Math.random().toString(36).substr(2, 9);
        const formData = new FormData();
        formData.append('message', messageText);
        formData.append('sender', sender);
        formData.append('messageID', messageID);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "Main/save_message.php", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
                textArea.value = '';
                sendButton.disabled = true;
                setTimeout(() => {
                    sendButton.disabled = false;
                }, 800);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        };
        xhr.send(formData);
    }

    function editMessageOnServer(messageText) {
        canEdit = false;
        const formData = new FormData();
        formData.append('message', messageText);
        formData.append('sender', currentUser);
        formData.append('messageID', messageID);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "Main/edit_message.php", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                document.getElementById(messageID).textContent = messageText;
                textArea.value = '';
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
        fetch('Main/save_message.php', {
            method: 'POST',
            body: JSON.stringify({ clearAll: true }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                chatMessages.innerHTML = '';
            } else {
                console.error('Error clearing messages:', data.error);
            }
        })
        .catch(error => console.error('Error clearing messages:', error));
    }

    function showLogoutPopup() {
        if (konto.textContent.trim() !== "Zaloguj sie") {
            popup.style.display = "block";
            chatroom.classList.add("blur");
        }
    }

    function logout() {
        document.querySelector('.text').style.display = 'none';
        chatMessages.style.display = 'none';
        const accountLink = document.getElementById('accountLink');
        accountLink.textContent = "Zaloguj sie";
        accountLink.href = "LogIn.html";
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('username');
        document.getElementById('chatTitle').textContent = 'Wybierz Konto';
        popup.style.display = "none";
        chatroom.classList.remove("blur");
    }

    function clickMessage(event) {
        let mess = event.target;
        if (mess.classList.contains("MyMessage")) {
            messageID = mess.dataset.messageId;
            messageMenu.style.display = 'block';
            mess.append(messageMenu);
        }
    }

    function editMessage() {
        const parentElement = document.getElementById(messageID);
        let parentTextContent = "";
    
        // Extract text content from child text nodes
        for (let i = 0; i < parentElement.childNodes.length; i++) {
            const childNode = parentElement.childNodes[i];
            if (childNode.nodeType === Node.TEXT_NODE) {
                parentTextContent += childNode.textContent;
            }
        }
    
        // Set the text area value to the extracted text content
        textArea.value = parentTextContent.trim();
    
        // Hide the message menu
        messageMenu.style.display = 'none';
    
        // Set the flag to indicate that the message is being edited
        canEdit = true;
    }
    
    function deleteSpecificMessage() {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'Main/delete_message.php', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                document.querySelectorAll(`[data-message-id="${messageID}"]`).forEach(element => {
                    element.remove();
                });
                messageMenu.style.display = 'none';
                delete loadedMessages[messageID];
            } else {
                console.error('Error deleting message');
            }
        };
        xhr.send('messageID=' + encodeURIComponent(messageID));
    }

    function toggleTheme() {
        if (!canChangeTheme) return;

        const otherElements = document.querySelectorAll('.side-menu, .popup, .chat, #theme');
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
                document.querySelector("body").style.background = "rgb(255, 255, 255)";
            } else {
                chatroom.style.background = "radial-gradient(circle at center, #000000, #0000ff 30%, #800080 60%, #000000 90%)";
                chatroom.style.color = "white";
                document.querySelector("body").style.background = "rgb(0, 0, 0)";
            }
            
            setTimeout(() => {
                chatroom.classList.remove('animate-theme');
                otherElements.forEach(element => {
                    element.classList.toggle('hidden');
                });
            }, 1300);
        }, 10);
    }

    // Event Listeners
    document.getElementById('messageForm').addEventListener('submit', sendMessage);
    document.getElementById('reset-button').addEventListener('click', clearMessages);
    konto.addEventListener('click', showLogoutPopup);
    document.getElementById("tak").addEventListener('click', logout);
    document.getElementById("nie").addEventListener('click', () => {
        popup.style.display = "none";
        chatroom.classList.remove("blur");
    });
    theme.addEventListener('click', toggleTheme);
    chatMessages.addEventListener('click', clickMessage);
    deleteMessageButton.addEventListener('click', deleteSpecificMessage);
    editMessageButton.addEventListener('click', editMessage);
    messageMenu.addEventListener('mouseleave', () => {
        messageMenu.style.display = 'none';
    });

    // Automatic Login
    const loggedIn = localStorage.getItem('loggedIn');
    const username = localStorage.getItem('username');
    
    if (loggedIn === 'true' && username) {
        currentUser = username;
        loadMessages();
        setInterval(loadMessages, 500);
        const accountLink = document.getElementById('accountLink');
        accountLink.textContent = username;
        accountLink.href = "#";
        document.getElementById('chat-messages').style.display = 'block';
        document.querySelector('.text').style.display = 'block';
        document.getElementById('chatTitle').textContent = username;
        document.querySelector('.chat h1').textContent = 'Chatuj';
    }
});

           
