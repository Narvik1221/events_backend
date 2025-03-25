const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryCotroller");

router.get("/", categoryController.getCategories);

module.exports = router;
