import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5176",
      "http://localhost:5175",
      "http://localhost:5174",
    ],
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: [
      "http://localhost:5176",
      "http://localhost:5175",
      "http://localhost:5174",
    ],
  }),
);
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Game state
let rooms = {};
let players = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room
  socket.on("join-room", (data) => {
    const { roomId, playerName } = data;
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        currentWord: "",
        drawer: null,
        timeLeft: 60,
        gameStarted: false,
      };
    }

    const player = {
      id: socket.id,
      name: playerName,
      score: 0,
      isDrawer: false,
    };

    rooms[roomId].players.push(player);
    players[socket.id] = { roomId, player };

    // Notify all players in room
    io.to(roomId).emit("room-update", rooms[roomId]);

    console.log(`${playerName} joined room ${roomId}`);
  });

  // Start game
  socket.on("start-game", (roomId) => {
    if (rooms[roomId] && rooms[roomId].players.length >= 2) {
      rooms[roomId].gameStarted = true;
      rooms[roomId].currentWord = getRandomWord();
      rooms[roomId].drawer = rooms[roomId].players[0].id;
      rooms[roomId].timeLeft = 60;

      // Update player roles
      rooms[roomId].players.forEach((player, index) => {
        player.isDrawer = index === 0;
      });

      io.to(roomId).emit("game-started", rooms[roomId]);
      startTimer(roomId);
    }
  });

  // Drawing data
  socket.on("drawing", (data) => {
    const { roomId, drawingData } = data;
    socket.to(roomId).emit("drawing-update", drawingData);
  });

  // Guess
  socket.on("guess", (data) => {
    const { roomId, guess } = data;
    const room = rooms[roomId];
    const player = players[socket.id];

    if (room && guess.toLowerCase() === room.currentWord.toLowerCase()) {
      // Correct guess
      const pointsForGuesser = 50;
      const pointsForDrawer = 25;

      player.player.score += pointsForGuesser;

      // Award points to the drawer as well
      const drawer = room.players.find((p) => p.isDrawer);
      if (drawer) {
        drawer.score += pointsForDrawer;
      }

      io.to(roomId).emit("correct-guess", {
        player: player.player.name,
        word: room.currentWord,
        scores: room.players.map((p) => ({ id: p.id, score: p.score })),
      });
      // End round and start next
      nextRound(roomId);
    } else {
      // Wrong guess
      io.to(roomId).emit("wrong-guess", {
        player: player.player.name,
        guess,
      });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    const playerData = players[socket.id];
    if (playerData) {
      const { roomId } = playerData;
      const room = rooms[roomId];
      if (room) {
        room.players = room.players.filter((p) => p.id !== socket.id);
        if (room.players.length === 0) {
          delete rooms[roomId];
        } else {
          io.to(roomId).emit("room-update", room);
        }
      }
      delete players[socket.id];
    }
    console.log("User disconnected:", socket.id);
  });
});

function startTimer(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  if (room.timer) {
    clearInterval(room.timer);
  }

  room.timer = setInterval(() => {
    room.timeLeft--;
    io.to(roomId).emit("timer-update", room.timeLeft);

    if (room.timeLeft <= 0) {
      clearInterval(room.timer);
      room.timer = null;
      // Next round logic
      nextRound(roomId);
    }
  }, 1000);
}

function nextRound(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  // Clear timer if it exists
  if (room.timer) {
    clearInterval(room.timer);
    room.timer = null;
  }

  // Rotate drawer
  const currentDrawerIndex = room.players.findIndex((p) => p.isDrawer);
  room.players.forEach((p) => (p.isDrawer = false));
  const nextDrawerIndex = (currentDrawerIndex + 1) % room.players.length;
  room.players[nextDrawerIndex].isDrawer = true;
  room.drawer = room.players[nextDrawerIndex].id;

  // New word
  room.currentWord = getRandomWord();
  room.timeLeft = 60;

  io.to(roomId).emit("next-round", room);
  startTimer(roomId);
}

function getRandomWord() {
  const words = [
    "DOG",
    "HOUSE",
    "CAR",
    "TREE",
    "PIZZA",
    "APPLE",
    "BANANA",
    "SUN",
    "MOON",
    "FLOWER",
    "BICYCLE",
    "AIRPLANE",
    "COMPUTER",
    "PHONE",
    "BOOK",
    "COFFEE",
    "CAKE",
    "MOUNTAIN",
    "OCEAN",
    "BIRD",
    "FISH",
    "ELEPHANT",
    "GIRAFFE",
    "LION",
    "TIGER",
    "PENGUIN",
    "ROCKET",
    "GUITAR",
    "PIANO",
    "CHAIR",
    "TABLE",
    "WINDOW",
    "DOOR",
    "SHOES",
    "HAT",
    "WATCH",
    "KEY",
    "SPOON",
    "FORK",
    "KNIFE",
  ];
  return words[Math.floor(Math.random() * words.length)];
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
