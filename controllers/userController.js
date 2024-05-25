const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Invitation = require("../models/invitationModel");
const transporter = require("../utils/nodemailerConfig");

//@desc Register a user
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
  const { CIF, username, email, password, inviteCode } = req.body;
  if (!CIF || !username || !email || !password || !inviteCode) {
    res.status(400);
    throw new Error("All fields are mandatory, including invitation code.");
  }
  const invitation = await Invitation.findOne({
    code: inviteCode,
    used: false,
    expiresAt: { $gt: new Date() },
  });
  if (!invitation) {
    res.status(400);
    throw new Error("Invalid or expired invitation code.");
  }
  const userExists = await User.findOne({
    $or: [{ email }, { username }, { CIF }],
  });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists with that email, username or CIF");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    CIF,
    username,
    email,
    password: hashedPassword,
    is_admin: false,
  });

  if (user) {
    invitation.used = true;
    await invitation.save();

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
    });
  } else {
    res.status(400);
    throw new Error("User could not be created");
  }
});

// Desc: Authenticate a user and get token
// Route: POST /api/users/login
// Access: Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide an email and password");
  }

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    user.password = undefined;

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
      token: token,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc Current user
// @route GET /api/users/current
// @access private
const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// @desc Get a invitation token
// @route POST /api/users/generate-token
// @access private
const generateToken = asyncHandler(async (req, res) => {
  if (!req.user.is_admin) {
    res.status(403);
    throw new Error("Only administrators can generate invitation codes.");
  }
  const code = generateUniqueCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1);
  const invitation = new Invitation({
    code,
    used: false,
    expiresAt,
  });
  try {
    await invitation.save();
    res.status(201).json({
      success: true,
      message: "Invitation code generated successfully",
      code: invitation.code,
      expiresAt: invitation.expiresAt,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to generate invitation code.");
  }
});

function generateUniqueCode() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// @desc Get all associated users
// @route GET /api/users/associated
// @access Private
const associated = asyncHandler(async (req, res) => {
  // Verificar si el usuario es administrador
  if (!req.user.is_admin) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "-password"
    );
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
});

// @desc POST resetPassword
// @route POST /api/users/reset-password-request
// @access Private
const sendPasswordResetEmail = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  const resetLink = `http://localhost:4200/reset-password/${token}`; // Ajusta este enlace según tu frontend

  const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: "Password Reset Request",
    html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.status(500).json({ message: "Error sending email" });
    } else {
      res.status(200).json({ message: "Password reset email sent" });
    }
  });
});

module.exports = {
  registerUser,
  loginUser,
  currentUser,
  generateToken,
  associated,
  sendPasswordResetEmail,
};
