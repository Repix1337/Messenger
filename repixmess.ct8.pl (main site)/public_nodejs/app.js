require('dotenv').config();  // Load environment variables from .env file

const WebSocket = require('ws');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'messenger',
    charset: 'utf8mb4'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database');
});

// Express route for handling file uploads and saving messages
app.post('/sendMessage', (req, res) => {
    const image = req.files ? req.files.image : null;

    let imagePath = null;

    if (image) {
        // Define the maximum file size in bytes (e.g., 2 MB)
        const MAX_SIZE = 10 * 1024 * 1024; // 2 MB

        // Check if the file size exceeds the limit
        if (image.size > MAX_SIZE) {
            return res.status(400).json({ success: false, error: 'File size exceeds 10 MB limit.' });
        }

        const imageId = uuidv4();
        imagePath = `../uploads/${imageId}_${image.name}`;
        const savePath = path.join(__dirname, 'public', 'uploads', `${imageId}_${image.name}`);

        image.mv(savePath, err => {
            if (err) {
                console.error('Error saving image:', err);
                return res.status(500).json({ success: false, error: err });
            }
        });
    }

    console.log('Message saved');
    res.status(200).json({ success: true, imagePath });
});
app.post('/sendIcon', (req, res) => {    
        const chatid = req.body.chatid
        const icon = req.files ? req.files.icon : null;
        let iconPath;

    if (icon) {
        const iconid = uuidv4();
        iconPath = `../icons/${iconid}_${icon.name}`;
        const savePath = path.join(__dirname, 'public', 'icons', `${iconid}_${icon.name}`);
        icon.mv(savePath, err => {
            if (err) {
                console.error('Error saving image:', err);
                return res.status(500).json({ success: false, error: err });
            }
            
        })}
        const query = 'UPDATE chats set iconpath = ? where chatid = ?';
            db.query(query, [iconPath, chatid], err => {
            if (err) {
                console.error('Error saving Avatar:', err.stack);
                return res.status(500).json({ success: false, error: 'Error saving Avatar' });
            }
            console.log(chatid);
        res.status(200).json({ success: true, iconPath });
        })})
        
        
    
    app.post('/sendAvatar', (req, res) => {
            const username = req.body.login;
            const avatar = req.files ? req.files.avatar : null;
            
            let avatarPath;
    
        if (avatar) {
            const avatarid = uuidv4();
            avatarPath = `../avatars/${avatarid}_${avatar.name}`;
            const savePath = path.join(__dirname, 'public', 'avatars', `${avatarid}_${avatar.name}`);
    
            avatar.mv(savePath, err => {
                if (err) {
                    console.error('Error saving image:', err);
                    return res.status(500).json({ success: false, error: err });
                }
            });
        }
        const query = 'UPDATE users set avatarpath = ? where login = ?';
            db.query(query, [avatarPath, username], err => {
            if (err) {
                console.error('Error saving Avatar:', err.stack);
                return res.status(500).json({ success: false, error: 'Error saving Avatar' });
            }
            console.log('Chat Avatar');
            res.status(200).json({ success: true, avatarPath });
        })})
// Create HTTP server
const server = require('http').createServer(app);

// Create WebSocket server and attach to HTTP server
const wss = new WebSocket.Server({ server });
console.log(server);
wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', message => {
        try {
            const data = JSON.parse(message);
            console.log(data);

            if (data.type === 'loadMessages') {
                loadMessages(ws, data.chatid);
            } else if (data.type === 'newMessage') {
                saveMessage(data.message);
            } else if (data.type === 'editMessage') {
                editMessage(data.message);
            } else if (data.type === 'deleteMessage') {
                deleteMessage(data.messageID);
            } else if (data.type === 'clearMessages') {
                clearMessages(data.chatid);
            } else if (data.type === 'loadChats') {
                console.log(data);
                loadChats(ws);
            } else if (data.type === 'joinChat') {
                JoinChat(ws);
            } else if (data.type === 'newChat') {
                saveChat(data.chatInfo);
            } else if (data.type === 'checkPassword') {
                checkPassword(ws, data.chatid, data.password, data.author);
            }else if (data.type === 'changeUsername') {
                usernameChange(ws, data.usernames);
            }else if (data.type === 'changeColor') {
                colorChange(data.newColor,data.username);
            }else if (data.type === 'setAvatar') {
                setAvatar(ws, data.username)
            }else if (data.type === 'changeChatName') {
                chatNameChange(ws, data.chatNames);
            }else if (data.type === 'chatDelete'){
                deleteChat(data.chatid)
            } else if (data.type === 'changePassword'){
                changeChatPassword(data.chatid, data.newPassword)
            }
        } catch (error) {
            console.error('Error handling message:', error);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', error => {
        console.error('WebSocket error:', error);
    });
});

