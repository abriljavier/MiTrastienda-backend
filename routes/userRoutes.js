const express = require("express");
const {
  registerUser,
  loginUser,
  currentUser,
  generateToken,
  associated,
  sendPasswordResetEmail,
} = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router
  .post("/register", registerUser)
  .post("/login", loginUser)
  .post("/generate-token", validateToken, generateToken)
  .post("/reset-password", sendPasswordResetEmail);
router
  .get("/current", validateToken, currentUser)
  .get("/associated", validateToken, associated);

module.exports = router;
