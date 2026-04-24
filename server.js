const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");



const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// In-memory room state
const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);

    // Send current state to new user
    if (rooms[roomId]) {
      socket.emit("sync_state", rooms[roomId]);
    }
  });

  socket.on("video_event", ({ roomId, action, time }) => {
    // Save state
    rooms[roomId] = {
      action,
      time,
      updatedAt: Date.now(),
    };

    // Broadcast to everyone else
    socket.to(roomId).emit("video_event", {
      action,
      time,
      updatedAt: rooms[roomId].updatedAt,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});



const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
