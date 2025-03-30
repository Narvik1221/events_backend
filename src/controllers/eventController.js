const db = require("../models");
const { Op, cast, col } = require("sequelize");
const { deleteFileFromCloudinary } = require("../middlewares/upload");
exports.getEvents = async (req, res) => {
  const { categoryId, search, userLat, userLng, radius, eventStatus } =
    req.query;
  console.log("getEvents", req.query);
  try {
    const filterOptions = {
      where: {},
      include: [
        {
          model: db.User,
          as: "participants",
          attributes: ["id"],
        },
        {
          model: db.Category,
          as: "categories",
        },
      ],
    };

    if (search) {
      filterOptions.where = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          db.sequelize.where(cast(col("Event.latitude"), "text"), {
            [Op.iLike]: `%${search}%`,
          }),
          db.sequelize.where(cast(col("Event.longitude"), "text"), {
            [Op.iLike]: `%${search}%`,
          }),
          db.sequelize.where(cast(col("Event.startDate"), "text"), {
            [Op.iLike]: `%${search}%`,
          }),
          db.sequelize.where(cast(col("Event.endDate"), "text"), {
            [Op.iLike]: `%${search}%`,
          }),
        ],
      };
    }

    if (categoryId) {
      filterOptions.include.push({
        model: db.Category,
        as: "categories",
        where: { id: categoryId },
      });
    }

    if (userLat && userLng && radius) {
      const lat = parseFloat(userLat);
      const lng = parseFloat(userLng);
      const rad = parseFloat(radius);
      if (!isNaN(lat) && !isNaN(lng) && !isNaN(rad)) {
        const distanceCondition = `(6371 * acos(cos(radians(${lat})) * cos(radians("Event"."latitude")) * cos(radians("Event"."longitude") - radians(${lng})) + sin(radians(${lat})) * sin(radians("Event"."latitude")))) < ${rad}`;
        filterOptions.where = {
          ...filterOptions.where,
          [Op.and]: [db.sequelize.literal(distanceCondition)],
        };
      }
    }

    // Фильтрация по статусу мероприятия
    if (eventStatus) {
      const now = new Date();
      if (eventStatus === "current") {
        // Текущие мероприятия: начались и еще не закончились
        filterOptions.where = {
          ...filterOptions.where,
          startDate: { [Op.lte]: now },
          endDate: { [Op.gte]: now },
        };
      } else if (eventStatus === "upcoming") {
        // Предстоящие мероприятия: еще не начались
        filterOptions.where = {
          ...filterOptions.where,
          startDate: { [Op.gt]: now },
        };
      }
    }

    console.log("filterOptions", filterOptions);
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

exports.getUserEvents = async (req, res) => {
  try {
    const userId = req.user.id; // Получаем ID текущего пользователя

    // Получаем все мероприятия, в которых участвует пользователь
    const events = await db.Event.findAll({
      include: {
        model: db.User,
        as: "participants", // Используйте ассоциацию, установленную выше
        where: { id: userId },
        required: true, // Это обязательная ассоциация
      },
    });

    if (!events || events.length === 0) {
      return res
        .status(404)
        .json({ message: "У вас нет записанных мероприятий" });
    }

    // Возвращаем список мероприятий
    return res.status(200).json(events);
  } catch (error) {
    console.error("Ошибка при получении мероприятий пользователя:", error);
    return res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
};
exports.leaveEvent = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);

    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Некорректный ID мероприятия" });
    }

    const userId = req.user.id; // Получаем ID текущего пользователя

    // Проверяем, записан ли пользователь на мероприятие
    const participation = await db.EventParticipant.findOne({
      where: { eventId, userId },
    });

    if (!participation) {
      return res
        .status(400)
        .json({ message: "Вы не записаны на это мероприятие" });
    }

    // Удаляем запись о пользователе в EventParticipant
    await db.EventParticipant.destroy({
      where: { eventId, userId },
    });

    return res.status(200).json({ message: "Вы успешно вышли из мероприятия" });
  } catch (error) {
    console.error("Ошибка при выходе из мероприятия:", error);
    return res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
};
exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    startDate,
    endDate,
    latitude,
    longitude,
    description,
    categoryIds, // Получаем категории как JSON-строку
  } = req.body;

  const avatar = req.file ? req.file.path : null;

  try {
    const event = await db.Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: "Мероприятие не найдено" });
    }

    // Обновляем поля (если переданы новые данные)
    event.name = name || event.name;
    event.startDate = startDate || event.startDate;
    event.endDate = endDate || event.endDate;
    event.latitude = latitude || event.latitude;
    event.longitude = longitude || event.longitude;
    event.description = description || event.description;
    if (avatar) {
      event.avatar = avatar;
    }
    await event.save();

    if (categoryIds) {
      let parsedCategoryIds;
      try {
        parsedCategoryIds = JSON.parse(categoryIds);
      } catch (parseError) {
        return res.status(400).json({ message: "Неверный формат категорий" });
      }
      if (Array.isArray(parsedCategoryIds) && parsedCategoryIds.length > 0) {
        const validCategoryIds = parsedCategoryIds
          .map((id) => Number(id))
          .filter((id) => !isNaN(id) && id > 0);
        if (validCategoryIds.length > 0) {
          await event.setCategories(validCategoryIds);
        }
      }
    }

    res
      .status(200)
      .json({ message: "Мероприятие обновлено", eventId: event.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка обновления мероприятия" });
  }
};
exports.getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id; // Получаем ID текущего пользователя

    // Находим все мероприятия, где пользователь является создателем
    const events = await db.Event.findAll({
      where: { creatorId: userId },
      include: [
        {
          model: db.Category,
          as: "categories",
        },
        {
          model: db.User,
          as: "participants",
          attributes: ["id"],
        },
      ],
    });

    if (!events || events.length === 0) {
      return res
        .status(404)
        .json({ message: "У вас нет созданных мероприятий" });
    }

    const formattedEvents = events.map((event) => ({
      ...event.toJSON(),
      participantCount: event.participants ? event.participants.length : 0,
    }));

    return res.status(200).json(formattedEvents);
  } catch (error) {
    console.error("Ошибка при получении созданных мероприятий:", error);
    return res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
};

exports.deleteEvent = async (req, res) => {
  const eventId = req.params.id;

  try {
    const event = await db.Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: "Мероприятие не найдено" });
    }

    // Если у мероприятия есть avatar, удаляем изображение из Cloudinary
    if (event.avatar) {
      // Извлекаем public_id из URL. Предполагается, что URL имеет вид:
      // "https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<folder>/<public_id>.<ext>"
      const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+/;
      const match = event.avatar.match(regex);
      if (match && match[1]) {
        const publicId = match[1];
        await deleteFileFromCloudinary(publicId);
      }
    }

    // Удаляем мероприятие из базы
    await event.destroy();

    res.json({ message: "Мероприятие успешно удалено" });
  } catch (error) {
    console.error("Ошибка удаления мероприятия:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
