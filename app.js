const express = require("express");
const connectDb = require("./config/dbConnection.js");
const dotenv = require("dotenv").config();

connectDb();
const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening in http://localhost:${port}`);
});
