const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const moment = require('moment');

const { join, currentUser, activeUsers, left } = require('./utils/user');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const systemBot = 'QChat Bot';
const timeFormat = moment().format('h:mm a');

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    socket.on('joinRoom', ({ userName, roomName }) => {
        const user = join(socket.id, userName, roomName);

        socket.join(user.roomName);

        socket.emit('message', { userName: systemBot, messageBody: 'Welcome onboard to the QChat app!', timeStamp: timeFormat });
    
        socket.broadcast.to(user.roomName).emit('message', { userName: systemBot, messageBody: user.userName + ' has slid into the discussion!', timeStamp: timeFormat });
    
        io.to(user.roomName).emit('roomData', { roomName: user.roomName, activeUsers: activeUsers(user.roomName) });
    });

    socket.on('new chat', (message) => {
        const user = currentUser(socket.id);
        
        io.to(user.roomName).emit('message', { userName: user.userName, messageBody: message, timeStamp: timeFormat })
    });
    
    socket.on('disconnect', () => {
        const user = left(socket.id);

        if(user) {
            io.to(user.roomName).emit('message', { userName: systemBot, messageBody: user.userName + ' has left the discussion!', timeStamp: timeFormat })

            io.to(user.roomName).emit('roomData', { roomName: user.roomName, activeUsers: activeUsers(user.roomName) });
        }    
    });
});

server.listen(500);