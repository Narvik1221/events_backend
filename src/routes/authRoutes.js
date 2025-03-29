// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { upload } = require("../middlewares/upload");

// Регистрация и авторизация
router.post("/register", upload.single("avatar"), authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);
module.exports = router;
