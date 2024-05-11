const asyncHandler = require("express-async-handler");
const ProductLine = require("../models/productLineModel");
const Product = require("../models/productModel");

//@DESC get all productLines
//@route GET /api/productLine/
//@access private
const getProductLines = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const productLines = await ProductLine.find({ user: userId });
  res.status(200).json(productLines);
});

//@DESC get one productLine
//@route GET /api/users/productLine/:id
//@access private
const getProductLine = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const productLine = await ProductLine.findOne({ _id: id, user: userId });
  if (!productLine) {
    res
      .status(404)
      .json({ message: "Product line not found or access denied" });
    return;
  }
  res.status(200).json(productLine);
});

// @DESC Create one productLine
// @route POST /api/productLine/
// @access Private
const createProductLine = asyncHandler(async (req, res) => {
  const { product_line_name, color } = req.body;
  const userId = req.user.id;
  if (!product_line_name) {
    return res.status(400).json({ message: "Product line name is required" });
  }
  const existingProductLine = await ProductLine.findOne({
    product_line_name,
    user: userId,
  });
  if (existingProductLine) {
    return res
      .status(400)
      .json({ message: "Ya existe una familia con ese nombre." });
  }
  const lastProductLine = await ProductLine.findOne({ user: userId })
    .sort({ position: -1 })
    .select("position");
  const newPosition =
    lastProductLine && lastProductLine.position !== null
      ? lastProductLine.position + 1
      : 0;
  const productLine = new ProductLine({
    product_line_name,
    user: userId,
    position: newPosition,
    color: color || "#808080",
  });

  try {
    const createdProductLine = await productLine.save();
    res.status(201).json(createdProductLine);
  } catch (error) {
    console.error("Error creating product line:", error);
    res
      .status(500)
      .json({ message: "Error creating product line", error: error.message });
  }
});

//@DESC update one productLine
//@route PUT /api/users/productLine/:id
//@access private
const updateProductLine = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { product_line_name, position, color } = req.body;
  const productLine = await ProductLine.findOne({ _id: id, user: userId });
  if (!productLine) {
    return res
      .status(404)
      .json({ message: "Product line not found or access denied" });
  }
  const existingProductLine = await ProductLine.findOne({
    _id: { $ne: id },
    $or: [
      { product_line_name },
      { position: position ? position : productLine.position },
      { color: color ? color : productLine.color },
    ],
  });

  if (existingProductLine) {
    let message = "Ya existe una familia con ese nombre, posición o color.";
    if (existingProductLine.product_line_name === product_line_name) {
      message = "Ya existe una familia con ese nombre.";
    } else if (existingProductLine.position === position) {
      message = "Ya existe una familia con esa posición.";
    } else if (existingProductLine.color === color) {
      message = "Ya existe una familia con ese color.";
    }
    return res.status(400).json({ message });
  }
  productLine.product_line_name = product_line_name;
  if (position !== undefined) productLine.position = position;
  if (color !== undefined) productLine.color = color;
  try {
    const updatedProductLine = await productLine.save();
    res.status(200).json(updatedProductLine);
  } catch (error) {
    console.error("Error updating product line:", error);
    res
      .status(500)
      .json({ message: "Error updating product line", error: error.message });
  }
});

//@DESC Delete one product
//@route DELETE /api/users/products/:id
//@access private
const deleteProductLine = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const productLine = await ProductLine.findOne({ _id: id, user: userId });
  if (!productLine) {
    return res
      .status(404)
      .json({ message: "Product line not found or access denied" });
  }
  const products = await Product.countDocuments({ product_line: id });
  if (products > 0) {
    return res.status(400).json({
      message: `No se puede borrar una familia con productos asociados`,
    });
  }
  const deletedProductLine = await ProductLine.findByIdAndDelete(id);
  if (!deletedProductLine) {
    return res.status(404).json({ message: "Product line not found" });
  }
  res.status(200).json({ message: "Product line successfully deleted" });
});

module.exports = {
  getProductLines,
  getProductLine,
  createProductLine,
  updateProductLine,
  deleteProductLine,
};
