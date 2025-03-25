module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define("Category", {
    // id создаётся автоматически
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return Category;
};
