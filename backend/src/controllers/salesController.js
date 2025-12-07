const { getFilterOptions, getSalesData } = require('../services/salesService');

/**
 * GET /api/filter-options
 * Returns all available filter options
 */
const getFilters = async (req, res) => {
  try {
    console.log('📥 Request: GET /api/filter-options');
    const filters = await getFilterOptions();
    res.json(filters);
  } catch (error) {
    console.error('❌ Error getting filter options:', error);
    res.status(500).json({ 
      error: 'Failed to load filter options',
      message: error.message 
    });
  }
};

/**
 * GET /api/sales
 * Returns paginated and filtered sales data
 */
const getSales = async (req, res) => {
  try {
    console.log('📥 Request: GET /api/sales', req.query);
    const result = await getSalesData(req.query);
    res.json(result);
  } catch (error) {
    console.error('❌ Error getting sales data:', error);
    res.status(500).json({ 
      error: 'Failed to load sales data',
      message: error.message 
    });
  }
};

module.exports = {
  getFilters,
  getSales
};