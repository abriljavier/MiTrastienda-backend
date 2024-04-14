const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

//@desc Register a user
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
    const { CIF, username, email, password, is_admin } = req.body;
    if (!CIF || !username || !email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory");
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }, { CIF }] });
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
        is_admin: is_admin || false
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            is_admin: user.is_admin
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

    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
                email: user.email,
                is_admin: user.is_admin
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        user.password = undefined;

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            is_admin: user.is_admin,
            token: token
        });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});

//@desc Current user
//@route GET /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
    res.json({
        _id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        is_admin: req.user.is_admin
    });
});

module.exports = {
    registerUser,
    loginUser,
    currentUser,
};
