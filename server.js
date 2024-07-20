const WebSocket = require('ws');
const mysql = require('mysql');

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // replace with your database username
    password: '', // replace with your database password
    database: 'messenger'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database');
});

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
    console.log('Client connected');

    // Load messages from the database and send to the client
    ws.on('message', message => {
        const data = JSON.parse(message);

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
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});


// Load messages from the database
function loadMessages(ws) {
    const query = 'SELECT * FROM messages';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching messages:', err.stack);
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
    const query = 'INSERT INTO messages (sender, message, messageid) VALUES (?, ?, ?)';
    db.query(query, [message.sender, message.message, message.messageID], err => {
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

// Broadcast a message to all connected clients except the sender
function broadcastMessage(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}


console.log('WebSocket server is running on ws://localhost:8080');
