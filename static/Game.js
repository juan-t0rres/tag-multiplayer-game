const ENDPOINT = "/";
const socket = io.connect(ENDPOINT);

let players = new Map();
let init = false;
const SPEED = 5;

socket.on("tick", (players) => updatePlayers(players));
socket.on("disconnect", (id) => deletePlayer(id));

function setup() {
  createCanvas(500, 500);
}

function draw() {
  background(220);
  updateConnectedPlayer();
  players.forEach((player) => drawPlayer(player));
}

function updateConnectedPlayer() {
  const player = players.get(socket.id);
  if (keyIsDown(LEFT_ARROW)) {
    player.x -= SPEED;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    player.x += SPEED;
  }
  if (keyIsDown(UP_ARROW)) {
    player.y -= SPEED;
  }
  if (keyIsDown(DOWN_ARROW)) {
    player.y += SPEED;
  }
  socket.emit("player update", player);
}

function drawPlayer(player) {
  const { rgb, x, y } = player;
  fill(rgb.r, rgb.g, rgb.b);
  circle(x, y, 20);
}

function updatePlayers(serverPlayers) {
  for (const player of serverPlayers) {
    if (init && player.id === socket.id) continue;
    players.set(player.id, player);
  }
  init = true;
}

function deletePlayer(id) {
  players.delete(id);
}
