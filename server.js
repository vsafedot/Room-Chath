const path = require('path');
const express = require('express');
const http = require('http');
const Qs = require('qs');
const socketIo = require('socket.io');
const formatMessage = require('C:/Users/SIDDHARTH/coindex/public/utils/messages.js');
const {userjoin,getcurrentuser,userleave,getroomusers } = require('C:/Users/SIDDHARTH/coindex/public/utils/users.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

const botname = 'ChatCord Bot';

io.on('connection', (socket) => {
    console.log('New WebSocket connection');
    socket.on('joinRoom', ({ username, room }) => {
        const user = userjoin(socket.id, username, room);
        socket.join(user.room);
        socket.emit('message', formatMessage(botname, 'Welcome!'));
        socket.broadcast.to(user.room).emit('message', formatMessage(botname, `${user.username} has joined!`));

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getroomusers(user.room)
        });
    });
    socket.on('chatMessage', (msg) => {
        const user = getcurrentuser(socket.id);
        io.to(user.room).emit('message', formatMessage(`${user.username}`, msg));
    });

    // Runs when user disconnects
    socket.on('disconnect', () => {
        const user = userleave(socket.id);
        if(user) {
            io.to(user.room).emit('message', formatMessage(botname, `${user.username} has left!`));
        }

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getroomusers(user.room)
        });
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