// Load messages from the database
function loadMessages(ws, chatid) {
    const query = `
        SELECT messages.*, users.avatarpath 
        FROM messages 
        JOIN users ON messages.sender COLLATE utf8mb4_unicode_ci = users.login COLLATE utf8mb4_unicode_ci
        WHERE messages.chatid = ?;

    `;
    db.query(query, [chatid], (err, results) => {
        if (err) {
            console.error('Error fetching messages:', err.stack);
            ws.send(JSON.stringify({ type: 'error', message: 'Error fetching messages' }));
            return;
        }
        ws.send(JSON.stringify({
            type: 'loadMessages',
            messages: results
        }));
    });
}


// Save a new message to the database
function saveMessage(message) {
    const ownerQuery = "SELECT author FROM chats WHERE chatid = ?"; 
    db.query(ownerQuery, [message.chatid], (err, results) => {
        if (err) {
            console.error('Error fetching avatar path:', err.stack);
            return;
        }console.log(results)
        if (results[0].author == message.sender) {
            message.isFromOwner = 1;
        }
        else{
            message.isFromOwner = 0;
        }
    const avatarQuery = "SELECT avatarpath,color FROM users WHERE login = ?"; 
    db.query(avatarQuery, [message.sender], (err, results) => {
        if (err) {
            
            console.error('Error fetching avatar path:', err.stack);
            return;
        }
        
        if (results.length > 0) {
            message.avatarpath = results[0].avatarpath;
            message.color = results[0].color;
            console.log(message.imagePath)
            
            if (message.imagePath != null){
                // Now save the message with avatar path
            const query = 'INSERT INTO messages (sender, message, messageid, chatid,imagepath, timestamp, avatarPath,color,isFromOwner) VALUES (?, ?, ?,?, ?, ?,?,?,?)';
            db.query(query, [message.sender, message.message, message.messageID, message.chatid,message.imagePath, message.timestamp,message.avatarpath,message.color,message.isFromOwner], err => {
                if (err) {
                    console.error('Error saving message:', err.stack);
                    return;
                }
                console.log(db.format(query, [message.sender, message.message, message.messageID, message.chatid, message.timestamp, message.avatarpath, message.color, message.isFromOwner]));
                console.log('Message saved');
                broadcastMessage({ type: 'newMessage', message });
            });
            } else{
                const query = 'INSERT INTO messages (sender, message, messageid, chatid, timestamp, avatarPath,color,isFromOwner) VALUES (?, ?, ?, ?, ?,?,?,?)';
            db.query(query, [message.sender, message.message, message.messageID, message.chatid, message.timestamp,message.avatarpath,message.color,message.isFromOwner], err => {
                if (err) {
                    console.error('Error saving message:', err.stack);
                    return;
                }
                console.log(db.format(query, [message.sender, message.message, message.messageID, message.chatid, message.timestamp, message.avatarpath, message.color, message.isFromOwner]));
                console.log('Message saved');
                broadcastMessage({ type: 'newMessage', message });
            });
            }
            
        } else {
            console.log();
            console.error('No user found with the specified username' + results);
        }
    })});
}

// Edit an existing message in the database
function editMessage(message) {
    const query = 'UPDATE messages SET message = ? WHERE messageid = ?';
    db.query(query, [message.message, message.messageID], err => {
        if (err) {
            console.error('Error editing message:', err.stack);
            return;
        }
        console.log('Message edited');
        broadcastMessage({ type: 'editMessage', message });
    });
}

