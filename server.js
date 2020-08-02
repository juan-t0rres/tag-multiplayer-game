const express = require("express");
const morgan = require("morgan");
const app = express();
const path = require("path");

const http = require("http").Server(app);
const io = require("socket.io");
const socket = io(http);
require("dotenv").config();
const port = process.env.PORT;

const Player = require("./Player");

app.use(morgan("common"));

let players = [];

setInterval(updateGame, 16);

socket.on("connection", (socket) => {
  console.log("user connected");
  players.push(new Player(socket.id));
  console.log(players);
  socket.on("player update", player => {
    updatePlayer(player);
  });
  socket.on("disconnect", () => {
    players = players.filter((player) => player.id !== socket.id);
    disconnectPlayer(socket.id);
  });
});

function disconnectPlayer(id) {
  console.log("user disconnected");
  socket.sockets.emit("disconnect", id);
}

function updatePlayer(connectedPlayer) {
  if (!connectedPlayer)
    return;
  for (const player of players) {
    if (player.id === connectedPlayer.id) {
      player.x = connectedPlayer.x;
      player.y = connectedPlayer.y;
      return; 
    }
  }
}

function updateGame() {
  socket.sockets.emit("tick", players);
}

app.use(express.static('static'))

http.listen(port, () => {
  console.log("connected to port: " + port);
});