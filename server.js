const express = require("express");
const morgan = require("morgan");
const app = express();
const path = require("path");

const http = require("http").Server(app);
const io = require("socket.io");
const socket = io(http);
require("dotenv").config();
const port = process.env.PORT || 3000;

const Player = require("./Player");

app.use(morgan("common"));

let players = {};
let tagged;
let lastTag = 0;
let activePlayers = 0;
const WAIT = 1500;

setInterval(updateGame, 16);

socket.on("connection", (socket) => {
  console.log("user connected");
  players[socket.id] = new Player(socket.id);
  socket.on("activate player", () => {
    activePlayers++;
    if (activePlayers === 1) tagged = socket.id;
  });
  console.log(players);
  socket.on("player update", (player) => {
    updatePlayer(player);
  });
  socket.on("new tag", (id) => {
    const now = new Date().getTime();
    if (now - lastTag <= WAIT) return;
    lastTag = now;
    tagged = id;
    console.log(players[id].name + " was tagged!");
  });
  socket.on("disconnect", () => {
    disconnectPlayer(socket.id);
  });
});

function disconnectPlayer(id) {
  console.log("user disconnected");
  socket.sockets.emit("disconnect", id);
  if (players[id].active) activePlayers--;
  delete players[id];
  if (tagged === id) {
    const ids = Object.keys(players);
    if (ids.length === 0) return;
    tagged = ids[Math.floor(Math.random() * ids.length)];
  }
}

function updatePlayer(connectedPlayer) {
  if (!connectedPlayer || !players.hasOwnProperty(connectedPlayer.id)) return;
  players[connectedPlayer.id] = connectedPlayer;
}

function updateGame() {
  socket.sockets.emit("tick", { players, tagged });
}

app.use(express.static("static"));

http.listen(port, () => {
  console.log("connected to port: " + port);
});
