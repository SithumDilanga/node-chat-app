const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

// socket.emit -  used for emit to a particular connection
// socket.broadcast - used for emit to everybody except that particular connection
// io.emit - used for emit to everyone
// io.to.emit - emits a event to everybody in a specific room
// socket.broadcast.to(roomname).emit - send event to anyone except that specific client but its limiting to a spcific chat room

// let count = 0;

io.on('connection', (socket) => {
  console.log('New WebSocket connection!');

  // listner for joing chat room
  socket.on('join', ({ username, room }, callback) => {

    const { error, user } = addUser({ id: socket.id, username, room });

    if(error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit('message', generateMessage('System', 'Welcome!'));
    socket.broadcast.to(user.room).emit('message', generateMessage('System', `${user.username} has joined!`));

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();

  });

  // listner for send message
  socket.on('sendMessage', (message, callback) => {

    const user = getUser(socket.id);

    const filter = new Filter();

    if(filter.isProfane(message)) {
      return callback('Profinity is not allowed!');
    }

    io.to(user.room).emit('message', generateMessage(user.username, message));
    callback();
  });

  // this runs when a user disconnect(when user closes the browswer window)/// listner for disconnect user
  socket.on('disconnect', () => {

    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message', generateMessage('System', `${user.username} has left!`));

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });  

    }
    
  });

  // listen to share location from client/// listner for send location
  socket.on('sendLocation', (coords, callback) => {

    const user = getUser(socket.id);

    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://www.google.com/maps/@${coords.latitude},${coords.longitude}`));

    callback();
    
  });

  // socket.emit('countUpdated', count); // emit an event from server to client

  // socket.on('increment', () => { // listen from client event emits
  //   count++;
  //   // socket.emit('countUpdated', count); // emits an event to that specific connection
  //   io.emit('countUpdated', count); // emits an event to every single connection
  // });

});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
  
});