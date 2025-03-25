const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key"; // Для production храните в переменных окружения
const REFRESH_SECRET = "your_refresh_secret"; // Для refresh token тоже

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // Ожидается формат: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Отсутствует токен" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Неверный токен" });
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken, SECRET_KEY, REFRESH_SECRET };
