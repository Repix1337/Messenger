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
        } else if (data.type === 'loadChats') {
            handleReceivedChats(data.chatInfo);
        } else if (data.type === 'newChat') {
            displayNewChats([data.chat]);
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
        console.log('Displaying new messages:', messages);
        messages.forEach(message => {
            const sender = message.sender;
            const messageText = message.message;
            const chatID = localStorage.getItem('SelectedChat')
            let messageID
            if (message.messageid != null){
                messageID = message.messageid;
            }
            else
            {
            messageID = message.messageID;
        }
            console.log('Processing message:', message);
    
            if (!loadedMessages[messageID] && chatID === message.chatid) {
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
        const chatid = localStorage.getItem('SelectedChat');
        console.log(chatid)
        if (!message) return;

        socket.send(JSON.stringify({
            type: 'newMessage',
            message: {
                sender: currentUser,
                message,
                messageID,
                chatid
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
    function ChatCreationSwap(){
        if (!Chatcreation){
            ChatCreateForm.style.display = 'flex';
            ChatList.style.display = 'none';
            Chatcreation = true;
        }
        else{
            ChatCreateForm.style.display = 'none';
            ChatList.style.display = 'flex';
            Chatcreation = false;    
        }
    }
    function ChatCreate(event) {
        event.preventDefault();
        let ChatName = document.getElementById('Name').value;
        let ChatPassword = document.getElementById('password').value;
        let Author = currentUser; // Assuming `currentUser` is defined correctly
        let ChatID = Date.now() * 16;
    
        console.log('ChatName:', ChatName);
        console.log('ChatPassword:', ChatPassword);
        console.log('Author:', Author);
        console.log('ChatID:', ChatID);
    
        socket.send(JSON.stringify({
            type: 'newChat',
            chatInfo: {
                chatid: ChatID,
                name: ChatName,
                password: ChatPassword,
                author: Author
            }
        }));
    
        console.log('ChatSelector:', ChatSelector);
        console.log('Chat Element:', document.querySelector('.chat'));
        console.log('Chat Messages:', document.getElementById('chat-messages'));
    
        ChatSelector.style.display = 'none';
        document.querySelector('.chat').style.display = 'flex';
        document.getElementById('chat-messages').style.display = 'block';
        socket.send(JSON.stringify({ type: 'loadMessages' }));
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
            console.log('Displaying new Chats:', chats);
        chats.forEach(chat => {
            const ChatID = chat.chatid;
            const ChatName = chat.name;
            const ChatPassword = chat.password;
            const Author = chat.author
        
            console.log('Processing Chat:', chat);
    
            if (!loadedChats[ChatID]) {
                createChatElement(ChatID, ChatName, ChatPassword,Author);
                loadedChats[ChatID] = true;
                ChatList.scrollTop = ChatList.scrollHeight; // Scroll to the bottom after adding the new message
            } else {
                console.log('Chat already loaded:', chatID);
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
        function JoinAChat(){
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
    theme.addEventListener('click', toggleTheme);
    chatMessages.addEventListener('click', clickMessage);
    deleteMessageButton.addEventListener('click', deleteSpecificMessage);
    editMessageButton.addEventListener('click', editMessage);
    messageMenu.addEventListener('mouseleave', () => {
        messageMenu.style.display = 'none';
    });
    ChatList.addEventListener('click', (event) => {
        if (event.target.classList.contains('ChatElements')) {
            localStorage.setItem('SelectedChat', event.target.id)
            console.log(localStorage.getItem('SelectedChat'))
            JoinAChat();
            
        }
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
