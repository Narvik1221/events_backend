const { Sequelize } = require("sequelize");
require("dotenv").config();
const pg = require("pg");
const sequelize = new Sequelize(process.env.DB_NEON, {
  dialectModule: pg,
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});
module.exports = sequelize;
