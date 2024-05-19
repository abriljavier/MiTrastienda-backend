const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductsBatch,
  updateProductStocksBatch,
  uploadProductStocksCSV,
} = require("../controllers/productController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router.use(validateToken);
router.route("/").get(getProducts).post(createProduct);
router.put("/batchUpdate", validateToken, updateProductsBatch);
router.put("/batchUpdateStock", validateToken, updateProductStocksBatch);
router.post(
  "/uploadStockCSV",
  validateToken,
  upload.single("file"),
  uploadProductStocksCSV
);
router.route("/:id").get(getProduct).put(updateProduct).delete(deleteProduct);

module.exports = router;
