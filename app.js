const express = require("express");
const connectDb = require("./config/dbConnection.js");
const dotenv = require("dotenv").config();
const errorHandler = require("./middleware/errorHandler");


connectDb();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/users", require("./routes/userRoutes.js"));
app.use("/api/products", require("./routes/productsRoutes.js"));

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening in http://localhost:${port}`);
});
