// middlewares/auth.js
const jwt = require("jsonwebtoken");
const db = require("../models");
const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "your_refresh_secret";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Отсутствует токен" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        const refreshToken = req.headers["x-refresh-token"];
        if (!refreshToken) {
          return res.status(403).json({
            message:
              "Access token истёк, а refresh token отсутствует. Пожалуйста, авторизуйтесь снова.",
          });
        }

        jwt.verify(refreshToken, REFRESH_SECRET, (refreshErr, decoded) => {
          if (refreshErr) {
            return res.status(403).json({
              message:
                "Refresh token недействителен или истёк. Пожалуйста, авторизуйтесь снова.",
            });
          }

          const newAccessToken = jwt.sign(
            { id: decoded.id, email: decoded.email },
            SECRET_KEY,
            { expiresIn: "15m" }
          );

          res.setHeader("x-access-token", newAccessToken);
          req.user = decoded;
          next();
        });
      } else {
        return res.status(403).json({ message: "Неверный токен" });
      }
    } else {
      req.user = user;
      next();
    }
  });
};
const isAdmin = async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.user.id);

    if (!user || user.admin != true) {
      return res.status(403).json({ message: "Доступ запрещен" });
    }

    next();
  } catch (error) {
    console.error("Ошибка проверки администратора:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = { authenticateToken, isAdmin, SECRET_KEY, REFRESH_SECRET };
