const socket = io();

// Elements 
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
  // new message element
  const $newMessage = $messages.lastElementChild;

  // height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // visible height
  const visibleHeight = $messages.offsetHeight;

  // height of message container
  const containerHeight = $messages.scrollHeight;

  // how far have i scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if(containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
  

}

socket.on('message', (message) => {
  console.log(message);

  const html = Mustache.render(messageTemplate, {
    'username': message.username,
    'message': message.text,
    'createdAt': moment(message.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on('locationMessage', (message) => {
  console.log(message);

  const html = Mustache.render(locationTemplate, {
    'username': message.username,
    'location': message.locationUrl,
    'createdAt': moment(message.createdAt).format('h:mm a')
  });

  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room, 
    users
  });

  document.querySelector('#sidebar').innerHTML = html;

});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // disable the button after submit
  $messageFormButton.setAttribute('disable', 'disable');

  const message = e.target.elements.message.value;

  socket.emit('sendMessage', message, (error) => {

    // enable the button after message sent
    $messageFormButton.removeAttribute('disable');

    $messageFormInput.value = '';
    $messageFormInput.focus();
    
    if(error) {
      return console.log(error);
    }

    console.log('Message delivered!');

  });

});

$sendLocationButton.addEventListener('click', () => {
  if(!navigator.geolocation) {
    return alert('Geolocation is not supported by your browswer!');
  }

  // disable the send location button after submit
  $sendLocationButton.setAttribute('disable', 'disable');

  // share the current location with other users
  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position);
    socket.emit('sendLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, () => {

      console.log('Location shared!');

      // enable the send location button after message sent
      $sendLocationButton.removeAttribute('disable');

    });
  });


});

// emit username and room name to the server
socket.emit('join', { username, room }, (error) => {
  if(error) {
    alert(error);
    location.href = '/';
  }
});

// socket.on('countUpdated', (count) => { // listen from server event emits
//   console.log('The count has been updated!', count);
// });

// document.querySelector('#increment').addEventListener('click', () => {
//   console.log('Clicked');
//   socket.emit('increment'); // emit an event from client
// });