

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("./Controllers/bills_controller");

// const formData = require("express-form-data");
const bodyParser = require("body-parser");
const connection = require("./Config/db");
const { readdirSync } = require("fs");
const morgan = require("morgan");
const { Sequelize } = require("sequelize");
const sequelize = require("./Models/usersModel");

const app = express();
// connection()
app.use(cors());
app.use(bodyParser.json());
// app.use(formData.parse());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

readdirSync("./Routes").map((read) =>
  app.use("/api", require("./Routes/" + read))
);

// function ^^^ stand for this vvv
// const usersRouters  = require('./Routes/users');
// app.use('/api',usersRouters)

app.listen(3000, '0.0.0.0', async () => {
  await sequelize.sync({ force: false });
  console.log("Server listening on port 3000");
});
