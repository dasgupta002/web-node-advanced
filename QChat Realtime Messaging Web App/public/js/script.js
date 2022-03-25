const messages = document.querySelector('.chat-messages');
const chatForm = document.querySelector('#chat-form');

const room = document.querySelector('#room-name');
const users = document.querySelector('#users');

const socket = io();

const params = new URLSearchParams(location.search);
const userName = params.get('username');
const roomName = params.get('room-name');

socket.emit('joinRoom', { userName, roomName });

socket.on('roomData', ({ roomName, activeUsers }) => {
  room.innerText = roomName;

  let template = '';
  activeUsers.forEach((user) => template += `<li>${user.userName}</li>`);
  users.innerHTML = template;
});

socket.on('message', (message) => {
    messages.innerHTML += `
      <div class = "message">
        <p class = "meta">${message.userName} <span>${message.timeStamp}</span></p>
        <p class = "text">${message.messageBody}</p>    
      </div>
    `;

    messages.scrollTop = messages.scrollHeight;
});

chatForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const message = event.target.elements.message.value;
    socket.emit('new chat', message);
    
    event.target.elements.message.value = '';
});