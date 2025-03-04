const express = require('express');
const router = express.Router();
const { Building, UserBuildings } = require("../models");
const cookieParser = require('cookie-parser');
const { verifyToken } = require('../middleware/AuthMiddleware');
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET; // Use a secure secret in production
const JWT_EXPIRY = process.env.JWT_EXPIRATION_TIME; // Set token expiry time

router.use(cookieParser()); // Enable cookie parsing


// Create a new building
router.post('/create', verifyToken, async (req, res) => {
    const { Name, Level, Unit, Area, ShareUnit } = req.body;

    try {
        const building = await Building.create({ Name, Level, Unit, Area, ShareUnit });
        res.json(building);
    } catch (error) {
        res.status(500).json({ message: 'Error creating building', error });
    }
});

// Get all buildings
router.get('/all', verifyToken, async (req, res) => {
    try {
        const buildings = await Building.findAll();
        res.json(buildings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching buildings', error });
    }
});

// Get a single building by ID
router.get('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const building = await Building.findByPk(id);
        if (!building) {
            return res.status(404).json({ message: 'Building not found' });
        }
        res.json(building);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching building', error });
    }
});

// Update a building by ID
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { Name, Level, Unit, Area, ShareUnit } = req.body;


    try {
        const building = await Building.findByPk(id);
        if (!building) {
            return res.status(404).json({ message: 'Building not found' });
        }

        building.Name = Name;
        building.Level = Level;
        building.Unit = Unit;
        building.Area = Area;
        building.ShareUnit = ShareUnit;

        await building.save();
        res.json(building);
    } catch (error) {
        res.status(500).json({ message: 'Error updating building', error });
    }
});

// Delete a building by ID
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const building = await Building.findByPk(id);
        if (!building) {
            return res.status(404).json({ message: 'Building not found' });
        }

        await building.destroy();
        res.json({ message: 'Building deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting building', error });
    }
});

// Create a new user-building association
router.post('/assoc', verifyToken, async (req, res) => {
    const { UserId, BuildingId } = req.body;

    try {
        const userBuilding = await UserBuildings.create({ UserId, BuildingId });
        res.json(userBuilding);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user-building association', error });
    }
});

// Get all user-building associations
router.get('/assoc/all', verifyToken, async (req, res) => {
    try {
        const userBuildings = await UserBuildings.findAll();
        res.json(userBuildings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user-building associations', error });
    }
});

// Get a single user-building association by ID
router.get('/assoc/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const userBuilding = await UserBuildings.findByPk(id);
        if (!userBuilding) {
            return res.status(404).json({ message: 'User-building association not found' });
        }
        res.json(userBuilding);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user-building association', error });
    }
});

// Update a user-building association by ID
router.put('/assoc/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { UserId, BuildingId } = req.body;

    try {
        const userBuilding = await UserBuildings.findByPk(id);
        if (!userBuilding) {
            return res.status(404).json({ message: 'User-building association not found' });
        }

        userBuilding.UserId = UserId;
        userBuilding.BuildingId = BuildingId;

        await userBuilding.save();
        res.json(userBuilding);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user-building association', error });
    }
});

// Delete a user-building association by ID
router.delete('/assoc/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const userBuilding = await UserBuildings.findByPk(id);
        if (!userBuilding) {
            return res.status(404).json({ message: 'User-building association not found' });
        }

        await userBuilding.destroy();
        res.json({ message: 'User-building association deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user-building association', error });
    }
});

// Route to handle CSV upload and create building
router.post('/upload', verifyToken, async (req, res) => {
    const { builds } = req.body;

    try {
        for (const build of builds) {
            const existingBuild = await Building.findOne({ where: { [Op.and]: [{ Name: build.name }, { Level: build.level }, { Unit: build.unit }] }} );
            if (!existingBuild) {
               await Building.create({ ...build});
            }
        }
        res.json({ message: 'Unit file uploaded successfully' });
    } catch (error) {
        console.error('Error uploading Unit File:', error);
        res.status(500).json({ message: 'Server error while uploading file' });
    }
});

module.exports = router;