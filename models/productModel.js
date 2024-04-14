const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    product_name: { type: String, required: true },
    product_line: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductLine",
    },
    category: { type: String, required: true },
    stock: {
      current: { type: Number, required: true, default: 0 },
      min_required: { type: Number, required: true, default: 0 },
    },
    price: { type: Number, required: true },
    format: { type: Number, required: true },
    description: { type: String, required: true },
    last_modified: { type: Date, default: Date.now },
    expiration_date: { type: Date },
    barcode: { type: String, unique: true, required: true },
    images: [String],
    position: { type: Number, required: true },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "last_modified" } }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
