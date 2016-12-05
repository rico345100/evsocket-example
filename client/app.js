"use strict";
const socket = new EvSocket('ws://localhost:3000');
var username = '';
var channelName = 'default';
var chatEl = document.getElementById('chat');
var messageEl = document.getElementById('message');

function createMessage(who, message) {
	var div = document.createElement('div');
	div.textContent = who + ': ' + message;
	chatEl.appendChild(div);
}

document.getElementById('change-channel').onclick = function() {
	var oldChannel = channelName;
	channelName = prompt('Channel Name:', channelName) || 'default';

	if(oldChannel !== channelName) {
		socket.join(channelName);
	}
};
document.getElementById('change-name').onclick = function() {
	var oldName = username;
	username = prompt('Username: ', username) || username;

	if(oldName !== username) {
		socket.broadcast('chat', { who: 'system', message: oldName + ' renamed to ' + username});
	}
};
document.getElementById('disconnect').onclick = function() {
	socket.close();
	createMessage('system', 'Socket closed.');
	messageEl.setAttribute('disabled', true);
};
document.getElementById('form').onsubmit = function(ev) {
	ev.preventDefault();
	socket.broadcast('chat', {
		who: username,
		message: messageEl.value
	});

	messageEl.value = '';
	messageEl.focus();
};

socket.on('open', () => {
	username = socket.id;

	socket.on('channeljoin', (channelName) => {
		socket.broadcast('chat', {
			who: 'system',
			message: username + ' joined to channel ' + channelName + '.'
		});
	});
	socket.on('chat', (data) => {
		createMessage(data.who, data.message);
		chatEl.scrollTop = chatEl.scrollHeight;
		messageEl.focus();
	});
	socket.on('error', (err) => {
		createMessage('system', 'Error: ' + err.message);
	});

	socket.join('default');		// Join to default channel

	messageEl.removeAttribute('disabled');
});