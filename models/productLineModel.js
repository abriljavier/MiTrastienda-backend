const mongoose = require("mongoose");

const productLineSchema = new mongoose.Schema({
  product_line_name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  position: {
    type: Number,
    default: null,
    unique: true,
    sparse: true,
  },
  color: {
    type: String,
    default: "#808080",
  },
});

const ProductLine = mongoose.model("ProductLine", productLineSchema);
module.exports = ProductLine;
