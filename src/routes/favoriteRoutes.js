const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");
const { authenticateToken } = require("../middlewares/auth");

// Добавление мероприятия в избранное
router.post("/", authenticateToken, favoriteController.addFavorite);

module.exports = router;
