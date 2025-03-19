const express = require('express');
const router = express.Router();
const { Visitors, Users } = require('../models');
const { verifyToken } = require('../middleware/AuthMiddleware');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

const JWT_SECRET = process.env.JWT_SECRET; // Use a secure secret in production
const JWT_EXPIRY = process.env.JWT_EXPIRATION_TIME; // Set token expiry time

router.use(cookieParser()); // Enable cookie parsing

// Route to get all visitors for the logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const ownerId = req.user.id; // Assuming req.user contains the logged-in user's info
    const visitors = await Visitors.findAll({
      where: { ownerId },
      include: [
        {
          model: Users,
          as: 'Visitor',
          attributes: ['username']
        }
      ]
    });

    // Format the response to include visitorName
    const formattedVisitors = visitors.map(visitor => ({
      id: visitor.id,
      visitorName: visitor.Visitor.username,
      visitorCar: visitor.visitorCar,
      visitStartDate: visitor.visitStartDate,
      visitEndDate: visitor.visitEndDate
    }));

    res.json(formattedVisitors);
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ message: 'Error fetching visitors' });
  }
});

// Route to create a new visitor
router.post('/', verifyToken, async (req, res) => {
  try {
    const ownerId = req.user.id; // Assuming req.user contains the logged-in user's info
    const { visitorName, visitorCar, visitStartDate, visitEndDate } = req.body;

    // Check if the visitor name exists in the Users table
    let visitor = await Users.findOne({ where: { username: visitorName } });

    if (!visitor) {
      // If the visitor does not exist, create a new user with the default password
      const hashedPassword = await bcrypt.hash('123456', 10);
      visitor = await Users.create({
        username: visitorName,
        password: hashedPassword
      });
    }

    const newVisitor = await Visitors.create({
      ownerId,
      visitorId: visitor.id,
      visitorCar,
      visitStartDate,
      visitEndDate
    });

    res.status(201).json(newVisitor);
  } catch (error) {
    console.error('Error creating visitor:', error);
    res.status(500).json({ message: 'Error creating visitor' });
  }
});

// Route to update a visitor
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const ownerId = req.user.id; // Assuming req.user contains the logged-in user's info
    const { id } = req.params;
    const { visitorCar, visitStartDate, visitEndDate } = req.body;
    const visitor = await Visitors.findOne({ where: { id, ownerId } });

    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    visitor.visitorCar = visitorCar;
    visitor.visitStartDate = visitStartDate;
    visitor.visitEndDate = visitEndDate;
    await visitor.save();

    res.json(visitor);
  } catch (error) {
    console.error('Error updating visitor:', error);
    res.status(500).json({ message: 'Error updating visitor' });
  }
});

module.exports = router;