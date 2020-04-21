const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
// делаем обычный сервер, чтобы передать его в сокет
const server = http.createServer(app);
// передаем его в сокет
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

// устанавливаем новый обработчик событий на сокете, называем его connection
// мы можем передать параметр socket - это объект который содержит все сведения о новом подключении
io.on('connection', (socket) => {
    console.log('New websocket connetion');

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });

        if (error) {
            return callback(error);
        }

        // join - функция, которая вызывается только на сервере и дает возможность присоединиться к комнате
        socket.join(user.room);

        socket.emit('message', generateMessage('Admin','Welcome'));
        // учитывает все остальные подключения кроме этого
        // функция to позволяет слать сообщения только в комнату, куда мы подсоединились
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback();
    });

    socket.on('newMessage', (message, callback) => {
        const user = getUser(socket.id);

        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!');
        }

        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the room`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    });

    socket.on('shareGeolocation', (coordinates, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('renderLocation', generateMessage(user.username, `https://google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`));
        callback();
    });
});

app.get('', (req, res) => {
    res.render('index');
})

module.exports = server;

// устанавливаем новый кастомный ивент
// socket.emit('countUpdated', count)

// принимаем данные с клиента и шлем обновленные обратно
// socket.on('increment', () => {
//     count++
//     // socket.emit('countUpdated', count);
//     // мы используем io вместо socket, чтобы обновить данные у всех подключений
//     io.emit('countUpdated', count);
// });