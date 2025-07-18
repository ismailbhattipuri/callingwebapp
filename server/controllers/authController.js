const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const filePath = path.join(__dirname, "../data/db.json");


const registerUser = (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const newUser = {
    _id: uuidv4(),
    name: `${firstName} ${lastName}`,
    email,
    password,
    avatar: `https://i.pravatar.cc/100?img=2`,
    isOnline: false,
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  //https://i.pravatar.cc/100?u=${email}

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const db = JSON.parse(data);
    const emailExists = db.users.some((u) => u.email === email);
    if (emailExists) return res.status(409).json({ error: "Email already exists" });

    db.users.push(newUser);

    fs.writeFile(filePath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error writing to database" });

      res.status(201).json({ message: "User registered successfully", user: newUser });
    });
  });
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading user data" });

    const parsedData = JSON.parse(data);
    const users = parsedData.users;

    const userIndex = users.findIndex(u => u.email === email && u.password === password);

    if (userIndex === -1) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    users[userIndex].isOnline = true;
    users[userIndex].lastSeen = new Date().toISOString();

    // ✅ Update the original object
    parsedData.users = users;

    fs.writeFile(filePath, JSON.stringify(parsedData, null, 2), (writeErr) => {
      if (writeErr) return res.status(500).json({ error: "Error updating user status" });

      res.status(200).json({
        message: "Login successful",
        user: users[userIndex],
      });
    });
  });
};


module.exports = { registerUser, loginUser };
