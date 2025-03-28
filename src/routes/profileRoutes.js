const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  deleteProfile,
  toggleUserBlock,
  getUsers,
} = require("../controllers/profileController");
const { authenticateToken, isAdmin } = require("../middlewares/auth"); // Проверка JWT
const { userAvatarUpload } = require("../middlewares/upload");
// Защищённый маршрут профиля
router.get("/", authenticateToken, getProfile);
router.put(
  "/",
  authenticateToken,
  userAvatarUpload.single("avatar"),
  updateProfile
);
router.delete("/", authenticateToken, deleteProfile); // Маршрут удаления профиля

// Новый маршрут для получения всех пользователей
router.get("/users", authenticateToken, isAdmin, getUsers);
router.post("/users/:id/block", authenticateToken, isAdmin, toggleUserBlock);
module.exports = router;
