const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/db.json");

function updateUserStatus(userId, isOnline) {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading DB:", err);
      return;
    }

    const db = JSON.parse(data);
    const user = db.users.find((u) => u._id === userId);

    if (!user) {
      console.warn("User not found:", userId);
      return;
    }

    user.isOnline = isOnline;
    user.lastSeen = new Date().toISOString();

    console.log("user get updated ", db);

    fs.writeFile(filePath, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        console.error("Error writing to DB:", err);
      } else {
        console.log(
          `User ${userId} status updated to ${isOnline ? "online" : "offline"}`
        );
      }
    });
  });
}

function getUserById(userId) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const db = JSON.parse(data);
    const user = db.users.find((u) => u._id === userId);
    return user || null;
  } catch (err) {
    console.error("Error reading user by ID:", err);
    return null;
  }
}

// Helpers
const getUserByEmail = (email) => {
  const data = fs.readFileSync(filePath, "utf-8");
  const db = JSON.parse(data);
  return db.users.find((user) => user.email === email);
};

module.exports = {
  updateUserStatus,
  getUserById,
  getUserByEmail,
};
