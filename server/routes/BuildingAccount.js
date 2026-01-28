const express = require('express');
const router = express.Router();
const { BuildingAccount, Building, Transaction } = require("../models");
const { verifyToken } = require('../middleware/AuthMiddleware');

// Get all building accounts
router.get('/', verifyToken, async (req, res) => {
    try {
        const accounts = await BuildingAccount.findAll({
            include: [
                {
                    model: Building,
                    attributes: ['id', 'block', 'level', 'unit', 'area']
                }
            ]
        });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching building accounts', error: error.message });
    }
});

// Get account by ID with transactions
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const account = await BuildingAccount.findByPk(req.params.id, {
            include: [
                {
                    model: Building,
                    attributes: ['id', 'block', 'level', 'unit', 'area']
                },
                {
                    model: Transaction,
                    attributes: ['id', 'referenceNumber', 'description', 'amount', 'transactionDate', 'status']
                }
            ]
        });
        if (!account) {
            return res.status(404).json({ message: 'Building account not found' });
        }
        res.json(account);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching building account', error: error.message });
    }
});

// Create new building account
router.post('/', verifyToken, async (req, res) => {
    try {
        const { BuildingId, accountNumber, balance, status } = req.body;
        
        // Check if building exists
        const building = await Building.findByPk(BuildingId);
        if (!building) {
            return res.status(404).json({ message: 'Building not found' });
        }

        const account = await BuildingAccount.create({
            BuildingId,
            accountNumber,
            balance: balance || 0.00,
            status: status || 'active'
        });
        res.status(201).json(account);
    } catch (error) {
        res.status(500).json({ message: 'Error creating building account', error: error.message });
    }
});

// Update building account
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { balance, status } = req.body;
        const account = await BuildingAccount.findByPk(req.params.id);
        if (!account) {
            return res.status(404).json({ message: 'Building account not found' });
        }
        await account.update({ balance, status });
        res.json(account);
    } catch (error) {
        res.status(500).json({ message: 'Error updating building account', error: error.message });
    }
});

// Delete building account
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const account = await BuildingAccount.findByPk(req.params.id);
        if (!account) {
            return res.status(404).json({ message: 'Building account not found' });
        }
        await account.destroy();
        res.json({ message: 'Building account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting building account', error: error.message });
    }
});

module.exports = router;
