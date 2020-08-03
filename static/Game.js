const ENDPOINT = "/";
const socket = io.connect(ENDPOINT);

let players = {};
let init = false;
const SPEED = 5;
const WIDTH = 1600;
const HEIGHT = 900;

socket.on("tick", (players) => updatePlayers(players));
socket.on("disconnect", (id) => deletePlayer(id));

function setup() {
  frameRate(60);
  createCanvas(WIDTH, HEIGHT);
}

function draw() {
  background(220);
  updateConnectedPlayer();
  for (const id of Object.keys(players))
    drawPlayer(players[id]);
}

function keyPressed() {
  console.log("test");
}

function updateConnectedPlayer() {
  const player = players[socket.id];
  if (player) {
    // movement
    if (keyIsDown(LEFT_ARROW)) player.x -= SPEED;
    if (keyIsDown(RIGHT_ARROW)) player.x += SPEED;
    if (keyIsDown(UP_ARROW)) player.y -= SPEED;
    if (keyIsDown(DOWN_ARROW)) player.y += SPEED;
    // bounds
    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x > WIDTH) player.x = WIDTH;
    if (player.y > HEIGHT) player.y = HEIGHT;
    socket.emit("player update", player);
  }
}

function drawPlayer(player) {
  const { rgb, x, y } = player;
  fill(rgb.r, rgb.g, rgb.b);
  circle(x, y, 20);
}

function updatePlayers(serverPlayers) {
  for (const id of Object.keys(serverPlayers)) {
    if (init && id === socket.id) continue;
    players[id] = serverPlayers[id];
  }
  init = true;
}

function deletePlayer(id) {
  delete players[id];
}
