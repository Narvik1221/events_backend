const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { authenticateToken, isAdmin } = require("../middlewares/auth");
const { upload, handleFileUpload } = require("../middlewares/upload");

// Получение всех мероприятий
router.get("/", eventController.getEvents);

// Создание мероприятия (только для аутентифицированных пользователей)
router.post(
  "/",
  authenticateToken,
  upload.single("avatar"), // multer обрабатывает файл и сохраняет в памяти
  handleFileUpload, // Загружает файл в Vercel Blobs и записывает URL в req.file.path
  eventController.createEvent
);

// Запись на мероприятие
router.post("/:eventId/join", authenticateToken, eventController.joinEvent);

// Выход из мероприятия
router.delete("/:eventId/leave", authenticateToken, eventController.leaveEvent);

router.get("/user", authenticateToken, eventController.getUserEvents);
// Обновление мероприятия
router.put(
  "/:id",
  authenticateToken,
  upload.single("avatar"),
  eventController.updateEvent
);

// Получение мероприятий, созданных пользователем
router.get("/my", authenticateToken, eventController.getMyEvents);

router.delete("/:id", authenticateToken, isAdmin, eventController.deleteEvent);

module.exports = router;
