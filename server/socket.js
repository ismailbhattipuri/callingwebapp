let users = {};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register-user", (userId) => {
      users[userId] = socket.id;
      io.emit("online-users", users);
    });

    socket.on("call-user", ({ to, offer }) => {
      const targetSocket = users[to];
      if (targetSocket) {
        io.to(targetSocket).emit("incoming-call", { from: socket.id, offer });
      }
    });

    socket.on("answer-call", ({ to, answer }) => {
      io.to(to).emit("call-answered", { answer });
    });

    socket.on("disconnect", () => {
      const userId = Object.keys(users).find((key) => users[key] === socket.id);
      if (userId) delete users[userId];
      io.emit("online-users", users);
    });
  });
};
