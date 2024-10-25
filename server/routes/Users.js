const express = require('express');
const router = express.Router();
const { Users } = require("../models");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const {verifyToken}=require('../middleware/AuthMiddleware');

const JWT_SECRET = process.env.JWT_SECRET; // Use a secure secret in production
const JWT_EXPIRY = process.env.JWT_EXPIRATION_TIME; // Set token expiry time

router.use(cookieParser()); // Enable cookie parsing

router.post("/", async (req, res) => {
    try {
        const { username, password } = req.body;
        // Check if the username already exists
        const userExists = await Users.findOne({ where: { username: username } });
        
        if (userExists) {
            return res.status(400).json({ error: "Username already taken" });
        }

        // If username does not exist, hash the password and create the user
        const hash = await bcrypt.hash(password, 10); // Await bcrypt hash result
        await Users.create({ username: username, password: hash }); // Await user creation
        res.json("Success!");
    } catch (error) {
        res.status(500).json({ error: "Something went wrong!" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Users.findOne({ where: { username: username } });

        if (!user) {
            return res.status(404).json({ error: "User Doesn't Exist" });
        }

        // Check password using bcrypt
        bcrypt.compare(password, user.password)
            .then((match) => {
                if (!match) {
                    return res.status(400).json({ error: "Wrong username and password!" });
                }

                // Generate a JWT token
                const token = jwt.sign({ username: user.username, id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

                // Send the token as an HTTP-only cookie
                res.cookie('token', token, {
                    path: '/',
                    httpOnly: true,
                    secure: false, // Set to true if using HTTPS
                    sameSite: 'Strict', // Helps prevent CSRF attacks
                    maxAge: 86400000, // 24 hours in milliseconds
                });

                // Send back a success message with the user's info
                return res.json({ message: "Login Success", username: user.username, id: user.id });
            })
            .catch((err) => {
                // Handle unexpected bcrypt errors
                console.error("Error comparing passwords:", err);
                return res.status(500).json({ error: "Something went wrong!" });
            });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Something went wrong!" });
    }
});


router.post("/logout", (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV,
        sameSite: 'Strict',
    });
    res.json({ message: "Logged out successfully" });
});

router.get('/status', verifyToken, async (req, res) => {
    try {
        const user = await Users.findOne({
            where: { id: req.user.id },
            attributes: { exclude: ['password'] } // Exclude sensitive fields
        });
        if (user) {
            res.json({ loggedIn: true, user });
        } else {
            res.json({ loggedIn: false });
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.json({ loggedIn: false });
    }
});

  

module.exports =  router;