module.exports = (sequelize, DataTypes) => {
  const EventParticipant = sequelize.define("EventParticipant", {
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Events",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  });

  return EventParticipant;
};
