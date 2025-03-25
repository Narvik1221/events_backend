const db = require("../models");

exports.blockEvent = async (req, res) => {
  if (!req.user.admin) {
    return res.status(403).json({ message: "Доступ запрещён" });
  }
  try {
    const event = await db.Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Мероприятие не найдено" });
    }
    event.blocked = true;
    await event.save();
    res.json({ message: "Мероприятие заблокировано" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при блокировке мероприятия" });
  }
};

exports.blockUser = async (req, res) => {
  if (!req.user.admin) {
    return res.status(403).json({ message: "Доступ запрещён" });
  }
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    user.blocked = true;
    await user.save();
    res.json({ message: "Пользователь заблокирован" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при блокировке пользователя" });
  }
};
