const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = {};

app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', (ws) => {
  const id = Date.now();
  players[id] = { x: 100, y: 100, avatar: 'rojo', map: 'map1' };

  ws.send(JSON.stringify({ type: 'init', id, players }));

  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    if (data.type === 'move') {
      players[id] = { ...players[id], ...data };
    }
    if (data.type === 'config') {
      players[id] = { ...players[id], ...data };
    }
    const payload = JSON.stringify({ type: 'players', players });
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(payload);
    });
  });

  ws.on('close', () => {
    delete players[id];
    const payload = JSON.stringify({ type: 'players', players });
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(payload);
    });
  });
});

server.listen(8080, () => {
  console.log('Servidor corriendo en http://localhost:8080');
});
