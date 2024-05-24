const mongoose = require("mongoose");

const stockModificationSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  type: {
    type: String,
    enum: ["sale", "breakage", "adjustment", "return"],
    required: true,
  },
  quantity_changed: { type: Number, required: true },
  date_modified: { type: Date, default: Date.now },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const StockModification = mongoose.model(
  "StockModification",
  stockModificationSchema
);
module.exports = StockModification;
