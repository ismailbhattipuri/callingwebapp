// post http://localhost:8000/api/auth/register
// post http://localhost:8000/api/auth/login

// get  http://localhost:8000/api/user/users
// get http://localhost:8000/api/user/users/e0c73602-e3bb-44a9-a02b-8a6404fb7e46

const express = require("express");
const cors = require("cors");
const http = require("http");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { getUserByEmail } = require("./controllers/callController");

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Create HTTP Server
const server = http.createServer(app);

// Attach Socket.IO
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Maps
const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();
const idToSocketIdMap = new Map();
const socketIdToUserMap = new Map();

function getUserByEmailOrId(to) {
  let socketId;

  if (emailToSocketIdMap.has(to)) {
    socketId = emailToSocketIdMap.get(to);
  } else if (idToSocketIdMap.has(to)) {
    socketId = idToSocketIdMap.get(to);
  }

  if (socketId) {
    const user = socketIdToUserMap.get(socketId);
    return { ...user, socketId };
  }

  return null;
}

// Socket.IO Logic
io.on("connection", (socket) => {
  console.log(`🔌 Socket Connected: ${socket.id}`);

  // Join Room
  socket.on("room:join", ({ email, room }) => {
    const user = getUserByEmail(email);
    if (!user) return;

    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);

    socket.join(room);

    // Notify others in the room
    io.to(room).emit("user:joined", {
      email,
      id: socket.id,
      user,
    });

    // Notify the user who joined
    io.to(socket.id).emit("room:join", {
      email,
      room,
      user,
    });
  });

  // Call User to the joined the room
  socket.on("user:call", ({ to, offer }) => {
    const callerEmail = socketIdToEmailMap.get(socket.id);
    const callerUser = getUserByEmail(callerEmail);
    if (!callerUser) return;

    io.to(to).emit("incomming:call", {
      from: socket.id,
      offer,
      caller: callerUser,
    });
  });

  // Accept Call
  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", {
      from: socket.id,
      ans,
    });
  });

  // WebRTC Negotiation
  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", {
      from: socket.id,
      offer,
    });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", {
      from: socket.id,
      ans,
    });
  });

  //phone call
  socket.on("register", (user) => {
    const { email, _id } = user;
    if (email) emailToSocketIdMap.set(email, socket.id);
    if (_id) idToSocketIdMap.set(_id, socket.id);

    socketIdToUserMap.set(socket.id, { email, _id });

    console.log(`✅ Registered ${_id || email} → ${socket.id}`);
  });

  socket.on("call:request", ({ to,offer }) => {
    const callee = getUserByEmailOrId(to); // returns { email, _id }

    const calleeSocketId =
      (callee?.email && emailToSocketIdMap.get(callee.email)) ||
      (callee?._id && idToSocketIdMap.get(callee._id));

    console.log("calling not", calleeSocketId);

    if (calleeSocketId) {
      const caller = socketIdToUserMap.get(socket.id);
      console.log(callee);

      io.to(calleeSocketId).emit("call:incoming", {
        fromEmail: caller?.email,
        fromId: caller?._id,
        fromSocketId: socket.id,
        offer,
      });

      console.log("📞 Call request sent from", caller?.email, "to", to);
    }
  });

  socket.on("call:accept", ({ to,answer }) => {
    io.to(to).emit("call:accepted", { from: socket.id,answer });
  });

  socket.on("call:reject", ({ to }) => {
    io.to(to).emit("call:rejected", {});
  });

  socket.on("call:hangup", () => {
    // notify both sides (if stored in call state)
    socket.broadcast.emit("call:hangup");
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${socket.id}`);
    const email = socketIdToEmailMap.get(socket.id);
    emailToSocketIdMap.delete(email);
    socketIdToEmailMap.delete(socket.id);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
