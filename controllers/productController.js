const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");

//@DESC get all products
//@route GET /api/products/
//@access private
const getProducts = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  const products = await Product.find({ user_id: req.user.id })
    .populate({
      path: "product_line",
      select: "product_line_name position color",
    })
    .sort({
      "product_line.position": 1,
      position: 1,
    });
  res.json(products);
});

//@DESC get one product
//@route GET /api/users/products/:id
//@access private
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id).populate("product_line");
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving product", error: error.message });
  }
});

//@DESC create one product
//@route POST /api/users/products/
//@access private
const createProduct = asyncHandler(async (req, res, next) => {
  const {
    product_name,
    product_line,
    category,
    stock,
    price,
    format,
    description,
    expiration_date,
    barcode,
    image,
    position,
    user_id,
  } = req.body;
  if (!product_name || !price || !format || !user_id) {
    let error = new Error("No dejes campos en blanco");
    error.statusCode = 400;
    res.statusCode = 400;
    return next(error);
  }
  const existingProduct = await Product.findOne({ barcode });
  if (existingProduct) {
    let error = new Error("Ya existe un producto con ese código de barras");
    error.statusCode = 400;
    res.statusCode = 400;
    return next(error);
  }
  const product = new Product({
    product_name,
    product_line,
    category,
    stock: stock || { current: 0, min_required: 0 },
    price,
    format,
    description,
    expiration_date,
    barcode,
    image,
    position,
    user_id,
  });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

//@DESC update one product
//@route PUT /api/users/products/:id
//@access private
//@DESC update one product
//@route PUT /api/users/products/:id
//@access private
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    product_name,
    product_line,
    category,
    stock,
    price,
    format,
    description,
    expiration_date,
    barcode,
    image, // Asegúrate de usar el mismo nombre que en el frontend
    position,
    user_id,
  } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  product.product_name = product_name || product.product_name;
  product.product_line = product_line || product.product_line;
  product.category = category || product.category;
  product.stock = stock || product.stock;
  product.price = price || product.price;
  product.format = format || product.format;
  product.description = description || product.description;
  product.expiration_date = expiration_date || product.expiration_date;
  product.barcode = barcode || product.barcode;
  product.image = image !== undefined ? image : product.image; // Permite eliminar la imagen si es una cadena vacía
  product.position = position || product.position;
  product.user_id = user_id || product.user_id;

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

//@DESC Delete one product
//@route DELETE /api/users/products/:id
//@access private
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
  res.json({ message: "Product successfully deleted" });
});

//@DESC update all the product positions
//@route PUT /api/products/batchUpdate
//@access private
const updateProductsBatch = async (req, res) => {
  try {
    const updates = req.body;
    const results = await Promise.all(
      updates.map((update) =>
        Product.updateOne(
          { _id: update.productId },
          { $set: { position: update.position } }
        )
      )
    );

    const updatedCount = results.filter(
      (result) => result.nModified > 0
    ).length;
    res.status(200).json({
      message: "Productos actualizados con éxito",
      updatedCount: updatedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DESC Update batch product stocks
// @route PUT /api/products/batchUpdateStock
// @access Private
const StockModification = require("../models/stockModificationsModel");
const updateProductStocksBatch = async (req, res) => {
  try {
    const updates = req.body.map((update) => ({
      ...update,
      newStock: parseInt(update.newStock),
    }));

    const modifications = [];

    const results = await Promise.all(
      updates.map(async (update) => {
        const product = await Product.findById(update.productId);
        if (!product) {
          return { error: true, productId: update.productId };
        }
        const previousStock = product.stock.current;
        const quantityChanged = update.newStock - previousStock;

        await Product.updateOne(
          { _id: update.productId },
          { $set: { "stock.current": update.newStock } }
        );

        const modification = new StockModification({
          product_id: update.productId,
          type: quantityChanged > 0 ? "restock" : "sale",
          quantity_changed: Math.abs(quantityChanged),
          date_modified: new Date(),
          user_id: req.user._id,
        });

        await modification.save();
        modifications.push(modification);

        return { success: true, productId: update.productId };
      })
    );

    const updatedCount = results.filter((result) => !result.error).length;

    res.status(200).json({
      message: "Stocks actualizados con éxito",
      updatedCount: updatedCount,
      modifications: modifications,
    });
  } catch (error) {
    console.error("Error al actualizar los stocks:", error);
    res.status(500).json({
      message: "Error al actualizar los stocks",
      error: error.message,
    });
  }
};

// @DESC Update product stocks for breakage
// @route PUT /api/products/batchUpdateStockForBreakage
// @access Private
const updateProductStocksForBreakage = async (req, res) => {
  try {
    const updates = req.body.map((update) => ({
      ...update,
      newStock: parseInt(update.newStock),
    }));

    const modifications = [];

    const results = await Promise.all(
      updates.map(async (update) => {
        const product = await Product.findById(update.productId);
        if (!product) {
          return { error: true, productId: update.productId };
        }
        const previousStock = product.stock.current;
        const quantityChanged = update.newStock - previousStock;

        await Product.updateOne(
          { _id: update.productId },
          { $set: { "stock.current": update.newStock } }
        );

        const modification = new StockModification({
          product_id: update.productId,
          type: "breakage",
          quantity_changed: Math.abs(quantityChanged),
          date_modified: new Date(),
          user_id: req.user._id,
        });

        await modification.save();
        modifications.push(modification);

        return { success: true, productId: update.productId };
      })
    );

    const updatedCount = results.filter((result) => !result.error).length;

    res.status(200).json({
      message: "Stocks actualizados por rotura con éxito",
      updatedCount: updatedCount,
      modifications: modifications,
    });
  } catch (error) {
    console.error("Error al actualizar los stocks por rotura:", error);
    res.status(500).json({
      message: "Error al actualizar los stocks por rotura",
      error: error.message,
    });
  }
};

// @DESC Process and update product stocks from CSV file
// @route POST /api/products/uploadStockCSV
// @access Private
const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");
const uploadProductStocksCSV = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
  const parser = fs.createReadStream(filePath).pipe(
    parse({
      columns: true,
      trim: true,
      skip_empty_lines: true,
    })
  );
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const updates = [];
    for await (const row of parser) {
      const { barcode, sold } = row;
      const soldQuantity = parseInt(sold, 10);
      if (isNaN(soldQuantity)) {
        console.error(`Invalid sold quantity for barcode ${barcode}: ${sold}`);
        continue;
      }
      const product = await Product.findOneAndUpdate(
        { barcode },
        {
          $inc: { "stock.current": -soldQuantity },
          $set: { last_modified: new Date() },
        },
        { new: true, session }
      );
      if (!product) {
        console.error(`Product with barcode ${barcode} not found.`);
        continue;
      }
      const modification = new StockModification({
        product_id: product._id,
        type: "sale",
        quantity_changed: soldQuantity,
        date_modified: new Date(),
        user_id: req.user._id,
      });
      await modification.save({ session });
      updates.push({
        barcode,
        newStock: product.stock.current,
        lastModified: product.last_modified,
      });
    }
    await session.commitTransaction();
    session.endSession();
    fs.unlinkSync(filePath);
    res.status(200).json({ message: "Stocks updated successfully", updates });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    fs.unlinkSync(filePath);
    console.error("Error processing CSV file:", error);
    res
      .status(500)
      .json({ message: "Error processing CSV file", error: error.message });
  }
});

module.exports = {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductsBatch,
  updateProductStocksBatch,
  updateProductStocksForBreakage,
  uploadProductStocksCSV,
};
