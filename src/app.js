const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Добавлено для поддержки CORS
const db = require("./models");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const path = require("path");
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
const PORT = process.env.PORT || 3000;

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
// Синхронизация базы данных и запуск сервера
db.sequelize
  .sync({ alter: true })
  .then(async () => {
    await createAdminUser();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Ошибка подключения к базе данных:", err);
  });
