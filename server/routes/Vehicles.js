const express = require('express');
const router = express.Router();
const { Permissions, Vehicles, Users, Building, Settings } = require('../models');
const cookieParser = require('cookie-parser');
const { verifyToken } = require('../middleware/AuthMiddleware');
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
                model: Permissions,
                as: 'Permission',
                attributes: ['owner', 'tenant']
            },
            {
              model: Building,
              as: 'Buildings',
              through: { attributes: [] }, // Exclude join table attributes
              attributes: ['block', 'level', 'unit']
            }
          ]
        }
      ],
      order: [[{ model: Users, as: 'Owner' }, 'username', 'ASC']] // Sort by owner's username in ascending order
    });

    // Format the response to include owner and visitor information
    const formattedVehicles = vehicles.map(vehicle => ({
      id: vehicle.id,
      ownerName: vehicle.Owner.username,
      ownerContact: vehicle.Owner.contact,
      ownerPermissions: vehicle.Owner.Permission, // Include permissions in the response
      ownerBuilding: vehicle.Owner.Buildings.map(building => ({
        block: building.block,
        level: building.level,
        unit: building.unit
      })),
      carPlateNumber: vehicle.carPlateNumber,
      ownerComments: vehicle.ownerComments,
      approvalStatus: vehicle.approvalStatus,
    }));

    return res.json(formattedVehicles);
  } catch (error) {
    console.error('Error fetching Vehicles:', error);
    res.status(500).json({ message: 'Error fetching Vehicle Information' });
  }
});

// Route to handle CSV upload and create vehicles
router.post('/upload', verifyToken, async (req, res) => {
    const { vehicles } = req.body;

    try {
        for (const vehicle of vehicles) {
            // Look up the ownerId based on the username
            const owner = await Users.findOne({ where: { username: vehicle.username } });

            if (!owner) {
                console.error(`Owner with username "${vehicle.username}" not found.`);
                return res.status(404).json({ message: `Owner with username "${vehicle.username}" not found.` });
            }

            // Check if the vehicle already exists
            const existingVehicle = await Vehicles.findOne({
                where: {
                    [Op.and]: [
                        { ownerId: owner.id },
                        { carPlateNumber: vehicle.carPlateNumber }
                    ]
                }
            });

            if (!existingVehicle) {
                // Create the vehicle entry with the resolved ownerId
                await Vehicles.create({
                    ownerId: owner.id,
                    carPlateNumber: vehicle.carPlateNumber,
                    approvalStatus: vehicle.approvalStatus || 1, // Default to 1 if not provided
                });
            }
        }

        res.json({ message: 'Vehicle file uploaded successfully' });
    } catch (error) {
        console.error('Error uploading vehicle file:', error);
        res.status(500).json({ message: 'Server error while uploading file' });
    }
});

// Route to approve a vehicle
router.put('/approve/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
  
    try {
      // Find the vehicle by ID
      const vehicle = await Vehicles.findByPk(id);
  
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
  
      // Update the approval status to true
      vehicle.approvalStatus = true;
      await vehicle.save();
  
      res.json({ message: 'Vehicle Registration approved' });
    } catch (error) {
      console.error('Error approving vehicle:', error);
      res.status(500).json({ message: 'Error approving vehicle' });
    }
  });

// Route to delete a vehicle
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
  
    try {
      // Find the vehicle by ID
      const vehicle = await Vehicles.findByPk(id);
  
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
  
      // Delete the vehicle
      await vehicle.destroy();
  
      res.json({ message: 'Vehicle Registration deleted successfully' });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).json({ message: 'Error deleting vehicle' });
    }
  });

module.exports = router;