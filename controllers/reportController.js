const asyncHandler = require("express-async-handler");
const StockModification = require("../models/stockModificationsModel");

// Obtener todos los informes
exports.getReports = asyncHandler(async (req, res) => {
  const reports = await StockModification.find({});
  res.json(reports);
});

// Crear un nuevo informe
exports.createReport = asyncHandler(async (req, res) => {
  const { product_id, type, quantity_changed, user_id } = req.body;
  const newReport = await StockModification.create({
    product_id,
    type,
    quantity_changed,
    date_modified: new Date(),
    user_id,
  });
  res.status(201).json(newReport);
});

// Obtener un informe específico
exports.getReport = asyncHandler(async (req, res) => {
  const report = await StockModification.findById(req.params.id);
  if (!report) {
    res.status(404).json({ message: "Report not found" });
    return;
  }
  res.json(report);
});

// Eliminar un informe
exports.deleteReports = asyncHandler(async (req, res) => {
  const report = await StockModification.findByIdAndDelete(req.params.id);
  if (!report) {
    res.status(404).json({ message: "Report not found" });
    return;
  }
  res.status(204).send();
});

// PRODUCTOS CON MÁS CAMBIOS DE STOCK
exports.getMostChangedProduct = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await StockModification.aggregate([
    { $match: { user_id: userId } },
    {
      $lookup: {
        from: "products",
        localField: "product_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $group: {
        _id: "$product_id",
        name: { $first: "$productDetails.product_name" },
        barcode: { $first: "$productDetails.barcode" },
        lastModifiedDate: { $last: "$date_modified" },
        totalChanges: { $sum: "$quantity_changed" },
      },
    },
    { $sort: { totalChanges: -1 } },
    { $limit: 10 },
  ]);

  if (!result.length) res.status(404).json({ message: "No products found" });
  else res.json(result);
});

// PRODUCTOS CON MENOS CAMBIOS DE STOCK
exports.lessChangedProduct = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await StockModification.aggregate([
    { $match: { user_id: userId } },
    {
      $lookup: {
        from: "products",
        localField: "product_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $group: {
        _id: "$product_id",
        name: { $first: "$productDetails.product_name" },
        barcode: { $first: "$productDetails.barcode" },
        lastModifiedDate: { $last: "$date_modified" },
        totalChanges: { $sum: "$quantity_changed" },
      },
    },
    { $sort: { totalChanges: 1 } },
    { $limit: 10 },
  ]);

  if (!result.length) res.status(404).json({ message: "No products found" });
  else res.json(result);
});

// PRODUCTOS CON MÁS Y MENOS INCIDENCIAS O ROTURAS
exports.flopTopBroken = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await StockModification.aggregate([
    { $match: { type: "breakage", user_id: userId } },
    {
      $lookup: {
        from: "products",
        localField: "product_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $group: {
        _id: "$product_id",
        productName: { $first: "$productDetails.product_name" },
        barcode: { $first: "$productDetails.barcode" },
        lastBrokenDate: { $last: "$date_modified" },
        totalBroken: { $sum: 1 },
      },
    },
    {
      $facet: {
        mostBroken: [{ $sort: { totalBroken: -1 } }, { $limit: 10 }],
        leastBroken: [{ $sort: { totalBroken: 1 } }, { $limit: 10 }],
      },
    },
  ]);

  if (
    !result.length ||
    (!result[0].mostBroken.length && !result[0].leastBroken.length)
  )
    res.status(404).json({ message: "No broken products found" });
  else
    res.json({
      mostBroken: result[0].mostBroken.map((item) => ({
        ...item,
        lastBrokenDate: item.lastBrokenDate.toISOString().substring(0, 10),
      })),
      leastBroken: result[0].leastBroken.map((item) => ({
        ...item,
        lastBrokenDate: item.lastBrokenDate.toISOString().substring(0, 10),
      })),
    });
});

exports.flopTopSales = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await StockModification.aggregate([
    { $match: { type: "sale", user_id: userId } },
    {
      $lookup: {
        from: "products",
        localField: "product_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $group: {
        _id: "$product_id",
        productName: { $first: "$productDetails.product_name" },
        barcode: { $first: "$productDetails.barcode" },
        lastSaleDate: { $last: "$date_modified" },
        totalSales: { $sum: "$quantity_changed" },
      },
    },
    {
      $facet: {
        mostSales: [{ $sort: { totalSales: -1 } }, { $limit: 10 }],
        leastSales: [{ $sort: { totalSales: 1 } }, { $limit: 10 }],
      },
    },
  ]);

  if (
    !result.length ||
    (!result[0].mostSales.length && !result[0].leastSales.length)
  )
    res.status(404).json({ message: "No sales data found" });
  else
    res.json({
      mostSales: result[0].mostSales,
      leastSales: result[0].leastSales,
    });
});
