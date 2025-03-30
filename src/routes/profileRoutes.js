const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  deleteProfile,
  toggleUserBlock,
  getUsers,
  getEventParticipants,
} = require("../controllers/profileController");
const { authenticateToken, isAdmin } = require("../middlewares/auth"); // Проверка JWT
const { upload, uploadFileToCloudinary } = require("../middlewares/upload");
// Защищённый маршрут профиля
router.get("/", authenticateToken, getProfile);
router.put(
  "/",
  authenticateToken,
  upload.single("avatar"),
  uploadFileToCloudinary,
  updateProfile
);
router.delete("/", authenticateToken, deleteProfile); // Маршрут удаления профиля
router.get("/:eventId/participants", authenticateToken, getEventParticipants);
router.get("/users", authenticateToken, isAdmin, getUsers);
router.post("/users/:id/block", authenticateToken, isAdmin, toggleUserBlock);
module.exports = router;
