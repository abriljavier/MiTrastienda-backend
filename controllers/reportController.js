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

//EL PRODUCTO CON MAS CAMBIOS DE STOCK
exports.getMostChangedProduct = asyncHandler(async (req, res) => {
  const result = await StockModification.aggregate([
    {
      $group: {
        _id: "$product_id",
        totalChanges: { $sum: "$quantity_changed" },
      },
    },
    { $sort: { totalChanges: -1 } },
    { $limit: 1 },
  ]);

  if (!result.length) res.status(404).json({ message: "No products found" });
  else res.json(result[0]);
});
