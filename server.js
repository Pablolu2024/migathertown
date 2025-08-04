const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const serverHttp = http.createServer(app);
const wss = new WebSocket.Server({ server: serverHttp });

const jugadoresPorMapa = {};

app.use(express.static(__dirname));

wss.on("connection", socket => {
  const id = Math.random().toString(36).slice(2);
  let mapaJugador = null;

  socket.on("message", mensaje => {
    const msg = JSON.parse(mensaje);

    if (msg.tipo === "nuevo") {
      mapaJugador = msg.datos.mapa || "mapa1.json";
      if (!jugadoresPorMapa[mapaJugador]) jugadoresPorMapa[mapaJugador] = {};
      jugadoresPorMapa[mapaJugador][id] = msg.datos;
    }

    if (msg.tipo === "movimiento" && msg.datos?.mapa) {
      // Cambio de mapa
      if (mapaJugador && jugadoresPorMapa[mapaJugador]) {
        delete jugadoresPorMapa[mapaJugador][id];
      }

      mapaJugador = msg.datos.mapa;
      if (!jugadoresPorMapa[mapaJugador]) jugadoresPorMapa[mapaJugador] = {};
      jugadoresPorMapa[mapaJugador][id] = msg.datos;
    }

    if (msg.tipo === "chat" && mapaJugador) {
      broadcast(mapaJugador, { tipo: "chat", datos: msg.datos });
    }

    if (mapaJugador) {
      broadcast(mapaJugador, {
        tipo: "jugadores",
        datos: jugadoresPorMapa[mapaJugador],
      });
    }
  });

  socket.on("close", () => {
    if (mapaJugador && jugadoresPorMapa[mapaJugador]) {
      delete jugadoresPorMapa[mapaJugador][id];
      broadcast(mapaJugador, {
        tipo: "jugadores",
        datos: jugadoresPorMapa[mapaJugador],
      });
    }
  });
});

function broadcast(mapa, msg) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  });
}

const PORT = process.env.PORT || 3000;
serverHttp.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
