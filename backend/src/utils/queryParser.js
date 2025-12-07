
function parseSalesQuery(queryParams) {
  const {
    search = '',
    regions = '',
    genders = '',
    categories = '',
    tags = '',
    paymentMethods = '',
    ageMin = null,
    ageMax = null,
    dateFrom = null,
    dateTo = null,
    sortBy = 'Date',
    sortOrder = 'desc',
    page = 1,
    limit = 20
  } = queryParams;

  // Helper to parse comma-separated values
  const parseArray = (str) => {
    if (!str) return [];
    return str.split(',').map(item => item.trim()).filter(Boolean);
  };

  return {
    search: search.trim(),
    regions: parseArray(regions),
    genders: parseArray(genders),
    categories: parseArray(categories),
    tags: parseArray(tags),
    paymentMethods: parseArray(paymentMethods),
    ageMin: ageMin ? parseInt(ageMin) : null,
    ageMax: ageMax ? parseInt(ageMax) : null,
    dateFrom: dateFrom || null,
    dateTo: dateTo || null,
    sortBy: sortBy || 'Date',
    sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
    page: Math.max(1, parseInt(page) || 1),
    pageSize: Math.min(100, Math.max(1, parseInt(limit) || 20))
  };
}

module.exports = { parseSalesQuery };