const ENDPOINT = "/";
const socket = io.connect(ENDPOINT);

let players = {};
let input, button, header;
let init = false;
const SPEED = 10;
const WIDTH = 1600;
const HEIGHT = 900;

socket.on("tick", (players) => updatePlayers(players));
socket.on("disconnect", (id) => deletePlayer(id));

function setup() {
  frameRate(30);
  createCanvas(WIDTH, HEIGHT);
  let posX = WIDTH/2 - 100;
  let posY = HEIGHT/2 - 50;
  input = createInput();
  input.position(posX, posY);
  button = createButton('submit');
  button.position(posX + 200, posY);
  button.mousePressed(playerStart);
  header = createElement('h2', 'Enter Your Name!');
  header.position(posX, posY - 50);
}

function playerStart() {
  const player = players[socket.id];
  player.name = input.value();
  player.active = true;
  input.hide();
  button.hide();
  header.hide();
}

function draw() {
  background(220);
  updateConnectedPlayer();
  for (const id of Object.keys(players))
    drawPlayer(players[id]);
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
  if (!player.active) return;
  const { rgb, x, y } = player;
  fill(rgb.r, rgb.g, rgb.b);
  circle(x, y, 20);
  fill(0,0,0);
  textAlign(CENTER);
  textSize(16);
  text(player.name, x, y-30);
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
