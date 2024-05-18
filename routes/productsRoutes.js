const express = require("express");
const {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductsBatch,
  updateProductStocksBatch,
} = require("../controllers/productController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router.use(validateToken);
router.route("/").get(getProducts).post(createProduct);
router.put("/batchUpdate", validateToken, updateProductsBatch);
router.put("/batchUpdateStock", validateToken, updateProductStocksBatch);
router.route("/:id").get(getProduct).put(updateProduct).delete(deleteProduct);

module.exports = router;
