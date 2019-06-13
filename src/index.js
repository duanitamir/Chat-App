const express = require('express');
const http = require('http');
const PORT = process.env.PORT || 3000;
const path = require('path');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const Filter = require('bad-words');
const {getUser, getUserInRoom, addUser, removeUser} = require('./utils/users');

const {generateMessage, generateLocation} = require('../src/utils/messages');


const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

io.on('connection', (socket) => {

    socket.on('send', (msg, callback) => {

        // Filter not appropriate words ,block massage
        const filter = new Filter();

        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed')
        }
        const user = getUser(socket.id);
        io.to(user.room).emit('message', generateMessage(user.username, msg));
        callback()
    });

    socket.on('join', (options, callback) => {

        // ... Spread operator, open object to consts
        const {user, error} = addUser({id: socket.id, ...options});

        if (error) { return callback(error) }

        socket.join(user.room);
        socket.emit('message', generateMessage('Admin','Welcome'));
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username, `${user.username} has joined!`));

        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUserInRoom(user.room)
        });

        callback()
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left the room`))

            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUserInRoom(user.room)
            });
        }
    });

    socket.on('shareLocation', (coords, callback) => {

        const user = getUser(socket.id);
        if (user) {
            io.to(user.room).emit('locationMessage', generateLocation(user.username, coords));
            callback();
        }
    })
});

server.listen(PORT, () => {
    console.log(`Listen on port ${PORT}`);
});

