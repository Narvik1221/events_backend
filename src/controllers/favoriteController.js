const db = require("../models");

exports.addFavorite = async (req, res) => {
  const { eventId } = req.body;
  if (!eventId) {
    return res.status(400).json({ message: "Отсутствует eventId" });
  }
  try {
    const user = await db.User.findByPk(req.user.id);
    const event = await db.Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: "Мероприятие не найдено" });
    }
    await user.addFavoriteEvent(event);
    res.status(201).json({ message: "Мероприятие добавлено в избранное" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при добавлении в избранное" });
  }
};
