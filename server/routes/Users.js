const express = require('express');
const router = express.Router();
const { Users, Permissions } = require("../models");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const { verifyToken } = require('../middleware/AuthMiddleware');
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET; // Use a secure secret in production
const JWT_EXPIRY = process.env.JWT_EXPIRATION_TIME; // Set token expiry time

router.use(cookieParser()); // Enable cookie parsing

// Set up multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../client/public/profile'); // Folder where profile pictures are saved
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

router.get('/all', verifyToken, async (req, res) => {
    try {
        const users = await Users.findAll({ attributes: { exclude: ['password'] }, include: [Permissions] });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

router.post("/", async (req, res) => {
    try {
        const { username, password } = req.body;
        // Check if the username already exists
        const userExists = await Users.findOne({ where: { username: username } });

        if (userExists) {
            return res.status(400).json({ message: "Username already taken" });
        }

        // If username does not exist, hash the password and create the user
        const hash = await bcrypt.hash(password, 10); // Await bcrypt hash result
        await Users.create({ username: username, password: hash }); // Await user creation
        res.json("Success!");
    } catch (error) {
        res.status(500).json({ message: "Something went wrong!" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Users.findOne({ where: { username: username }, include: [Permissions] });

        if (!user) {
            return res.status(404).json({ message: "User Doesn't Exist" });
        }

        // Check password using bcrypt
        bcrypt.compare(password, user.password)
            .then((match) => {
                if (!match) {
                    return res.status(400).json({ message: "Wrong username and password!" });
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
                return res.json({ message: "Login Success", user });
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
            attributes: { exclude: ['password'] }, // Exclude sensitive fields
            include: [Permissions]
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

// Route to update user profile
router.put('/profile', verifyToken, upload.single('profilePicture'), async (req, res) => {
    const { id, email, firstname, lastname, contact, address, password } = req.body;
    const profilePicture = req.file ? `/profile/${req.file.filename}` : undefined; // Use undefined instead of null

    // Construct update data conditionally
    const updateData = { email, firstname, lastname, contact, address };

    // Add profilePicture to updateData only if a new file was uploaded
    if (profilePicture !== undefined) {
        updateData.profilePicture = profilePicture;
    }

    // Hash the new password if provided
    if (password) {
        const hash = await bcrypt.hash(password, 10);
        updateData.password = hash;
    }

    try {
        // Update user profile in the database
        const updated = await Users.update(updateData, { where: { id } });

        if (updated === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = await Users.findOne({
            where: { id: id },
            attributes: { exclude: ['password'] } // Exclude sensitive fields
        });

        res.json({ user });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
});

// Route to update user permissions and profile information
router.put('/updateUser', verifyToken, async (req, res) => {
    const { id, username, email, contact, firstname, lastname, password, permissions } = req.body;

    const userExists = await Users.findOne({ where: { username: username } });

    if (userExists) {
        return res.status(400).json({ message: "Username already taken" });
    }

    // Construct update data conditionally
    const updateData = { username, email, contact, firstname, lastname };

    // Hash the new password if provided
    if (password) {
        const hash = await bcrypt.hash(password, 10);
        updateData.password = hash;
    }

    try {
        // Update user profile in the database
        const updated = await Users.update(updateData, { where: { id } });

        if (updated[0] === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user permissions in the database
        await Permissions.update(permissions, { where: { UserId: id } });

        const user = await Users.findOne({
            where: { id: id },
            attributes: { exclude: ['password'] }, // Exclude sensitive fields
            include: [Permissions]
        });

        res.json({ user });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error while updating user' });
    }
});

// Route to delete a user
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Delete user from the database
        const deleted = await Users.destroy({ where: { id } });

        if (deleted === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error while deleting user' });
    }
});

// Route to handle CSV upload and create users
router.post('/upload', verifyToken, async (req, res) => {
    const { users } = req.body;

    try {
        for (const user of users) {
            const existingUser = await Users.findOne({ where:  { username: user.username }} );
            if (!existingUser) {
                const hash = await bcrypt.hash(user.password, 10);
                await Users.create({ ...user, password: hash });
            }
        }
        res.json({ message: 'Users uploaded successfully' });
    } catch (error) {
        console.error('Error uploading users:', error);
        res.status(500).json({ message: 'Server error while uploading users' });
    }
});

module.exports = router;