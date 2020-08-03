const ENDPOINT = "/";
const socket = io.connect(ENDPOINT);

// json of our connected players
let players = {};
// player who is it
let tagged;
// setup
let input, button, header;
let init = false;
const WIDTH = 1600;
const HEIGHT = 900;

socket.on("tick", (data) => updatePlayers(data));
socket.on("disconnect", (id) => deletePlayer(id));

function setup() {
  frameRate(30);
  createCanvas(WIDTH, HEIGHT);
  let posX = WIDTH / 2 - 100;
  let posY = HEIGHT / 2 - 50;
  input = createInput();
  input.position(posX, posY);
  button = createButton("submit");
  button.position(posX + 200, posY);
  button.mousePressed(playerStart);
  header = createElement("h2", "Enter Your Name!");
  header.position(posX, posY - 50);
}

function playerStart() {
  if (!input.value()) return;
  const player = players[socket.id];
  player.name = input.value().toLowerCase();
  player.active = true;
  socket.emit("activate player");
  input.hide();
  button.hide();
  header.hide();
}

function draw() {
  background(220);
  updateConnectedPlayer();
  for (const id of Object.keys(players)) drawPlayer(players[id]);
}

function updateConnectedPlayer() {
  const player = players[socket.id];
  if (player && player.active) {
    const velocity = player.id === tagged ? 10 : 7;
    // movement
    if (keyIsDown(LEFT_ARROW)) player.x -= velocity;
    if (keyIsDown(RIGHT_ARROW)) player.x += velocity;
    if (keyIsDown(UP_ARROW)) player.y -= velocity;
    if (keyIsDown(DOWN_ARROW)) player.y += velocity;
    // bounds
    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x > WIDTH) player.x = WIDTH;
    if (player.y > HEIGHT) player.y = HEIGHT;
    socket.emit("player update", player);
    // if the player is tagged, check for collisions
    if (player.id === tagged) {
      for (const id of Object.keys(players)) {
        if (id === player.id) continue;
        const otherPlayer = players[id];
        const distance = dist(player.x, player.y, otherPlayer.x, otherPlayer.y);
        if (distance < 40) {
          socket.emit("new tag", otherPlayer.id);
        }
      }
    }
  }
}

function drawPlayer(player) {
  if (!player.active) return;
  const { rgb, x, y } = player;
  fill(rgb.r, rgb.g, rgb.b);
  circle(x, y, 20);
  if (player.id === tagged) fill(255, 50, 50);
  else fill(0, 0, 0);
  textAlign(CENTER);
  textSize(20);
  text(player.name, x, y - 30);
}

function updatePlayers(data) {
  const serverPlayers = data.players;
  tagged = data.tagged;
  for (const id of Object.keys(serverPlayers)) {
    if (init && id === socket.id) continue;
    players[id] = serverPlayers[id];
  }
  init = true;
}

function deletePlayer(id) {
  delete players[id];
}
