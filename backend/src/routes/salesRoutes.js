const express = require('express');
const router = express.Router();
const { getFilters, getSales } = require('../controllers/salesController');

// GET /api/filter-options
router.get('/filter-options', getFilters);

// GET /api/sales
router.get('/sales', getSales);

module.exports = router;