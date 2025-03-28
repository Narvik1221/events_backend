module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define("Event", {
    // id создаётся автоматически
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    // Координаты мероприятия на карте
    latitude: {
      type: DataTypes.DOUBLE, // Изменено с DECIMAL на DOUBLE
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DOUBLE, // Изменено с DECIMAL на DOUBLE
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    blocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return Event;
};
