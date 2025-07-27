const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const serverHttp = http.createServer(app);
const wss = new WebSocket.Server({ server: serverHttp });
const jugadores = {};

// Servir archivos estáticos
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'maps')));
// WebSocket
wss.on("connection", socket => {
  const id = Math.random().toString(36).slice(2);

  socket.on("message", mensaje => {
    const msg = JSON.parse(mensaje);
    if (msg.tipo === "nuevo") jugadores[id] = msg.datos;
    if (msg.tipo === "movimiento") jugadores[id] = msg.datos;
    if (msg.tipo === "chat") broadcast({ tipo: "chat", datos: msg.datos });

    broadcast({ tipo: "jugadores", datos: jugadores });
  });

  socket.on("close", () => {
    delete jugadores[id];
    broadcast({ tipo: "jugadores", datos: jugadores });
  });
});

function broadcast(msg) {
  wss.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) {
      c.send(JSON.stringify(msg));
    }
  });
}

// CAMBIO CLAVE para Render
const PORT = process.env.PORT || 3000;
serverHttp.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
