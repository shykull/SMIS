const express = require('express');
const router = express.Router();
const { Payment, Transaction, BuildingAccount } = require("../models");
const { verifyToken } = require('../middleware/AuthMiddleware');
const { Op } = require('sequelize');

// Get all payments with filters
router.get('/', verifyToken, async (req, res) => {
    try {
        const { TransactionId, paymentMethod, startDate, endDate } = req.query;
        let where = {};

        if (TransactionId) where.TransactionId = TransactionId;
        if (paymentMethod) where.paymentMethod = paymentMethod;
        if (startDate || endDate) {
            where.paymentDate = {};
            if (startDate) where.paymentDate[Op.gte] = new Date(startDate);
            if (endDate) where.paymentDate[Op.lte] = new Date(endDate);
        }

        const payments = await Payment.findAll({
            where,
            include: [
                {
                    model: Transaction,
                    attributes: ['id', 'referenceNumber', 'description', 'amount', 'status'],
                    include: [
                        {
                            model: BuildingAccount,
                            attributes: ['id', 'accountNumber']
                        }
                    ]
                }
            ],
            order: [['paymentDate', 'DESC']]
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments', error: error.message });
    }
});

// Get payment by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id, {
            include: [
                {
                    model: Transaction,
                    attributes: ['id', 'referenceNumber', 'description', 'amount', 'status'],
                    include: [
                        {
                            model: BuildingAccount,
                            attributes: ['id', 'accountNumber', 'balance']
                        }
                    ]
                }
            ]
        });
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment', error: error.message });
    }
});

// Create new payment
router.post('/', verifyToken, async (req, res) => {
    try {
        const { TransactionId, paymentMethod, amount, paymentDate, referenceNumber, receiptNumber, notes } = req.body;

        // Validate required fields
        if (!TransactionId || !paymentMethod || !amount) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if transaction exists
        const transaction = await Transaction.findByPk(TransactionId);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const payment = await Payment.create({
            TransactionId,
            paymentMethod,
            amount,
            paymentDate: paymentDate || new Date(),
            referenceNumber,
            receiptNumber,
            notes
        });

        // Update transaction status to completed if fully paid
        const totalPayments = await Payment.sum('amount', { where: { TransactionId } });
        if (totalPayments >= transaction.amount) {
            await transaction.update({ status: 'completed' });
            
            // Update building account balance
            const account = await BuildingAccount.findByPk(transaction.BuildingAccountId);
            if (account) {
                const newBalance = parseFloat(account.balance) + parseFloat(transaction.amount);
                await account.update({ balance: newBalance });
            }
        }

        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Error creating payment', error: error.message });
    }
});

// Update payment
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { paymentMethod, amount, paymentDate, referenceNumber, receiptNumber, notes } = req.body;
        const payment = await Payment.findByPk(req.params.id);
        
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        await payment.update({ paymentMethod, amount, paymentDate, referenceNumber, receiptNumber, notes });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Error updating payment', error: error.message });
    }
});

// Delete payment
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        const TransactionId = payment.TransactionId;
        await payment.destroy();

        // Recalculate transaction status
        const transaction = await Transaction.findByPk(TransactionId);
        if (transaction) {
            const totalPayments = await Payment.sum('amount', { where: { TransactionId } });
            const newStatus = (totalPayments || 0) >= transaction.amount ? 'completed' : 'pending';
            await transaction.update({ status: newStatus });
        }

        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting payment', error: error.message });
    }
});

module.exports = router;
