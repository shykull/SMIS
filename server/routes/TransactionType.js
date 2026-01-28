const express = require('express');
const router = express.Router();
const { TransactionType, Transaction } = require("../models");
const { verifyToken } = require('../middleware/AuthMiddleware');

// Get all transaction types
router.get('/', verifyToken, async (req, res) => {
    try {
        const types = await TransactionType.findAll();
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transaction types', error: error.message });
    }
});

// Get transaction type by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const type = await TransactionType.findByPk(req.params.id, {
            include: [
                {
                    model: Transaction,
                    attributes: ['id', 'referenceNumber', 'description', 'amount', 'transactionDate', 'status']
                }
            ]
        });
        if (!type) {
            return res.status(404).json({ message: 'Transaction type not found' });
        }
        res.json(type);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transaction type', error: error.message });
    }
});

// Create new transaction type
router.post('/', verifyToken, async (req, res) => {
    try {
        const { name, description, category } = req.body;
        
        if (!name || !category) {
            return res.status(400).json({ message: 'Name and category are required' });
        }

        const type = await TransactionType.create({
            name,
            description,
            category
        });
        res.status(201).json(type);
    } catch (error) {
        res.status(500).json({ message: 'Error creating transaction type', error: error.message });
    }
});

// Update transaction type
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { name, description, category } = req.body;
        const type = await TransactionType.findByPk(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Transaction type not found' });
        }
        await type.update({ name, description, category });
        res.json(type);
    } catch (error) {
        res.status(500).json({ message: 'Error updating transaction type', error: error.message });
    }
});

// Delete transaction type
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const type = await TransactionType.findByPk(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Transaction type not found' });
        }
        await type.destroy();
        res.json({ message: 'Transaction type deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting transaction type', error: error.message });
    }
});

module.exports = router;
