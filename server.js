"use strict";
const httpServ = require('http').createServer();
const express = require('express');
const app = express();
const evsocket = require('evsocket');

app.get('/', (req, res) => {
	return res.sendFile(__dirname + '/client/index.html');
});
app.get('/evsocket-client.js', (req, res) => {
	return res.sendFile(__dirname + '/node_modules/evsocket-client/evsocket-client.js');
});
app.get('/app.js', (req, res) => {
	return res.sendFile(__dirname + '/client/app.js');
});

// Middleware test
evsocket.setMiddleware((socket, data, next) => {
	console.log('Middleware1 got:' , data);
	next();
});
evsocket.setMiddleware((socket, data, next) => {
	console.log('Middleware2 got: ', data);
	next();
});

const socketServ = evsocket.createServer({ server: httpServ });
socketServ.on('connection', (socket) => {
	console.log('Socket ' + socket.id + ' connected.');

	socket.on('close', (code, reason) => {
		console.log('Socket ' + socket.id + ' closed.');
		if(socket.channelName) {
			socket.broadcast('chat', {
				who: 'system',
				message: socket.id + ' left channel(socket closed).'
			});
		}
	});
	socket.on('channelleave', (channelName) => {
		socket.broadcast('chat', {
			who: 'system',
			message: socket.id + ' left channel.'
		});
	});
});

httpServ.on('request', app);
httpServ.listen(3000, () => {
	console.log('Server listens at port 3000.');
});