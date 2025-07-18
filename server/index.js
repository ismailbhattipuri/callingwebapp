const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { Server } = require("socket.io");
const http = require("http");
const { updateUserStatus } = require("./controllers/callController");

const connectedUsers = {};

const app = express();
const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const sampleRoutes = require("./routes/sampleRoutes");
const authRoutes = require("./routes/authRoutes"); // ⬅️ Add this line

app.use("/api/sample", sampleRoutes);
app.use("/api/auth", authRoutes); // ⬅️ Register auth route

// Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

// ==============================

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // or your actual frontend URL
    methods: ["GET", "POST"]
  },
  pingTimeout: 20000, // disconnect after 20s of inactivity
  pingInterval: 10000  // ping every 10s
});

io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    console.log("register")
    socket.userId = userId;
    connectedUsers[userId] = socket.id;
    updateUserStatus(userId, true);
  });

  socket.on("call-user", ({ from, to }) => {
    const callee = getUserById(to);
    if (!callee || !callee.isOnline) {
      socket.emit("call-failed", "User not available");
      return;
    }
    if (from === to) {
      socket.emit("call-failed", "You cannot call yourself");
      return;
    }

    io.to(callee.socketId).emit("incoming-call", { from });
  });

  socket.on("accept-call", ({ from, to }) => {
    io.to(from.socketId).emit("call-accepted", { to });
  });

  socket.on("reject-call", ({ from }) => {
    io.to(from.socketId).emit("call-rejected");
  });

  socket.on("hang-up", ({ to }) => {
    io.to(to.socketId).emit("hang-up");
  });

  socket.on("disconnect", () => {
  console.log("🔌 Disconnect from:", socket.id);

  const userId = socket.userId; // ✅ Directly use stored userId
  if (userId) {
    console.log("🔌 User disconnected:", userId);
    delete connectedUsers[userId];
    updateUserStatus(userId, false); // Set offline and lastSeen
  } else {
    console.log("🔌 Unknown socket disconnected:", socket.id);
  }
});


});


// post http://localhost:8000/api/auth/register
// post http://localhost:8000/api/auth/login

// get  http://localhost:8000/api/sample/users
// get http://localhost:8000/api/sample/users/e0c73602-e3bb-44a9-a02b-8a6404fb7e46
