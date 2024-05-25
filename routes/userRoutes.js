const express = require("express");
const {
  registerUser,
  loginUser,
  currentUser,
  generateToken,
  associated,
} = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router
  .post("/register", registerUser)
  .post("/login", loginUser)
  .post("/generate-token", validateToken, generateToken);
router
  .get("/current", validateToken, currentUser)
  .get("/associated", validateToken, associated);

module.exports = router;
