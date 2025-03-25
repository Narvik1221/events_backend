module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define(
    "Favorite",
    {
      // Дополнительное поле id создаётся по умолчанию. Можно добавить уникальность для (userId, eventId)
    },
    {
      timestamps: false,
    }
  );
  return Favorite;
};
