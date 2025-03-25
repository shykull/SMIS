const express = require('express');
const router = express.Router();
const { Vehicles, Users, Building, Settings } = require('../models');
const { verifyToken } = require('../middleware/AuthMiddleware');
const cookieParser = require('cookie-parser');
const { Op } = require('sequelize'); // Import Op from Sequelize

router.use(cookieParser()); // Enable cookie parsing



module.exports = router;