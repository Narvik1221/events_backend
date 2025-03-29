// middlewares/cloudinaryUpload.js
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Настройка Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Например: "mycloud"
  api_key: process.env.CLOUDINARY_API_KEY, // Например: "123456789012345"
  api_secret: process.env.CLOUDINARY_API_SECRET, // Например: "abcdefg123456"
});

// Используем multer с хранением файла в памяти
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Разрешаем только изображения
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Разрешены только изображения"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Ограничение 5MB
});

// Функция для загрузки файла в Cloudinary через поток
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "events" }, // Можно указать нужную папку в Cloudinary
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Middleware, который после работы multer (файл в памяти) загружает его в Cloudinary
const uploadFileToCloudinary = async (req, res, next) => {
  if (req.file) {
    try {
      const result = await streamUpload(req.file.buffer);
      // Сохраняем URL загруженного файла в req.file.path
      req.file.path = result.secure_url;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
};

module.exports = { upload, uploadFileToCloudinary };
