const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

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

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            res
                .status(401)
                .json({ message: "User is not authorized", error: err.message });
            return;
        }

        req.user = decoded;
        next();
    });
});

module.exports = validateToken;
