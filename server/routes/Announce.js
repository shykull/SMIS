const express = require('express');
const router = express.Router();
const { Announce } = require("../models");
const multer = require('multer');
const cookieParser = require('cookie-parser');
const { verifyToken } = require('../middleware/AuthMiddleware');
const { Op } = require('sequelize');

router.use(cookieParser()); // Enable cookie parsing

// Set up multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../client/public/attach'); // Folder where attachments are saved
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Route to get all announcements
router.get('/', verifyToken, async (req, res) => {
    try {
        const announcements = await Announce.findAll();
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching announcements' });
    }
});

// Route to create a new announcement
router.post('/', verifyToken, upload.single('attachFile'), async (req, res) => {
    const { title, content } = req.body;
    const attachment = req.file ? `/attach/${req.file.filename}` : undefined;

    try {
        const newAnnouncement = await Announce.create({ title, content, attachment });
        res.json(newAnnouncement);
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ message: 'Server error while creating announcement' });
    }
});

// Route to update an announcement
router.put('/:id', verifyToken, upload.single('attachFile'), async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const attachment = req.file ? `/attach/${req.file.filename}` : undefined;

    // Construct update data conditionally
    const updateData = { title, content };

    // Add attachment to updateData only if a new file was uploaded
    if (attachment !== undefined) {
        updateData.attachment = attachment;
    }

    try {
        const updated = await Announce.update(updateData, { where: { id } });

        if (updated[0] === 0) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        const announcement = await Announce.findOne({ where: { id } });
        res.json(announcement);
    } catch (error) {
        console.error('Error updating announcement:', error);
        res.status(500).json({ message: 'Server error while updating announcement' });
    }
});

// Route to delete an announcement
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await Announce.destroy({ where: { id } });

        if (deleted === 0) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ message: 'Server error while deleting announcement' });
    }
});

module.exports = router;