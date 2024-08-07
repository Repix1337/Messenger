document.addEventListener("DOMContentLoaded", () => {
    localStorage.setItem('SelectedChat', null);
    const theme = document.getElementById('theme');
    const chatMessages = document.getElementById('chat-messages');
    const textArea = document.getElementById('textarea');
    const konto = document.querySelector(".konto");
    const popup = document.getElementById('popup'); 
    const messageMenu = document.getElementById('MessageMenu'); 
    const chatroom = document.querySelector('.chatroom');
    const deleteMessageButton = document.getElementById('DeleteMessageButton');
    const editMessageButton = document.getElementById('EditMessageButton');
    const ChatSelector = document.getElementById('Chat-selector')
    const ChatCreateButton = document.getElementById('ChatCreateButton');
    const ChatList = document.getElementById('Chats');
    const ChatCreateForm = document.getElementById('ChatCreateForm');
    const CreateChat = document.getElementById('Create');
    const GoBack = document.getElementById('GoBack')
    const popupPassword = document.getElementById('popupPassword')
    const ChatPasswordInput = document.getElementById('chatPasswordInput');
    const ChatSubmitPassword = document.getElementById('chatSubmitPassword');
   

    let isDarkTheme = false;
    let canChangeTheme = true;
    let currentUser;
    let messageID;
    let loadedMessages = {}; // Object storing loaded messages
    let loadedChats = {};
    let canEdit = false;
    let Chatcreation = false

    const socket = new WebSocket('ws://localhost:8080');

    socket.addEventListener('open', () => {
        console.log('Connected to WebSocket');
        socket.send(JSON.stringify({ type: 'loadChats' }));
    });

    socket.addEventListener('message', event => {
        var data = JSON.parse(event.data);
        
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
        } else if (data.type === 'loadChats') {
            handleReceivedChats(data.chatInfo);
        } else if (data.type === 'newChat') {
            displayNewChats([data.chat]);
        }else if (data.type === 'joinChat') {
            DoesItHavePassword([data.chatInfo]);
        } else if (data.type === 'passwordCheck') {
            if (data.success) {
                popupPassword.style.display = 'none';
                chatroom.style.display = 'block';
                JoinAChat();
            } else {
                alert('Incorrect password. Please try again.');
            }
        }  else {
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
        messages.forEach(message => {
            let imagePath;
            let messageID
            const sender = message.sender;
            const messageText = message.message;
            const chatID = localStorage.getItem('SelectedChat')
            if (message.imagePath != null){
                imagePath = message.imagePath; 
            }
            else{
                imagePath = null; 
            }
            if (message.messageid != null){
                messageID = message.messageid;
            }
            else
            {
            messageID = message.messageID;
        }
            
            if (!loadedMessages[messageID] && chatID === message.chatid) {
                createMessageElement(sender, messageText, messageID, imagePath);
                loadedMessages[messageID] = true;
                chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom after adding the new message
            } 
        });
    }
    
    
    function createMessageElement(sender, messageText, messageID, imagePath) {
        const newMessageLine = document.createElement('div');
        const newMessage = document.createElement('div');
        const newMessageText = document.createElement('div');
        const img = document.createElement('img');
        const newMessageSender = document.createElement('div');
    
        newMessageLine.style.width = "100%";
        newMessageLine.classList.add('messageLine');
        newMessageLine.style.marginTop = "5px";
        newMessage.classList.add('message');
        newMessage.dataset.messageId = messageID;
        newMessageText.dataset.messageId = messageID;
        newMessageSender.dataset.messageId = messageID;
        newMessageLine.dataset.messageId = messageID;
        newMessage.style.width = "300px";
    
        newMessageSender.textContent = sender;
        newMessageSender.style.color = 'rgb(41, 255, 144)'
        if (sender.toLowerCase() === currentUser.toLowerCase()) {
            newMessageSender.style.display = 'none'; // Hide for current user's messages
            newMessageText.textContent = `${messageText} `;
            newMessage.style.float = "right";
            newMessage.style.textAlign = "right";
            newMessage.style.textAlign = "left";
            if (newMessageText.textContent.trim() != "")
            {
            newMessage.style.background = 'linear-gradient(to right, #800080, #DA70D6)';
            }   
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
        if (imagePath != null) {
            img.src = imagePath;
            img.style.width = '100%';
            img.style.height = '200px';
            img.alt = 'Image';
            img.style.borderRadius = "10px";
            newMessage.appendChild(img); // Correctly append the image to the newMessage element
        }
        newMessage.appendChild(newMessageText);
        console.log(newMessageText.textContent);
        if (newMessageText.textContent.trim() === ""){
            newMessage.style.backgroundColor = 'rgba(0,0,0,0)';
            newMessage.style.border = 'rgba(0,0,0,0)';
        }
        const newMessageHeight = newMessage.offsetHeight;
        newMessageLine.style.height = newMessageHeight + "px";
    }
    function sendMessage(event) {
        event.preventDefault();
    
        const message = textArea.value.trim();
        const messageID = Date.now().toString(); // Generate a unique message ID
        const chatid = localStorage.getItem('SelectedChat');
        const imageInput = document.getElementById('imageInput');
        const image = imageInput.files[0];
    
        if (!message && !image) return; // Prevent sending if both message and image are empty
    
        const formData = new FormData();
        formData.append('sender', currentUser);
        formData.append('message', message);
        formData.append('messageID', messageID);
        formData.append('chatid', chatid);
        
        if (image) {
            formData.append('image', image);
    
            fetch('http://localhost:3000/sendMessage', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Send message through WebSocket
                    socket.send(JSON.stringify({
                        type: 'newMessage',
                        message: {
                            sender: currentUser,
                            message,
                            messageID,
                            chatid,
                            imagePath: data.imagePath // Add imagePath to the WebSocket message
                        }
                    }));
    
                    // Update the UI immediately without refresh
                    displayNewMessages([{
                        sender: currentUser,
                        message,
                        messageID,
                        chatid,
                        imagePath: data.imagePath
                    }]);
    
                    // Clear input fields
                    textArea.value = '';
                    imageInput.value = '';
                } else {
                    console.error(data.error);
                }
            })
            .catch(error => {
                console.error('Error sending message:', error);
            });
        } else {
            // Send message through WebSocket for text-only messages
            socket.send(JSON.stringify({
                type: 'newMessage',
                message: {
                    sender: currentUser,
                    message,
                    messageID,
                    chatid
                }
            }));
    
            // Clear input fields
            textArea.value = '';
            imageInput.value = '';
        }
    }

    
    document.getElementById('messageForm').addEventListener('submit', sendMessage);
    
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
        popup.style.display = "block";
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

    function GoBackToTheList(){
        loadedMessages = {};
        ChatSelector.style.display = 'flex';
        document.querySelector('.chat').style.display = 'none';
        document.getElementById('chat-messages').style.display = 'none';
        document.querySelectorAll('.messageLine').forEach(element => {
            element.remove();
        })
        ChatCreateForm.style.display = 'none';
            ChatList.style.display = 'block';
            Chatcreation = false;  
            ChatCreateButton.style.display = 'flex';
    }
    function ChatCreationSwap(){
        if (!Chatcreation){
            ChatCreateForm.style.display = 'flex';
            ChatList.style.display = 'none';
            Chatcreation = true;
        }
        else{
            ChatCreateForm.style.display = 'none';
            ChatList.style.display = 'block';
            Chatcreation = false;    
        }
    }
    function ChatCreate(event) {
        event.preventDefault();
        
        let ChatName = document.getElementById('Name').value;
        let ChatPassword = document.getElementById('password').value;
        let Author = currentUser; // Assuming `currentUser` is defined correctly
        let ChatID = Date.now() * 16;
    
        
        socket.send(JSON.stringify({
            type: 'newChat',
            chatInfo: {
                chatid: ChatID,
                name: ChatName,
                password: ChatPassword,
                author: Author
            }
        }));
        document.getElementById('chatTitle').textContent = ChatName;
        ChatSelector.style.display = 'none';
        document.querySelector('.chat').style.display = 'flex';
        document.getElementById('chat-messages').style.display = 'block';
        localStorage.setItem('SelectedChat', ChatID);
        socket.send(JSON.stringify({ type: 'loadMessages' }));
        document.querySelectorAll('.messageLine').forEach(element => {
            element.remove();
        })
        loadedMessages = {};
    }
    
    
        function handleReceivedChats(chats) {
            const chatsToRemove = [];
    
            Object.keys(loadedChats).forEach(chatID => {
                const receivedChat = chats.find(chat => chat.chatid === chatID);
    
                if (!receivedChat) {
                    chatsToRemove.push(chatID);
                } 
            });
    
            displayNewChats(chats);
        }
        function displayNewChats(chats){
            
        chats.forEach(chat => {
            const ChatID = chat.chatid;
            const ChatName = chat.name;
            const ChatPassword = chat.password;
            const Author = chat.author
        
            if (!loadedChats[ChatID]) {
                createChatElement(ChatID, ChatName, ChatPassword,Author);
                loadedChats[ChatID] = true;
                ChatList.scrollTop = ChatList.scrollHeight; // Scroll to the bottom after adding the new message
            } 
        });
    }
        function createChatElement(ChatID, ChatName, ChatPassword,Author){
        const newChatLine = document.createElement('div');
        const newChat = document.createElement('div');
        const newChatName = document.createElement('div');
        const newChatAuthor = document.createElement('div');
    
        newChatLine.style.width = "100%";
        newChatLine.style.marginTop = "5px";
        newChat.classList.add('ChatElements');
        newChatName.classList.add('ChatName');
        newChat.dataset.chatID = ChatID;
        newChatName.dataset.chatID = ChatID;
        newChatAuthor.dataset.chatID = ChatID;
        newChatLine.dataset.chatID = ChatID;
        newChatAuthor.textContent = `${Author}: `;
        newChatName.textContent = `${ChatName} `;
        newChat.style.zIndex = '999';
        newChatName.style.zIndex = '-1';
        newChatAuthor.style.zIndex = '-1';
        newChat.id = ChatID;
        ChatList.appendChild(newChatLine);
        newChatLine.appendChild(newChat);
        newChat.appendChild(newChatAuthor);
        newChat.appendChild(newChatName);
        const newChatHeight = newChat.offsetHeight;
        newChatLine.style.height = newChatHeight + "px";
        }
        function DoesItHavePassword(chats) {
            const selectedChatId = localStorage.getItem('SelectedChat');
        
            chats.forEach(fakechat => {
                fakechat.forEach(chat => {
                if (chat.chatid == selectedChatId) { 
                    if (chat.password === '') {
                        JoinAChat();
                    } else {
                        popupPassword.style.display = 'block';
                        document.getElementById('noclick').style.display = 'block';
                        chatroom.classList.add("blur");
                    }
                }
            })});
        }
        
        function JoinAChat(){
        ChatPasswordInput.value = '';
        chatroom.classList.remove("blur");
        ChatSelector.style.display = 'none';
        document.querySelector('.chat').style.display = 'flex';
        document.getElementById('chat-messages').style.display = 'block';
        socket.send(JSON.stringify({ type: 'loadMessages' }));
        }
        
        

    // Event Listeners
    document.getElementById('messageForm').addEventListener('submit', sendMessage);
    document.getElementById('reset-button').addEventListener('click', clearMessages);
    konto.addEventListener('click', showLogoutPopup);
    CreateChat.addEventListener('click', ChatCreate)
    ChatCreateButton.addEventListener('click',ChatCreationSwap)
    document.getElementById("tak").addEventListener('click', logout);
    document.getElementById("nie").addEventListener('click', () => {
        popup.style.display = "none";
        chatroom.classList.remove("blur");
    });
    ChatSubmitPassword.addEventListener('click', (event) => {
        event.preventDefault();
        const chatid = localStorage.getItem('SelectedChat');
        const password = ChatPasswordInput.value;

        socket.send(JSON.stringify({
            type: 'checkPassword',
            chatid,
            password
        }));
    });
    GoBack.addEventListener('click', GoBackToTheList);
    theme.addEventListener('click', toggleTheme);
    chatMessages.addEventListener('click', clickMessage);
    deleteMessageButton.addEventListener('click', deleteSpecificMessage);
    editMessageButton.addEventListener('click', editMessage);
    document.getElementById('imgButton').addEventListener('click', function() {
        document.getElementById('imageInput').click();
    });
    messageMenu.addEventListener('mouseleave', () => {
        messageMenu.style.display = 'none';
    });
    ChatList.addEventListener('click', (event) => {
        if (event.target.classList.contains('ChatElements')) {
            localStorage.setItem('SelectedChat', event.target.id)
            const chatNameElementValue = event.target.querySelector('.ChatName').textContent;
            document.getElementById('chatTitle').textContent = chatNameElementValue;
            socket.send(JSON.stringify({type: 'joinChat'}));
            
        }
    });
    document.getElementById('noclick').addEventListener('click', (event) => {
        if (!event.target.classList.contains('popupcontainerAndElements')){
            ChatPasswordInput.value = '';
            popupPassword.style.display = 'none';
            document.getElementById('noclick').style.display = 'none';
            chatroom.classList.remove("blur");
        }
        
    })
    document.getElementById('popupPassword').addEventListener('click', (event) => {
        event.stopPropagation();
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
        document.getElementById('chat-messages').style.display = 'none';
        document.getElementById('Chat-selector').style.display = 'flex';
        document.querySelector('.side-menu').style.display = 'flex';
        document.querySelector('.text').style.display = 'flex';
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
