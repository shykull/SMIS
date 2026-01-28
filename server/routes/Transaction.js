const express = require('express');
const router = express.Router();
const { Transaction, BuildingAccount, TransactionType, Payment } = require("../models");
const { verifyToken } = require('../middleware/AuthMiddleware');
const { Op } = require('sequelize');

// Get all transactions with filters
router.get('/', verifyToken, async (req, res) => {
    try {
        const { BuildingAccountId, status, startDate, endDate } = req.query;
        let where = {};

        if (BuildingAccountId) where.BuildingAccountId = BuildingAccountId;
        if (status) where.status = status;
        if (startDate || endDate) {
            where.transactionDate = {};
            if (startDate) where.transactionDate[Op.gte] = new Date(startDate);
            if (endDate) where.transactionDate[Op.lte] = new Date(endDate);
        }

        const transactions = await Transaction.findAll({
            where,
            include: [
                {
                    model: BuildingAccount,
                    attributes: ['id', 'accountNumber', 'balance']
                },
                {
                    model: TransactionType,
                    attributes: ['id', 'name', 'category']
                },
                {
                    model: Payment,
                    attributes: ['id', 'amount', 'paymentDate', 'paymentMethod']
                }
            ],
            order: [['transactionDate', 'DESC']]
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
});

// Get transaction by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.id, {
            include: [
                {
                    model: BuildingAccount,
                    attributes: ['id', 'accountNumber', 'balance']
                },
                {
                    model: TransactionType,
                    attributes: ['id', 'name', 'category']
                },
                {
                    model: Payment,
                    attributes: ['id', 'amount', 'paymentDate', 'paymentMethod', 'receiptNumber']
                }
            ]
        });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transaction', error: error.message });
    }
});

// Create new transaction
router.post('/', verifyToken, async (req, res) => {
    try {
        const { BuildingAccountId, TransactionTypeId, referenceNumber, description, amount, transactionDate, dueDate, status, notes } = req.body;

        // Validate required fields
        if (!BuildingAccountId || !TransactionTypeId || !referenceNumber || !amount) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if building account exists
        const account = await BuildingAccount.findByPk(BuildingAccountId);
        if (!account) {
            return res.status(404).json({ message: 'Building account not found' });
        }

        // Check if transaction type exists
        const transType = await TransactionType.findByPk(TransactionTypeId);
        if (!transType) {
            return res.status(404).json({ message: 'Transaction type not found' });
        }

        const transaction = await Transaction.create({
            BuildingAccountId,
            TransactionTypeId,
            referenceNumber,
            description,
            amount,
            transactionDate: transactionDate || new Date(),
            dueDate,
            status: status || 'pending',
            notes
        });

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Error creating transaction', error: error.message });
    }
});

// Update transaction
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { description, amount, dueDate, status, notes } = req.body;
        const transaction = await Transaction.findByPk(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        await transaction.update({ description, amount, dueDate, status, notes });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Error updating transaction', error: error.message });
    }
});

// Delete transaction
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        await transaction.destroy();
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting transaction', error: error.message });
    }
});

module.exports = router;
