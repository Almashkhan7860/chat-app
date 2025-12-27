// server.js - Ye main server ka code hai
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Photo upload size badhane ke liye (10MB limit)
const io = new Server(server, {
  maxHttpBufferSize: 1e7,
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  // 1. Jab koi user apna naam batata hai
  socket.on("join", (name) => {
    socket.username = name;
    io.emit("chat message", {
      user: "System",
      text: `${name} online aa gaya!`,
      type: "text",
    });
  });

  // 2. Text message bhejna
  socket.on("chat message", (msg) => {
    io.emit("chat message", { user: socket.username, text: msg, type: "text" });
  });

  // 3. Photo bhejna
  socket.on("image message", (imageData) => {
    io.emit("chat message", {
      user: socket.username,
      image: imageData,
      type: "image",
    });
  });

  // 4. Typing dikhana
  socket.on("typing", () => {
    socket.broadcast.emit("typing", socket.username);
  });

  // 5. User disconnect hona
  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("chat message", {
        user: "System",
        text: `${socket.username} offline ho gaya.`,
        type: "text",
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
