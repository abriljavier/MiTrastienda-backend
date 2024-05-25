const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const validateToken = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers["authorization"];

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!authHeader || !token) {
    res
      .status(401)
      .json({ message: "Authorization header missing or token not found" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    next();
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ message: "Invalid token", error: error.message });
  }
});

module.exports = validateToken;
