// middlewares/upload.js
const multer = require("multer");
const { put } = require("@vercel/blob");
const path = require("path");

// Используем память для хранения файлов
const storage = multer.memoryStorage();

// Фильтр для изображений
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Разрешены только изображения"), false);
  }
};

// Ограничение по размеру файла – 5MB
const limits = { fileSize: 5 * 1024 * 1024 };

const upload = multer({ storage, fileFilter, limits });

// Функция генерации уникального имени файла
const generateFileName = (file) =>
  `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;

// Функция загрузки файла в Vercel Blobs
// Согласно инструкции: import { put } from '@vercel/blob';
async function uploadFileToBlob(fileBuffer, originalName) {
  const fileName = generateFileName({ originalname: originalName });
  // Загрузка файла по пути 'uploads/events/<fileName>' с публичным доступом
  const { url } = await put(`uploads/events/${fileName}`, fileBuffer, {
    access: "public",
  });
  return url;
}

// Middleware: после загрузки файла multer, загружаем его в Blob и сохраняем URL в req.file.path
const handleFileUpload = async (req, res, next) => {
  if (req.file) {
    try {
      const url = await uploadFileToBlob(
        req.file.buffer,
        req.file.originalname
      );
      req.file.path = url;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
};

module.exports = { upload, handleFileUpload };
