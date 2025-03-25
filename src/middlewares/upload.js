const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Функция для проверки наличия директории и её создания при необходимости
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Создаём папки для хранения файлов
const UPLOADS_DIR = path.join(__dirname, "../../uploads");
ensureDirExists(path.join(UPLOADS_DIR, "users"));
ensureDirExists(path.join(UPLOADS_DIR, "events"));

// Фильтр для изображений
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Разрешены только изображения"), false);
  }
};

// Ограничения по размеру файла (5MB)
const limits = { fileSize: 5 * 1024 * 1024 };

// Функция генерации имени файла
const generateFileName = (file) =>
  `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;

// Настройки хранения аватаров пользователей
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(UPLOADS_DIR, "users")),
  filename: (req, file, cb) => cb(null, generateFileName(file)),
});

// Настройки хранения изображений мероприятий
const eventStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(UPLOADS_DIR, "events")),
  filename: (req, file, cb) => cb(null, generateFileName(file)),
});

const userAvatarUpload = multer({ storage: userStorage, fileFilter, limits });
const eventAvatarUpload = multer({ storage: eventStorage, fileFilter, limits });

// Middleware для обработки ошибок Multer
const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Ошибка загрузки: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = { userAvatarUpload, eventAvatarUpload, uploadErrorHandler };
