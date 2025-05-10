const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, REFRESH_SECRET } = require("../middlewares/auth");

exports.register = async (req, res) => {
  const { firstName, lastName, password, telegram, whatsapp } = req.body;
  if (!firstName || !lastName || !password) {
    return res.status(400).json({ message: "Отсутствуют обязательные поля" });
  }

  // Если файл аватара загружен, используем его путь
  const avatar = req.file ? req.file.path : null;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.User.create({
      firstName,
      lastName,
      password: hashedPassword,
      telegram,
      whatsapp,
      avatar,
    });
    res.status(201).json({
      message: "Пользователь успешно зарегистрирован",
      userId: user.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка регистрации" });
  }
};

exports.login = async (req, res) => {
  const { firstName, lastName, password } = req.body;
  if (!firstName || !lastName || !password) {
    return res.status(400).json({ message: "Отсутствуют обязательные поля" });
  }
  try {
    const user = await db.User.findOne({ where: { firstName, lastName } });
    if (!user) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Неверные учетные данные" });
    }
    if (user.blocked) {
      return res.status(400).json({ message: "Ваш аккаунт заблокирован" });
    }
    // Выдаем accessToken на 15 минут и refreshToken на 7 дней
    const accessToken = jwt.sign(
      { id: user.id, admin: user.admin },
      SECRET_KEY,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      { id: user.id, admin: user.admin },
      REFRESH_SECRET,
      { expiresIn: "14d" }
    );
    res.json({ accessToken, refreshToken, admin: user.admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка авторизации" });
  }
};

exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({ message: "Отсутствует refresh token" });
  }
  jwt.verify(token, REFRESH_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Неверный refresh token" });
    }
    // Создаем новый access token
    const accessToken = jwt.sign(
      { id: user.id, admin: user.admin },
      SECRET_KEY,
      { expiresIn: "15m" }
    );
    res.json({ accessToken });
  });
};
