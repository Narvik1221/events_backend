const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Импорт моделей
db.User = require("./user")(sequelize, DataTypes);
db.Event = require("./event")(sequelize, DataTypes);
db.Category = require("./category")(sequelize, DataTypes);
db.Favorite = require("./favorite")(sequelize, DataTypes);
db.EventParticipant = require("./eventParticipant")(sequelize, DataTypes);

// Связь многие ко многим между мероприятиями и категориями через вспомогательную таблицу 'EventCategory'
db.Event.belongsToMany(db.Category, {
  through: "EventCategory",
  as: "categories",
  foreignKey: "eventId",
});
db.Category.belongsToMany(db.Event, {
  through: "EventCategory",
  as: "events",
  foreignKey: "categoryId",
});

// Связь "один ко многим": пользователь создаёт много мероприятий
db.User.hasMany(db.Event, { as: "createdEvents", foreignKey: "creatorId" });
db.Event.belongsTo(db.User, { as: "creator", foreignKey: "creatorId" });

// Связь многие ко многим для избранного
db.User.belongsToMany(db.Event, {
  through: db.Favorite,
  as: "favoriteEvents",
  foreignKey: "userId",
});
db.Event.belongsToMany(db.User, {
  through: db.Favorite,
  as: "favoritedBy",
  foreignKey: "eventId",
});

// Связь многие ко многим для участников мероприятий
db.User.belongsToMany(db.Event, {
  through: db.EventParticipant,
  as: "participatedEvents",
  foreignKey: "userId",
});
db.Event.belongsToMany(db.User, {
  through: db.EventParticipant,
  as: "participants",
  foreignKey: "eventId",
});

module.exports = db;
