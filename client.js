const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let socket;
let jugador = {};
let jugadores = {};
let mapa = [];
let tileSize = 32;
let tileset = new Image();
tileset.src = "assets/tiles.png";
let avatarImgs = {};
let colisiones = [];
let zonas = []; // Zonas interactivas

function iniciarJuego() {
  const nombre = document.getElementById("nombre").value.trim();
  const mapaSeleccionado = document.getElementById("mapa").value;
  const avatar = document.getElementById("avatar").value;
  if (!nombre) return alert("Por favor ingresa tu nombre");

  jugador = {
    nombre,
    x: 64,
    y: 64,
    avatar,
    mapa: mapaSeleccionado
  };

  fetch(mapaSeleccionado)
    .then(r => r.json())
    .then(datos => {
      mapa = datos.mapa;
      colisiones = datos.colisiones;
      zonas = datos.zonas || []; // Carga zonas interactivas si existen
      document.getElementById("inicio").style.display = "none";
      canvas.style.display = "block";
      document.getElementById("chat").style.display = "block";
      conectarSocket();
      requestAnimationFrame(dibujar);
    });
}

function conectarSocket() {
  socket = new WebSocket("ws://migathertown.onrender.com");
  socket.onopen = () => socket.send(JSON.stringify({ tipo: "nuevo", datos: jugador }));
  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.tipo === "jugadores") jugadores = msg.datos;
    if (msg.tipo === "chat") agregarMensaje(msg.datos);
  };
  document.addEventListener("keydown", mover);
}

function mover(e) {
  let dx = 0, dy = 0;
  if (e.key === "ArrowUp") dy = -tileSize;
  if (e.key === "ArrowDown") dy = tileSize;
  if (e.key === "ArrowLeft") dx = -tileSize;
  if (e.key === "ArrowRight") dx = tileSize;

  let nx = jugador.x + dx;
  let ny = jugador.y + dy;
  if (!hayColision(nx, ny)) {
    jugador.x = nx;
    jugador.y = ny;
    socket.send(JSON.stringify({ tipo: "movimiento", datos: jugador }));
    verificarZonaInteractiva(nx, ny);
  }
}

function hayColision(x, y) {
  let colX = Math.floor(x / tileSize);
  let colY = Math.floor(y / tileSize);
  return colisiones[colY]?.[colX] === 1;
}

function verificarZonaInteractiva(x, y) {
  const px = Math.floor(x / tileSize);
  const py = Math.floor(y / tileSize);
  zonas.forEach(zona => {
    if (zona.x === px && zona.y === py) {
      window.open(zona.url, "_blank");
    }
  });
}

function dibujar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < mapa.length; y++) {
    for (let x = 0; x < mapa[y].length; x++) {
      let tile = mapa[y][x];
      ctx.drawImage(tileset, tile * tileSize, 0, tileSize, tileSize, x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }

  for (const id in jugadores) {
    const j = jugadores[id];
    if (!avatarImgs[id]) {
      const img = new Image();
      img.src = j.avatar;
      avatarImgs[id] = img;
    }
    ctx.drawImage(avatarImgs[id], j.x, j.y, tileSize, tileSize);
    ctx.fillStyle = "white";
    ctx.fillText(j.nombre, j.x, j.y - 5);
  }

  requestAnimationFrame(dibujar);
}

function enviarMensaje() {
  const texto = document.getElementById("mensaje").value;
  socket.send(JSON.stringify({ tipo: "chat", datos: jugador.nombre + ": " + texto }));
  document.getElementById("mensaje").value = "";
}

function agregarMensaje(texto) {
  const div = document.getElementById("mensajes");
  div.innerHTML += `<p>${texto}</p>`;
  div.scrollTop = div.scrollHeight;
}
