const express = require("express");
const router = express.Router();
const { getProfile } = require("../controllers/profileController");
const { authenticateToken } = require("../middlewares/auth"); // Проверка JWT

// Защищённый маршрут профиля
router.get("/", authenticateToken, getProfile);

module.exports = router;
