// app.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./models");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const path = require("path");

// Функция создания администратора, если он не существует
async function createAdminUser() {
  const adminExists = await db.User.findOne({ where: { admin: true } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("admin", 10);
    await db.User.create({
      firstName: "admin",
      lastName: "admin",
      password: hashedPassword,
      admin: true,
    });
    console.log("Администратор создан.");
  }
}

// Импорт роутов
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const adminRoutes = require("./routes/adminRoutes");
const profileRoutes = require("./routes/profileRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

// Разрешаем CORS для всех источников и методов
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Роутинг
app.use("/api", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/categories", categoryRoutes);

// Дополнительный маршрут для списка загруженных файлов
const fs = require("fs");
app.get("/list-uploads", (req, res) => {
  const uploadsDir = path.join(__dirname, "uploads", "events");
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Не удалось прочитать папку" });
    }
    res.json({ files });
  });
});

// Синхронизация базы данных и создание администратора
db.sequelize
  .sync({ alter: true })
  .then(async () => {
    await createAdminUser();
    console.log("База данных синхронизирована, администратор создан.");
  })
  .catch((err) => {
    console.error("Ошибка подключения к базе данных:", err);
  });

// Экспортируем Express-приложение без вызова app.listen()
module.exports = app;
