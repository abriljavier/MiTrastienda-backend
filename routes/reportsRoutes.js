const express = require("express");
const {
  getReports,
  createReport,
  getReport,
  deleteReports,
  getMostChangedProduct,
  lessChangedProduct,
  flopTopBroken,
  flopTopSales,
} = require("../controllers/reportController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router.use(validateToken);

router.get("/most-changed-product", getMostChangedProduct);
router.get("/less-changed-product", lessChangedProduct);
router.get("/flop-top-broken", flopTopBroken);
router.get("/flop-top-sales", flopTopSales);
router.route("/").get(getReports).post(createReport);

router.route("/:id").get(getReport).delete(deleteReports);

module.exports = router;
