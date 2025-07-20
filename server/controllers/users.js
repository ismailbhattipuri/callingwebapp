const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/db.json");

const getSampleData = (req, res) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      return res.status(500).json({ error: "Failed to read data" });
    }

    const parsedData = JSON.parse(data);
    res.json(parsedData);
  });
};

const getAllUsers = (req, res) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading users:", err);
      return res.status(500).json({ error: "Failed to read users" });
    }

    const parsedData = JSON.parse(data);
    res.json(parsedData.users);
  });
};

const getUserById = (req, res) => {

  const userId = req.params.id;

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading user data" });

    const users = JSON.parse(data);
    const user = users.users.find((u) => u._id === userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  });
};



module.exports = { getSampleData, getAllUsers, getUserById };
