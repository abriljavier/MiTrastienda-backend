const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const connectDb = require("./config/dbConnection.js");
const errorHandler = require("./middleware/errorHandler");

connectDb();

const app = express();

app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/users", require("./routes/userRoutes.js"));
app.use("/api/products", require("./routes/productsRoutes.js"));
app.use("/api/productLine", require("./routes/productLineRoutes.js"));

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
