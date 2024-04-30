const asyncHandler = require("express-async-handler");
const ProductLine = require("../models/productLineModel");
const Product = require("../models/productModel");

//@DESC get all productLines
//@route GET /api/productLine/
//@access private
const getProductLines = asyncHandler(async (req, res) => {
  const productLines = await ProductLine.find({});
  res.status(200).json(productLines);
});

//@DESC get one productLine
//@route GET /api/users/productLine/:id
//@access private
const getProductLine = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const productLine = await ProductLine.findById(id);
  if (!productLine) {
    res.status(404).json({ message: "Product line not found" });
    return;
  }
  res.status(200).json(productLine);
});

// @DESC Create one productLine
// @route POST /api/productLine/
// @access Private
const createProductLine = asyncHandler(async (req, res) => {
  const { product_line_name } = req.body;
  if (!product_line_name) {
    res.status(400).json({ message: "Product line name is required" });
    return;
  }
  const existingProductLine = await ProductLine.findOne({ product_line_name });
  if (existingProductLine) {
    res.status(400).json({ message: "Ya existe esa familia creada" });
    return;
  }
  const productLine = new ProductLine({
    product_line_name,
  });
  const createdProductLine = await productLine.save();
  res.status(201).json(createdProductLine);
});

//@DESC update one productLine
//@route PUT /api/users/productLine/:id
//@access private
const updateProductLine = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { product_line_name } = req.body;
  if (!product_line_name) {
    res.status(400).json({ message: "Product line name is required" });
    return;
  }
  const productLine = await ProductLine.findById(id);
  if (!productLine) {
    res.status(404).json({ message: "Product line not found" });
    return;
  }
  productLine.product_line_name = product_line_name;
  const updatedProductLine = await productLine.save();
  res.status(200).json(updatedProductLine);
});

//@DESC Delete one product
//@route DELETE /api/users/products/:id
//@access private
const deleteProductLine = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const products = await Product.find({ product_line: id });
  if (products.length > 0) {
    res
      .status(400)
      .json({
        message:
          "Product line cannot be deleted because it has associated products",
      });
    return;
  }
  const deletedProductLine = await ProductLine.findByIdAndDelete(id);
  if (!deletedProductLine) {
    res.status(404).json({ message: "Product line not found" });
    return;
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
