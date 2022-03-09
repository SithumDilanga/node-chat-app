const users = [];

const addUser = ({ id, username, room }) => {

  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validate the data
  if(!username || !room) {
    return {
      error: 'username and room are required!'
    }
  }

  // check for existing user 
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // validate existing user
  if(existingUser) {
    return {
      error: 'username is already in use!'
    }
  }

  // store user
  const user = { id, username, room };
  users.push(user);

  return { user };

}

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if(index !== -1) {
    return users.splice(index, 1)[0];
  }

}

const getUser = (id) => {
  const user = users.find((user) => user.id === id);

  return user;

}

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  const roomUsers = users.filter((user) => user.room === room);

  return roomUsers;

}

// addUser({
//   id: 54,
//   username: 'Niko',
//   room: 'Liberty city'
// });

// addUser({
//   id: 55,
//   username: 'Roman',
//   room: 'Liberty city'
// });

// addUser({
//   id: 56,
//   username: 'Franklin',
//   room: 'Losantos'
// });

// console.log(users);

// const getuser = getUser(55);

// console.log(getuser);

// const usersInRoom = getUsersInRoom('Losantos');

// console.log(usersInRoom);

module.exports = {

  addUser,
  removeUser,
  getUser,
  getUsersInRoom

}