const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
   
    const token = req.cookies.token; // Read the token from cookies
    const JWT_SECRET = process.env.JWT_SECRET; // Use default or environment secret

    if (!token) {
        return res.status(401).json({ error: "Access Denied. User not logged in." });
    }

    try {
        // Verify the token using JWT_SECRET
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified; // Attach user info to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error("JWT verification failed:", err); // Log error for debugging
        res.status(403).json({ error: "Invalid Token" });
    }
};

module.exports = { verifyToken };
