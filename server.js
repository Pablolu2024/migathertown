const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const path = require('path');

const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;
  if (filePath === './') filePath = './index.html';

  const ext = path.extname(filePath);
  const types = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.png': 'image/png',
  };

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Archivo no encontrado');
    } else {
      res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
      res.end(content, 'utf-8');
    }
  });
});

const wss = new WebSocket.Server({ server });
const players = {};

wss.on('connection', (ws) => {
  const id = Date.now();
  players[id] = { x: 100, y: 100, avatar: 'rojo', map: 'map1' };

  ws.send(JSON.stringify({ type: 'init', id, players }));

  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    if (data.type === 'move' || data.type === 'config') {
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

server.listen(8080, () => console.log('Servidor en http://localhost:8080'));
