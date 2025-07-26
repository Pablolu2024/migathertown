const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const tileSize = 32;
    const tilesX = 16;
    const tilesY = 12;

    let avatarIndex = 0;
    let mapIndex = 0;

    const avatarSelect = document.getElementById("avatarSelect");
    const mapSelect = document.getElementById("mapSelect");

    const player = {
      x: 1,
      y: 1,
    };

    let tilesetImg = new Image();
    tilesetImg.src = "tiles.png";

    let avatarsImg = new Image();
    avatarsImg.src = "avatars/mujer.png";

    // 2 mapas simulados con números (0: suelo, 1: pared)
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
            tile * tileSize, 0, tileSize, tileSize, // src
            x * tileSize, y * tileSize, tileSize, tileSize // dst
          );
        }
      }
    }

    function drawPlayer() {
      ctx.drawImage(
        avatarsImg,
        avatarIndex * tileSize, 0, tileSize, tileSize,
        player.x * tileSize, player.y * tileSize, tileSize, tileSize
      );
    }

    function gameLoop() {
      drawMap();
      drawPlayer();
    }

    document.addEventListener("keydown", (e) => {
      const map = maps[mapIndex];
      if (e.key === "ArrowUp" && player.y > 0 && map[player.y - 1][player.x] === 0) player.y--;
      if (e.key === "ArrowDown" && player.y < tilesY - 1 && map[player.y + 1][player.x] === 0) player.y++;
      if (e.key === "ArrowLeft" && player.x > 0 && map[player.y][player.x - 1] === 0) player.x--;
      if (e.key === "ArrowRight" && player.x < tilesX - 1 && map[player.y][player.x + 1] === 0) player.x++;
      gameLoop();
    });

    function startGame() {
      avatarIndex = parseInt(avatarSelect.value);
      mapIndex = parseInt(mapSelect.value);
      gameLoop();
    }
