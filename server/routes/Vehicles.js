const express = require('express');
const router = express.Router();
const { Vehicles, Users, Building, Settings } = require('../models');
const { verifyToken } = require('../middleware/AuthMiddleware');
const cookieParser = require('cookie-parser');
const { Op } = require('sequelize'); // Import Op from Sequelize

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

// Route to get all visitors for the logged-in user
router.get('/all', verifyToken, async (req, res) => {
  try {
    // Find all owner Cars
    let vehicles = await Vehicles.findAll({
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
        }
      ]
    });

    // Format the response to include owner and visitor information
    const formattedVehicles = vehicles.map(vehicle => ({
      id: vehicle.id,
      ownerName: vehicle.Owner.username,
      ownerContact: vehicle.Owner.contact,
      ownerBuilding: vehicle.Owner.Buildings.map(building => ({
        block: building.block,
        level: building.level,
        unit: building.unit
      })),
      carPlateNumber: vehicle.carPlateNumber
    }));

    return res.json(formattedVehicles);
  } catch (error) {
    console.error('Error fetching Vehicles:', error);
    res.status(500).json({ message: 'Error fetching Vehicle Information' });
  }
});


module.exports = router;