const db = require("../models");
const getProfile = async (req, res) => {
  try {
    // Используем findByPk и исключаем поле "password"
    const user = await db.User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.json(user);
  } catch (error) {
    console.error("Ошибка при получении профиля:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = { getProfile };
