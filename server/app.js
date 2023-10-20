'use strict';

const express = require('express');

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

// socket on connect
io.sockets.on('connection', function (socket) {
  // initialize userdata
  socket.userData = { x: 0, y: 0, z: 0, heading: 0 };

  console.log(`${socket.id} connected`);
  socket.emit('setId', { id: socket.id });

  // delete player when user disconnects
  socket.on('disconnect', function () {
    socket.broadcast.emit('deletePlayer', { id: socket.id });
  });

  // initialize userdata
  socket.on('init', function (data) {
    console.log(`socket.init ${data.model}`);
    socket.userData.model = data.model;
    socket.userData.colour = data.colour;
    socket.userData.x = data.x;
    socket.userData.y = data.y;
    socket.userData.z = data.z;
    socket.userData.heading = data.h;
    socket.userData.pb = data.pb,
      socket.userData.action = "idle";
  });

  // player variable updates
  socket.on('update', function (data) {
    socket.userData.x = data.x;
    socket.userData.y = data.y;
    socket.userData.z = data.z;
    socket.userData.heading = data.h;
    socket.userData.pb = data.pb,
      socket.userData.action = data.action;
  });

  // socket.on('chat message', function (data) {
  //   console.log(`chat message:${data.id} ${data.message}`);
  //   io.to(data.id).emit('chat message', { id: socket.id, message: data.message });
  // })
});

// listen port
http.listen(8080, function () {
  console.log('listening on *:8080');
});

// broadcast updates - 25 ticks per second
setInterval(function () {
  const nsp = io.of('/');
  let packet = [];

  for (let id in io.sockets.sockets) {
    const socket = nsp.connected[id];

    // Only push sockets that have been initialised
    if (socket.userData.model !== undefined) {
      packet.push({
        id: socket.id,
        model: socket.userData.model,
        colour: socket.userData.colour,
        x: socket.userData.x,
        y: socket.userData.y,
        z: socket.userData.z,
        heading: socket.userData.heading,
        pb: socket.userData.pb,
        action: socket.userData.action
      });
    }
  }
  if (packet.length > 0) io.emit('remoteData', packet);
}, 40);