// Delete a message from the database
function deleteMessage(messageID) {
    const query = 'DELETE FROM messages WHERE messageid = ?';
    db.query(query, [messageID], err => {
        if (err) {
            console.error('Error deleting message:', err.stack);
            return;
        }
        console.log('Message deleted');
        broadcastMessage({ type: 'deleteMessage', messageID });
    });
}

// Clear all messages from the database
function clearMessages(chatid) {
    const query = 'DELETE FROM messages where chatid = ?';
    db.query(query, [chatid] , err => {
        if (err) {
            console.error('Error clearing messages:', err.stack);
            return;
        }
        console.log('All messages cleared');
        broadcastMessage({ type: 'clearMessages' });
    });
}

// Broadcast a message to all connected clients
function broadcastMessage(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}
function setAvatar(ws, username) {
    const avatarQuery = "SELECT avatarpath FROM users WHERE login = ?";
    db.query(avatarQuery, [username], (err, results) => {
        if (err) {
            console.error('Error fetching avatar path:', err.stack);
            return;
        }
        // Assuming results is an array and you want the first entry
        if (results.length > 0) {
            const avatarpath = results[0].avatarpath;
            ws.send(JSON.stringify({
                type: 'setAvatar',
                avatarpath: avatarpath
            }));
        } else {
            ws.send(JSON.stringify({
                type: 'setAvatar',
                avatarpath: null
            }));
        }
    });
}

function usernameChange(ws, usernames) {
    const checkQuery = 'SELECT login FROM users WHERE login = ?';
    
    // Step 1: Check if the new username already exists
    db.query(checkQuery, [usernames.newUsername], (err, results) => {
        if (err) {
            console.error('Error checking username:', err.stack);
            return;
        }

        // Step 2: If username already exists, return an error
        if (results.length > 0) {
            ws.send(JSON.stringify({
                type: 'finalizeNameChange',
                newUsername: usernames.newUsername,
                success: false
            }));
            return;
        }

        // Step 3: If username does not exist, proceed with the updates
        const updateUserQuery = 'UPDATE users SET login = ? WHERE login = ?';
        db.query(updateUserQuery, [usernames.newUsername, usernames.oldUsername], err => {
            if (err) {
                console.error('Error updating users table:', err.stack);
                return;
            }

            const updateMessagesQuery = 'UPDATE messages SET sender = ? WHERE sender = ?';
            db.query(updateMessagesQuery, [usernames.newUsername, usernames.oldUsername], err => {
                if (err) {
                    console.error('Error updating messages table:', err.stack);
                    return;
                }

                console.log('Username Changes');
                ws.send(JSON.stringify({
                    type: 'finalizeNameChange',
                    newUsername: usernames.newUsername,
                    success: true
                }));
            });
        });
    });
}

function colorChange(newColor, username) {
    const query = 'UPDATE users SET color = ? WHERE login = ?';
    db.query(query, [newColor, username], err => {
        if (err) {
            console.error('Error editing message:', err.stack);
            return;
        }})
    const query2 = 'UPDATE messages SET color = ? WHERE sender = ?';
    db.query(query2, [newColor, username], err => {
        if (err) {
            console.error('Error editing message:', err.stack);
            return;
        }
        console.log('Username Changes');
})}
// Load chats from the database
function loadChats(ws) {
    const query = 'SELECT chatid,name,author,iconpath,doesithavepassword FROM chats';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching chats:', err.stack);
            ws.send(JSON.stringify({ type: 'error', message: 'Error fetching chats' }));
            return;
        }
        ws.send(JSON.stringify({
            type: 'loadChats',
            chatInfo: results
        }));
    });
}

function JoinChat(ws) {
    const query = 'SELECT chatid,name,author,iconpath,doesithavepassword FROM chats';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching chats:', err.stack);
            ws.send(JSON.stringify({ type: 'error', message: 'Error fetching chats' }));
            return;
        }
        ws.send(JSON.stringify({
            type: 'joinChat',
            chatInfo: results
        }));
    });
}

