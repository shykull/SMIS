const express = require('express');
const router = express.Router();
const { Visitors, Users,Building,Settings } = require('../models');
const { verifyToken } = require('../middleware/AuthMiddleware');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const { Op } = require('sequelize'); // Import Op from Sequelize

const JWT_SECRET = process.env.JWT_SECRET; // Use a secure secret in production
const JWT_EXPIRY = process.env.JWT_EXPIRATION_TIME; // Set token expiry time

router.use(cookieParser()); // Enable cookie parsing


//Route to get visitor settings
router.get('/setting', verifyToken, async (req, res) => {
  try {
    const settings = await Settings.findOne({ where: { id: 1 } });

    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    
    res.json(settings);
    
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

// Route to update visitor settings
router.put('/setting', verifyToken, async (req, res) => {
  try {
    const { visit_days, visit_duration, visit_hours } = req.body;
    const settings = await Settings.findOne({ where: { id: 1 } });

    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    settings.visit_days = visit_days;
    settings.visit_duration = visit_duration;
    settings.visit_hours = visit_hours;
    await settings.save();

    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
});

// Route to get all visitors for the logged-in user
router.get('/all', verifyToken, async (req, res) => {
  try {


    // Find all visitors
    let visitors = await Visitors.findAll({
      include: [
        {
          model: Users,
          as: 'Owner',
          attributes: ['username', 'contact'],
          include: [
            {
              model: Building,
              as: 'Buildings',
              through: { attributes: [] }, // Exclude join table attributes
              attributes: ['block', 'level', 'unit']
            }
          ]
        },
        {
          model: Users,
          as: 'Visitor',
          attributes: ['username', 'contact']
        }
      ]
    });

    // Format the response to include owner and visitor information
    const formattedVisitors = visitors.map(visitor => ({
      id: visitor.id,
      ownerName: visitor.Owner.username,
      ownerContact: visitor.Owner.contact,
      ownerBuilding: visitor.Owner.Buildings.map(building => ({
        block: building.block,
        level: building.level,
        unit: building.unit
      })),
      visitorName: visitor.Visitor.username,
      visitorContact: visitor.Visitor.contact,
      visitorCar: visitor.visitorCar,
      visitStartDate: visitor.visitStartDate,
      visitEndDate: visitor.visitEndDate
    }));

    return res.json(formattedVisitors);
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ message: 'Error fetching visitors' });
  }
});

// Route to get all visitors for the logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming req.user contains the logged-in user's info
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // First, try to find visitors by ownerId
    let visitors = await Visitors.findAll({
      where: { ownerId: userId },
      include: [
        {
          model: Users,
          as: 'Visitor',
          attributes: ['username']
        }
      ]
    });

    // If no visitors found by ownerId, try to find visitors by visitorId
    if (visitors.length === 0) {
      visitors = await Visitors.findAll({
        where: { 
          visitorId: userId,
          visitEndDate: {
            [Op.gte]: today // Only include visitors with visitStartDate today or in the future
          }
         },
        include: [
          {
            model: Users,
            as: 'Owner',
            attributes: ['username', 'id','contact'],
            include: [
              {
                model: Building,
                as: 'Buildings',
                through: { attributes: [] }, // Exclude join table attributes
                attributes: ['block', 'level', 'unit']
              }
            ]
          }
        ]
      });

      // Format the response to include ownerName
      const formattedVisitors = visitors.map(visitor => ({
        id: visitor.Owner.id,
        ownerName: visitor.Owner.username,
        ownerContact: visitor.Owner.contact,
        ownerBuilding: visitor.Owner.Buildings.map(building => ({
          block: building.block,
          level: building.level,
          unit: building.unit
        })),
        visitorCar: visitor.visitorCar,
        visitStartDate: visitor.visitStartDate,
        visitEndDate: visitor.visitEndDate
      }));

      return res.json(formattedVisitors);
    }

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