const http = require('http');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const players = {};

wss.on('connection', (ws) => {
  const id = Date.now();
  players[id] = { x: 100, y: 100, avatar: 'rojo', map: 'map1' };

  ws.send(JSON.stringify({ type: 'init', id, players }));

  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    if (data.type === 'move') {
      players[id] = { ...players[id], x: data.x, y: data.y };
    }
    if (data.type === 'config') {
      players[id] = { ...players[id], avatar: data.avatar, map: data.map };
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

console.log('Servidor corriendo en http://localhost:8080');
