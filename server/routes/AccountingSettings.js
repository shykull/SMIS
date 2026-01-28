const express = require('express');
const router = express.Router();
const { AccountingSettings } = require("../models");
const { verifyToken } = require('../middleware/AuthMiddleware');

// Get all accounting settings (usually only one record)
router.get('/', verifyToken, async (req, res) => {
    try {
        const settings = await AccountingSettings.findAll();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching accounting settings', error: error.message });
    }
});

// Get single settings record by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const setting = await AccountingSettings.findByPk(req.params.id);
        if (!setting) {
            return res.status(404).json({ message: 'Accounting settings not found' });
        }
        res.json(setting);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching accounting settings', error: error.message });
    }
});

// Create new accounting settings
router.post('/', verifyToken, async (req, res) => {
    try {
        const { lateInterestRate, managementRate, utilitiesRate, facilitiesBookingRate, waterRate, taxRate, lastUpdatedBy } = req.body;
        
        const setting = await AccountingSettings.create({
            lateInterestRate: lateInterestRate || 5.00,
            managementRate: managementRate || 0.00,
            utilitiesRate: utilitiesRate || 0.00,
            facilitiesBookingRate: facilitiesBookingRate || 0.00,
            waterRate: waterRate || 0.76,
            taxRate: taxRate || 0.00,
            lastUpdatedBy
        });
        res.status(201).json(setting);
    } catch (error) {
        res.status(500).json({ message: 'Error creating accounting settings', error: error.message });
    }
});

// Update accounting settings
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { lateInterestRate, managementRate, utilitiesRate, facilitiesBookingRate, waterRate, taxRate, lastUpdatedBy } = req.body;
        
        const setting = await AccountingSettings.findByPk(req.params.id);
        if (!setting) {
            return res.status(404).json({ message: 'Accounting settings not found' });
        }
        
        await setting.update({
            lateInterestRate: lateInterestRate !== undefined ? lateInterestRate : setting.lateInterestRate,
            managementRate: managementRate !== undefined ? managementRate : setting.managementRate,
            utilitiesRate: utilitiesRate !== undefined ? utilitiesRate : setting.utilitiesRate,
            facilitiesBookingRate: facilitiesBookingRate !== undefined ? facilitiesBookingRate : setting.facilitiesBookingRate,
            waterRate: waterRate !== undefined ? waterRate : setting.waterRate,
            taxRate: taxRate !== undefined ? taxRate : setting.taxRate,
            lastUpdatedBy: lastUpdatedBy || setting.lastUpdatedBy
        });
        
        res.json(setting);
    } catch (error) {
        res.status(500).json({ message: 'Error updating accounting settings', error: error.message });
    }
});

// Delete accounting settings
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const setting = await AccountingSettings.findByPk(req.params.id);
        if (!setting) {
            return res.status(404).json({ message: 'Accounting settings not found' });
        }
        await setting.destroy();
        res.json({ message: 'Accounting settings deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting accounting settings', error: error.message });
    }
});

module.exports = router;
