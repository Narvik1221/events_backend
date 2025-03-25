const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateToken } = require("../middlewares/auth");

// Административные эндпоинты: блокировка мероприятий и пользователей
router.put("/events/:id/block", authenticateToken, adminController.blockEvent);
router.put("/users/:id/block", authenticateToken, adminController.blockUser);

module.exports = router;
