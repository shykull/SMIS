const express = require('express');
const router = express.Router();
const { Building, UserBuildings, Users, Permissions } = require("../models");
const cookieParser = require('cookie-parser');
const { verifyToken } = require('../middleware/AuthMiddleware');
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET; // Use a secure secret in production
const JWT_EXPIRY = process.env.JWT_EXPIRATION_TIME; // Set token expiry time

router.use(cookieParser()); // Enable cookie parsing

// Create a new building
router.post('/create', verifyToken, async (req, res) => {
    const { block, level, unit, area, shareUnit } = req.body;

    try {
        const building = await Building.create({ block, level, unit, area, shareUnit });
        res.json(building);
    } catch (error) {
        res.status(500).json({ message: 'Error creating building', error });
    }
});

// Get all buildings
router.get('/all', verifyToken, async (req, res) => {
    try {
        const buildings = await Building.findAll({
            include: [
                {
                    model: Users,
                    as: 'Users',
                    through: {
                        attributes: []
                    },
                    attributes: ['firstname', 'lastname', 'contact'],
                    include: [
                        {
                            model: Permissions,
                            attributes: ['owner', 'tenant']
                        }
                    ]
                }
            ]
        });
        res.json(buildings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching buildings', error });
    }
});

// Get a single building by ID
router.get('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const building = await Building.findByPk(id, {
            include: [
                {
                    model: Users,
                    as: 'Users',
                    through: {
                        attributes: []
                    },
                    attributes: ['firstname', 'lastname', 'contact'],
                    include: [
                        {
                            model: Permissions,
                            attributes: ['owner', 'tenant']
                        }
                    ]
                }
            ]
        });
        console.log('Building:', building);
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
    const { block, level, unit, area, shareUnit } = req.body;

    try {
        const building = await Building.findByPk(id);
        if (!building) {
            return res.status(404).json({ message: 'Building not found' });
        }

        building.block = block;
        building.level = level;
        building.unit = unit;
        building.area = area;
        building.shareUnit = shareUnit;

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

// Delete all user-building associations by BuildingId
router.delete('/assoc/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const userBuildings = await UserBuildings.findAll({ where: { BuildingId: id } });
        if (!userBuildings.length) {
            return res.status(404).json({ message: 'User-building associations not found' });
        }

        await UserBuildings.destroy({ where: { BuildingId: id } });
        res.json({ message: 'User-building associations deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user-building associations', error });
    }
});

// Route to handle CSV upload and create building
router.post('/upload', verifyToken, async (req, res) => {
    const { builds } = req.body;

    try {
        for (const build of builds) {
            const existingBuild = await Building.findOne({ where: { [Op.and]: [{ block: build.block }, { level: build.level }, { unit: build.unit }] }} );
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