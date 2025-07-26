// === public/game.js ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 32;
const tilesX = 16;
const tilesY = 12;

// Jugador local
let myId = null;
let players = {};

// Avatares y mapa
const avatarIndex = parseInt(document.getElementById("avatarSelect").value);
const mapIndex = parseInt(document.getElementById("mapSelect").value);
const avatarsImg = new Image();
avatarsImg.src = "avatars/mujer.png"; // Sprite horizontal con 3 avatares

const tilesetImg = new Image();
tilesetImg.src = "tiles.png";

// Mapas (pared = 1, suelo = 0)
const maps = [
      [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,1,0,0,1,1,1,0,0,1,1,1,0],
        [0,1,0,0,1,0,0,1,0,0,0,0,1,0,1,0],
        [0,1,0,0,1,0,0,0,0,0,1,0,1,0,1,0],
        [0,1,1,1,1,0,0,1,1,1,1,0,1,1,1,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,1,0,1,1,0,1,1,1,0,1,1,0],
        [0,1,0,0,1,0,1,0,0,0,0,1,0,1,0,0],
        [0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,0],
        [0,1,1,1,1,0,1,1,1,0,0,1,0,1,1,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      ],
      [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0],
        [0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0],
        [0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      ]
    ];
 // Puedes copiar aquí el array `maps` que ya tienes

// WebSocket
const socket = new WebSocket("ws://localhost:8080");

socket.addEventListener("open", () => {
  socket.send(JSON.stringify({
    type: "config",
    avatar: avatarIndex,
    map: `map${mapIndex + 1}`,
    x: 1 * tileSize,
    y: 1 * tileSize
  }));
});

socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "init") {
    myId = data.id;
    players = data.players;
  } else if (data.type === "players") {
    players = data.players;
  }
});

function drawMap() {
  const map = maps[mapIndex];
  for (let y = 0; y < tilesY; y++) {
    for (let x = 0; x < tilesX; x++) {
      const tile = map[y][x];
      ctx.drawImage(
        tilesetImg,
        tile * tileSize, 0, tileSize, tileSize,
        x * tileSize, y * tileSize, tileSize, tileSize
      );
    }
  }
}

function drawPlayers() {
  for (let id in players) {
    const p = players[id];
    if (p.map !== `map${mapIndex + 1}`) continue; // Mostrar solo si están en el mismo mapa
    ctx.drawImage(
      avatarsImg,
      p.avatar * tileSize, 0, tileSize, tileSize,
      p.x, p.y, tileSize, tileSize
    );
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawPlayers();
  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  const me = players[myId];
  if (!me) return;

  const tileMap = maps[mapIndex];
  const tx = Math.floor(me.x / tileSize);
  const ty = Math.floor(me.y / tileSize);

  let nx = tx, ny = ty;

  if (e.key === "ArrowUp") ny--;
  if (e.key === "ArrowDown") ny++;
  if (e.key === "ArrowLeft") nx--;
  if (e.key === "ArrowRight") nx++;

  if (nx >= 0 && ny >= 0 && nx < tilesX && ny < tilesY && tileMap[ny][nx] === 0) {
    me.x = nx * tileSize;
    me.y = ny * tileSize;

    socket.send(JSON.stringify({
      type: "move",
      x: me.x,
      y: me.y
    }));
  }
});

function startGame() {
  // Esto ya lo hiciste desde index.html
  // Simplemente comienza el bucle
  gameLoop();
}
