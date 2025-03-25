// controllers/eventController.js
const db = require("../models");

exports.getEvents = async (req, res) => {
  const { categoryId } = req.query; // Получаем параметр categoryId из query

  try {
    const filterOptions = {
      include: [
        {
          model: db.User,
          as: "participants",
          attributes: ["id"],
        },
        {
          model: db.Category,
          as: "categories", // Включаем категории в запрос
        },
      ],
    };

    // Если categoryId передан, добавляем фильтрацию
    if (categoryId) {
      filterOptions.include.push({
        model: db.Category,
        as: "categories",
        where: { id: categoryId },
      });
    }

    const events = await db.Event.findAll(filterOptions);

    const formattedEvents = events.map((event) => ({
      ...event.toJSON(),
      participantCount: event.participants.length,
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка получения мероприятий" });
  }
};

exports.createEvent = async (req, res) => {
  const {
    name,
    startDate,
    endDate,
    latitude,
    longitude,
    description,
    categoryIds, // Получаем категории как JSON-строку
  } = req.body;

  if (!name || !startDate || !endDate || !latitude || !longitude) {
    return res.status(400).json({ message: "Отсутствуют обязательные поля" });
  }

  const avatar = req.file ? req.file.path : null;
  console.log(req.body);

  try {
    const event = await db.Event.create({
      name,
      startDate,
      endDate,
      latitude,
      longitude,
      description,
      avatar,
      creatorId: req.user.id,
    });

    if (categoryIds) {
      let parsedCategoryIds;
      try {
        parsedCategoryIds = JSON.parse(categoryIds);
      } catch (parseError) {
        return res.status(400).json({ message: "Неверный формат категорий" });
      }
      if (Array.isArray(parsedCategoryIds) && parsedCategoryIds.length > 0) {
        // Приводим каждый элемент к числу и фильтруем невалидные значения
        const validCategoryIds = parsedCategoryIds
          .map((id) => Number(id))
          .filter((id) => !isNaN(id) && id > 0);
        if (validCategoryIds.length > 0) {
          await event.setCategories(validCategoryIds);
        }
      }
    }

    res.status(201).json({ message: "Мероприятие создано", eventId: event.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка создания мероприятия" });
  }
};

exports.joinEvent = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId || req.body.eventId, 10);

    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Некорректный ID мероприятия" });
    }

    const event = await db.Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: "Мероприятие не найдено" });
    }

    const userId = req.user.id; // Получаем ID текущего пользователя

    // Проверим, не является ли пользователь уже участником мероприятия
    const isAlreadyParticipant = await db.EventParticipant.findOne({
      where: { eventId, userId },
    });

    if (isAlreadyParticipant) {
      return res
        .status(400)
        .json({ message: "Вы уже записаны на это мероприятие" });
    }

    // Добавляем запись о пользователе в таблицу EventParticipant
    await db.EventParticipant.create({ eventId, userId });

    // Возвращаем успешный ответ
    return res.status(200).json({ message: "Запись на мероприятие успешна" });
  } catch (error) {
    console.error("Ошибка при записи на мероприятие:", error);
    return res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
};
