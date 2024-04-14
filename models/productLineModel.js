const mongoose = require("mongoose");

const productLineSchema = new mongoose.Schema({
  product_line_name: { type: String, required: true, unique: true },
});

const ProductLine = mongoose.model("ProductLine", productLineSchema);
module.exports = ProductLine;

