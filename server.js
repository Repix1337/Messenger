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

const app = express();
app.use(fileUpload());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
const cors = require('cors');
app.use(cors());
// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'messenger'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database');
});

// Create WebSocket server
const wss = new WebSocket.Server({ port: process.env.WS_PORT || 8080 });

wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', message => {
        try {
            const data = JSON.parse(message);
            console.log(data);

            if (data.type === 'loadMessages') {
                loadMessages(ws);
            } else if (data.type === 'newMessage') {
                saveMessage(data.message);
            } else if (data.type === 'editMessage') {
                editMessage(data.message);
            } else if (data.type === 'deleteMessage') {
                deleteMessage(data.messageID);
            } else if (data.type === 'clearMessages') {
                clearMessages();
            } else if (data.type === 'loadChats') {
                console.log(data);
                loadChats(ws);
            } else if (data.type === 'joinChat') {
                JoinChat(ws)
            } else if (data.type === 'newChat') {
                saveChat(data.chatInfo);
            } else if (data.type === 'checkPassword') {
                checkPassword(ws, data.chatid, data.password);
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
function loadMessages(ws) {
    const query = 'SELECT * FROM messages';
    db.query(query, (err, results) => {
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
    const query = 'INSERT INTO messages (sender, message, messageid, chatid) VALUES (?, ?, ?, ?)';
    db.query(query, [message.sender, message.message, message.messageID, message.chatid], err => {
        if (err) {
            console.error('Error saving message:', err.stack);
            return;
        }
        console.log('Message saved');
        broadcastMessage({ type: 'newMessage', message });
    });
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
function clearMessages() {
    const query = 'DELETE FROM messages';
    db.query(query, err => {
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

// Load chats from the database
function loadChats(ws) {
    const query = 'SELECT * FROM chats';
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
    const query = 'SELECT * FROM chats';
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
        if (chat.password != '') {
            const plainPassword = chat.password;
            hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        } else {
            hashedPassword = chat.password;
        }
        const query = 'INSERT INTO chats (chatid, name, password, author) VALUES (?, ?, ?, ?)';
        db.query(query, [chat.chatid, chat.name, hashedPassword, chat.author], err => {
            if (err) {
                console.error('Error saving chat:', err.stack);
                return;
            }
            console.log('Chat saved');
            broadcastChat({ type: 'newChat', chat });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
    }
}

async function checkPassword(ws, chatid, enteredPassword) {
    const query = 'SELECT password FROM chats WHERE chatid = ?';
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

        const hashedPassword = results[0].password;
        console.log(`Fetched hashedPassword: ${hashedPassword}`);

        const passwordMatch = await bcrypt.compare(enteredPassword, hashedPassword);
        console.log(`Password match result: ${passwordMatch}`);

        if (passwordMatch) {
            ws.send(JSON.stringify({ type: 'passwordCheck', success: true, chatid }));
        } else {
            ws.send(JSON.stringify({ type: 'passwordCheck', success: false }));
        }
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

// Express route for handling file uploads and saving messages
app.post('/sendMessage', (req, res) => {
    const sender = req.body.sender
    const text = req.body.message;
    const messageID = req.body.messageID;
    const chatid = req.body.chatid;
    const image = req.files ? req.files.image : null;

    let imagePath = null;

    if (image) {
        const imageId = uuidv4();
        imagePath = `uploads/${imageId}_${image.name}`;
        const savePath = path.join(__dirname, 'public', 'uploads', `${imageId}_${image.name}`);

        image.mv(savePath, err => {
            if (err) {
                console.error('Error saving image:', err);
                return res.status(500).json({ success: false, error: err });
            }
        });
    }
    const query = 'INSERT INTO messages (sender, message, messageid, chatid, imagePath) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [sender, text, messageID, chatid, imagePath], err => {
        if (err) {
            console.error('Error saving message:', err.stack);
            return res.status(500).json({ success: false, error: 'Error saving message' });
        }
        console.log('Message saved');
        res.status(200).json({ success: true, imagePath });
    });
});

// Start Express server
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
console.log(`WebSocket server is running on ws://localhost:${process.env.WS_PORT || 8080}`);
