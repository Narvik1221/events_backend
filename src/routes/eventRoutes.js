const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { authenticateToken } = require("../middlewares/auth");
const { eventAvatarUpload } = require("../middlewares/upload");

// Получение всех мероприятий
router.get("/", eventController.getEvents);

// Создание мероприятия (только для аутентифицированных пользователей)
router.post(
  "/",
  authenticateToken,
  eventAvatarUpload.single("avatar"), // Здесь multer обрабатывает файл
  eventController.createEvent
);
router.post("/:eventId/join", authenticateToken, eventController.joinEvent);
module.exports = router;
