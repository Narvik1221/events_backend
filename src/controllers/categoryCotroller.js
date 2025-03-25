// controllers/categoryController.js
const db = require("../models");

exports.getCategories = async (req, res) => {
  try {
    const categories = await db.Category.findAll();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка получения категорий" });
  }
};
