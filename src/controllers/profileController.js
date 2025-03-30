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
const updateProfile = async (req, res) => {
  const { firstName, lastName, telegram, whatsapp } = req.body;
  const avatar = req.file ? req.file.path : null;

  try {
    const user = await db.User.findByPk(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });

    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      telegram: telegram || user.telegram,
      whatsapp: whatsapp || user.whatsapp,
      avatar: avatar || user.avatar,
    });

    res.json({ message: "Профиль обновлен", user });
  } catch (error) {
    console.error("Ошибка обновления профиля:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });

    // Удаляем аватар пользователя, если он есть
    if (user.avatar) {
      const avatarPath = path.join(__dirname, "..", "public", user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlink(avatarPath, (err) => {
          if (err) console.error("Ошибка удаления аватара:", err);
        });
      }
    }

    // Удаляем пользователя из базы данных
    await user.destroy();

    res.json({ message: "Аккаунт успешно удален" });
  } catch (error) {
    console.error("Ошибка удаления аккаунта:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
const getUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: { exclude: ["password"] },
    });
    res.json(users);
  } catch (error) {
    console.error("Ошибка при получении пользователей:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
const getEventParticipants = async (req, res) => {
  const { eventId } = req.params;
  try {
    const event = await db.Event.findByPk(eventId, {
      include: {
        model: db.User,
        as: "participants",
        attributes: { exclude: ["password"] },
      },
    });
    if (!event) {
      return res.status(404).json({ message: "Мероприятие не найдено" });
    }
    res.json(event.participants);
  } catch (error) {
    console.error("Ошибка при получении участников мероприятия:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
const toggleUserBlock = async (req, res) => {
  const { id } = req.params;
  const { blocked } = req.body;

  try {
    const user = await db.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    console.log("blocked", blocked);

    user.blocked = blocked;
    console.log("user.blockedd", user.blocked);
    await user.save();

    res.json({
      message: `Пользователь ${blocked ? "заблокирован" : "разблокирован"}`,
    });
  } catch (error) {
    console.error("Ошибка при блокировке пользователя:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
  toggleUserBlock,
  getUsers,
  getEventParticipants,
};
