document.addEventListener("DOMContentLoaded", () => {
    const theme = document.getElementById('theme');
    const chatMessages = document.getElementById('chat-messages');
    const textArea = document.getElementById('textarea');
    const konto = document.querySelector(".konto");
    const popup = document.getElementById('popup'); 
    const messageMenu = document.getElementById('MessageMenu'); 
    const chatroom = document.querySelector('.chatroom');
    const deleteMessageButton = document.getElementById('DeleteMessageButton');
    const editMessageButton = document.getElementById('EditMessageButton');

    let isDarkTheme = false;
    let canChangeTheme = true;
    let currentUser;
    let messageID;
    let loadedMessages = {}; // Object storing loaded messages
    let canEdit = false;

    const socket = new WebSocket('ws://localhost:8080');

    socket.addEventListener('open', () => {
        console.log('Connected to WebSocket');
        socket.send(JSON.stringify({ type: 'loadMessages' }));
    });

    socket.addEventListener('message', event => {
        const data = JSON.parse(event.data);
        console.log('Received data:', data);
    
        if (data.type === 'loadMessages') {
            handleReceivedMessages(data.messages);
        } else if (data.type === 'newMessage') {
            displayNewMessages([data.message]);
        } else if (data.type === 'editMessage') {
            updateMessageContentIfNeeded(data.message.messageID, data.message.message);
        } else if (data.type === 'deleteMessage') {
            removeMessages([data.messageID]);
        } else if (data.type === 'clearMessages') {
            removeMessages(Object.keys(loadedMessages));
        } else {
            console.error('Unexpected message format:', data);
        }
    });

    socket.addEventListener('error', event => {
        console.error('WebSocket error:', event);
    });

    socket.addEventListener('close', event => {
        console.log('WebSocket connection closed:', event);
    });

    function handleReceivedMessages(messages) {
        const messagesToRemove = [];

        Object.keys(loadedMessages).forEach(messageID => {
            const receivedMessage = messages.find(message => message.messageid === messageID);

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
        console.log('Displaying new messages:', messages);
        messages.forEach(message => {
            const sender = message.sender;
            const messageText = message.message;
            let messageID
            if (message.messageid != null){
                messageID = message.messageid;
            }
            else
            {
            messageID = message.messageID;
        }
            console.log('Processing message:', message);
    
            if (!loadedMessages[messageID]) {
                createMessageElement(sender, messageText, messageID);
                loadedMessages[messageID] = true;
                chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom after adding the new message
            } else {
                console.log('Message already loaded:', messageID);
            }
        });
    }
    
    
    function createMessageElement(sender, messageText, messageID) {
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
    
        newMessageSender.textContent = `${sender}: `;
        if (sender.toLowerCase() === currentUser.toLowerCase()) {
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
        newMessage.appendChild(newMessageSender);
        newMessage.appendChild(newMessageText);
        const newMessageHeight = newMessage.offsetHeight;
        newMessageLine.style.height = newMessageHeight + "px";
    }
    

    function sendMessage(event) {
        event.preventDefault();
        const message = textArea.value.trim();
        const messageID = Date.now().toString();

        if (!message) return;

        socket.send(JSON.stringify({
            type: 'newMessage',
            message: {
                sender: currentUser,
                message,
                messageID
            }
        }));

        textArea.value = '';
    }

    function clearMessages() {
        socket.send(JSON.stringify({ type: 'clearMessages' }));
        textArea.value = '';
    }

    function clickMessage(event) {
        const messageId = event.target.dataset.messageId;
        if (!messageId || !loadedMessages[messageId]) return;

        messageID = messageId;
        messageMenu.style.display = 'block';
       
    }

    function deleteSpecificMessage() {
        socket.send(JSON.stringify({
            type: 'deleteMessage',
            messageID
        }));
        messageMenu.style.display = 'none';
    }

    function editMessage() {
        const text = textArea.value.trim();
        if (!text) return;

        socket.send(JSON.stringify({
            type: 'editMessage',
            message: {
                message: text,
                messageID
            }
        }));

        messageMenu.style.display = 'none';
        textArea.value = '';
    }

    function showLogoutPopup() {
        popup.style.display = "flex";
        chatroom.classList.add("blur");
    }

    function logout() {
        localStorage.setItem('loggedIn', 'false');
        location.reload();
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
                chatroom.style.color = "rgb(20, 20, 20)";
                document.querySelector("body").style.background = "rgb(255, 255, 255)";
            } else {
                chatroom.style.background = "radial-gradient(circle at center, #000000, #0000ff 30%, #800080 60%, #000000 90%)";
                chatroom.style.color = "white";
                document.querySelector("body").style.background = "rgb(20, 20, 20)";
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
    const username = localStorage.getItem('username').toLowerCase();

    if (loggedIn === 'true' && username) {
        currentUser = username;
        chatroom.style.display = "block";
        document.querySelectorAll('.side').forEach(element => {
            element.style.display = 'none';
        });
        // Request to load messages after connection is established
        const accountLink = document.getElementById('accountLink');
        accountLink.textContent = username.toLowerCase();
        accountLink.href = "#";
        document.getElementById('chat-messages').style.display = 'block';
        document.querySelector('.side-menu').style.display = 'flex';
        document.querySelector('.text').style.display = 'flex';
        document.getElementById('chatTitle').textContent = 'Chatuj';
        document.getElementById('chatTitle').href = '#';
        document.getElementById('chatTitle').style.color = "white";
        
    }
    const left = document.getElementById("left-side");

    const handleMove = e => {
        left.style.width = `${e.clientX / window.innerWidth * 100}%`;
    };

    document.onmousemove = e => handleMove(e);

    document.ontouchmove = e => handleMove(e.touches[0]);
});
