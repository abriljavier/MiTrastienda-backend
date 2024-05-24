const express = require("express");
const {
  getReports,
  createReport,
  getReport,
  deleteReports,
  getMostChangedProduct,
} = require("../controllers/reportController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router.use(validateToken);

router.get("/most-changed-product", getMostChangedProduct);
router.route("/").get(getReports).post(createReport);

router.route("/:id").get(getReport).delete(deleteReports);

module.exports = router;
