const express = require("express");
const {
    getProductLines, getProductLine, createProductLine, updateProductLine, deleteProductLine,
} = require("../controllers/productLineController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router.use(validateToken);
router.route("/").get(getProductLines).post(createProductLine);
router.route("/:id").get(getProductLine).put(updateProductLine).delete(deleteProductLine);

module.exports = router;