// Save a new chat to the database
async function saveChat(chat) {
    try {
        
        let hashedPassword;
        console.log(chat.password)
        if (chat.password != '') {
            const plainPassword = chat.password;
            hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
            
        } else {
            hashedPassword = chat.password;
            
        }
        const query = 'INSERT INTO chats (chatid, name, password, author,doesithavepassword,iconpath) VALUES (?, ?, ?, ?,?,?)';
        db.query(query, [chat.chatid, chat.name, hashedPassword, chat.author,chat.doesithavepassword,chat.iconpath], err => {
            if (err) {
                console.error('Error saving chat:', err.stack);
                return;
            }
            console.log('Chat saved');
            broadcastChat({ type: 'newChat', chat: {
                name: chat.name,
                author: chat.author,
                chatid: chat.chatid,
                iconpath: chat.iconpath, 
                doesithavepassword: chat.doesithavepassword
            } });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
    }
}
async function changeChatPassword(chatid, newPassword) {
    try {
        let hashedPassword;
        let doesithavepassword;
        if (newPassword != '') {
            const plainPassword = newPassword;
            hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
            doesithavepassword = 1;
        } else {
            hashedPassword = newPassword;
            doesithavepassword = 0
        }
        const query = 'UPDATE chats SET password = ?, doesithavepassword = ? WHERE chatid = ?';
        db.query(query, [hashedPassword,doesithavepassword,chatid], err => {
            if (err) {
                console.error('Error saving chat:', err.stack);
                return;
            }
            console.log('Chat saved');
        });
    } catch (error) {
        console.error('Error hashing password:', error);
    }
}
async function checkPassword(ws, chatid, enteredPassword,author) {
    const query = 'SELECT password,author FROM chats WHERE chatid = ?';
    db.query(query, [chatid], async (err, results) => {
        if (err) {
            console.error('Error fetching chat password:', err.stack);
            ws.send(JSON.stringify({ type: 'error', message: 'Error fetching chat password' }));
            return;
        }

        if (results.length === 0) {
            console.log('No chat found with the provided chatid');
            ws.send(JSON.stringify({ type: 'error', message: 'Chat not found' }));
            return;
        }
        author = results[0].author;
        const hashedPassword = results[0].password;
        console.log(`Fetched hashedPassword: ${hashedPassword}`);

        const passwordMatch = await bcrypt.compare(enteredPassword, hashedPassword);
        console.log(`Password match result: ${passwordMatch}`);

        if (passwordMatch) {
            ws.send(JSON.stringify({ type: 'passwordCheck', success: true, chatid, author }));
        } else {
            ws.send(JSON.stringify({ type: 'passwordCheck', success: false }));
        }
    });
}
function chatNameChange(ws, chatNames) {
    const checkQuery = 'SELECT name FROM chats WHERE name = ?';
    // Step 1: Check if the new username already exists
    db.query(checkQuery, [chatNames.newChatName], (err, results) => {
        if (err) {
            console.error('Error checking username:', err.stack);
            return;
        }

        // Step 2: If username already exists, return an error
        if (results.length > 0) {
            ws.send(JSON.stringify({
                type: 'finalizeChatNameChange',
                newChatName: chatNames.newChatName,
                success: false
            }));
            return;
        }

        const updateUserQuery = 'UPDATE chats SET name = ? WHERE name = ?';
        db.query(updateUserQuery, [chatNames.newChatName, chatNames.oldChatName], err => {
            if (err) {
                console.error('Error updating users table:', err.stack);
                return;
            }
                console.log('Username Changes');
                ws.send(JSON.stringify({
                    type: 'finalizeChatNameChange',
                    newChatName: chatNames.newChatName,
                    success: true
                }));
        });
    });
}
function deleteChat(chatid){
    console.log("sigma" + chatid)
        const query = 'DELETE FROM messages where chatid = ?';
        db.query(query, [chatid] , err => {
            if (err) {
                console.error('Error clearing messages:', err.stack);
                return;
            }
            console.log('All messages cleared');
            
        
        const chatdeletequery = 'DELETE FROM chats where chatid = ?';
        db.query(chatdeletequery, [chatid] , err => {
            if (err) {
                console.error('Error clearing messages:', err.stack);
                return;
            }
            console.log('All messages cleared');
            broadcastMessage({ type: 'clearMessages'});
            broadcastMessage({ type: 'chatDeletion' });
        });
    });
}
// Broadcast a chat to all connected clients
function broadcastChat(chat) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(chat));
        }
    });
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
