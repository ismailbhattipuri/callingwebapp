const express = require("express");
const router = express.Router();
const { getSampleData, getAllUsers, getUserById } = require("../controllers/sampleController");

router.get("/", getSampleData); // returns full db
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);

module.exports = router;
