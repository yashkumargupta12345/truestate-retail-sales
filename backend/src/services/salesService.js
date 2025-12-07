// const fs = require('fs');
// const path = require('path');
// const { parseSalesQuery } = require('../utils/queryParser');

// const DATA_PATH = path.join(__dirname, '../../data/sales.json');

// let cachedFilterOptions = null;
// let cachedSalesData = null;

// /**
//  * Load all sales data into cache (runs once on first request)
//  */
// async function loadSalesDataCache() {
//   if (cachedSalesData) {
//     console.log('✓ Returning cached sales data');
//     return cachedSalesData;
//   }

//   console.log('📂 Loading sales data into cache...');
  
//   if (!fs.existsSync(DATA_PATH)) {
//     throw new Error(`Data file not found: ${DATA_PATH}`);
//   }

//   const data = [];

//   await streamJSONArray((record) => {
//     data.push(record);
//   });

//   cachedSalesData = data;
//   console.log(`✓ Cached ${cachedSalesData.length} sales records`);
//   return cachedSalesData;
// }

// /**
//  * Stream and parse large JSON array
//  */
// async function streamJSONArray(callback) {
//   return new Promise((resolve, reject) => {
//     if (!fs.existsSync(DATA_PATH)) {
//       reject(new Error(`Data file not found: ${DATA_PATH}`));
//       return;
//     }

//     const stream = fs.createReadStream(DATA_PATH, { encoding: 'utf8' });
//     let buffer = '';
//     let inArray = false;
//     let bracketCount = 0;
//     let recordCount = 0;

//     stream.on('data', (chunk) => {
//       buffer += chunk;
      
//       while (buffer.length > 0) {
//         if (!inArray) {
//           const arrayStart = buffer.indexOf('[');
//           if (arrayStart === -1) break;
//           buffer = buffer.slice(arrayStart + 1);
//           inArray = true;
//         }

//         const objStart = buffer.indexOf('{');
//         if (objStart === -1) break;

//         let objEnd = -1;
//         bracketCount = 0;
//         let inString = false;
//         let escape = false;

//         for (let i = objStart; i < buffer.length; i++) {
//           const char = buffer[i];
          
//           if (escape) {
//             escape = false;
//             continue;
//           }
          
//           if (char === '\\') {
//             escape = true;
//             continue;
//           }
          
//           if (char === '"') {
//             inString = !inString;
//             continue;
//           }
          
//           if (!inString) {
//             if (char === '{') bracketCount++;
//             if (char === '}') bracketCount--;
            
//             if (bracketCount === 0) {
//               objEnd = i;
//               break;
//             }
//           }
//         }

//         if (objEnd === -1) break;

//         const jsonStr = buffer.slice(objStart, objEnd + 1);
//         buffer = buffer.slice(objEnd + 1);

//         try {
//           const record = JSON.parse(jsonStr);
//           callback(record);
//           recordCount++;
          
//           if (recordCount % 50000 === 0) {
//             console.log(`  📊 Processed ${recordCount} records...`);
//           }
//         } catch (e) {
//           console.error('❌ Parse error:', e.message);
//         }
//       }
//     });

//     stream.on('end', () => {
//       console.log(`✓ Processed ${recordCount} total records`);
//       resolve(recordCount);
//     });

//     stream.on('error', reject);
//   });
// }

// /**
//  * Get filter options by streaming through data
//  */
// async function getFilterOptions() {
//   if (cachedFilterOptions) {
//     console.log('✓ Returning cached filter options');
//     return cachedFilterOptions;
//   }

//   console.log('📂 Loading filter options...');
  
//   const regions = new Set();
//   const genders = new Set();
//   const categories = new Set();
//   const tags = new Set();
//   const paymentMethods = new Set();
//   let minAge = Infinity;
//   let maxAge = -Infinity;
//   let minDate = null;
//   let maxDate = null;

//   await streamJSONArray((record) => {
//     if (record['Customer Region']) regions.add(record['Customer Region']);
//     if (record['Gender']) genders.add(record['Gender']);
//     if (record['Product Category']) categories.add(record['Product Category']);
    
//     if (record.Tags) {
//       record.Tags.split(',').forEach(tag => {
//         const trimmed = tag.trim();
//         if (trimmed) tags.add(trimmed);
//       });
//     }
    
//     if (record['Payment Method']) paymentMethods.add(record['Payment Method']);
    
//     const age = parseInt(record['Age']);
//     if (!isNaN(age)) {
//       minAge = Math.min(minAge, age);
//       maxAge = Math.max(maxAge, age);
//     }
    
//     if (record['Date']) {
//       const date = new Date(record['Date']);
//       if (!isNaN(date.getTime())) {
//         if (!minDate || date < minDate) minDate = date;
//         if (!maxDate || date > maxDate) maxDate = date;
//       }
//     }
//   });

//   cachedFilterOptions = {
//     regions: Array.from(regions).sort(),
//     genders: Array.from(genders).sort(),
//     categories: Array.from(categories).sort(),
//     tags: Array.from(tags).sort(),
//     paymentMethods: Array.from(paymentMethods).sort(),
//     ageRange: {
//       min: minAge === Infinity ? 0 : minAge,
//       max: maxAge === -Infinity ? 100 : maxAge
//     },
//     dateRange: {
//       min: minDate ? minDate.toISOString().split('T')[0] : null,
//       max: maxDate ? maxDate.toISOString().split('T')[0] : null
//     }
//   };

//   console.log('✓ Filter options loaded');
//   return cachedFilterOptions;
// }

// /**
//  * Get sales data with filtering, sorting, and pagination
//  */
// async function getSalesData(queryParams) {
//   const query = parseSalesQuery(queryParams);
  
//   console.log(`📊 Fetching sales - Page: ${query.page}, Search: "${query.search}"`);

//   const pick = (record, ...keys) => {
//     for (const key of keys) {
//       if (record[key] !== undefined && record[key] !== null) return record[key];
//     }
//     return undefined;
//   };

//   const allData = await loadSalesDataCache();
//   const searchLower = query.search.toLowerCase();

//   // Filter data
//   const results = allData.filter((record) => {
//     // Search
//     if (query.search) {
//       const customerName = (pick(record, 'Customer Name', 'customerName', 'customer_name') || '').toLowerCase();
//       const phoneNumber = (pick(record, 'Phone Number', 'phoneNumber', 'phone_number', 'contact') || '').toString();
      
//       if (!customerName.includes(searchLower) && !phoneNumber.includes(query.search)) {
//         return false;
//       }
//     }

//     // Region filter
//     if (query.regions.length > 0) {
//       const region = pick(record, 'Customer Region', 'customerRegion', 'customer_region', 'region');
//       if (!region || !query.regions.includes(region)) return false;
//     }

//     // Gender filter
//     if (query.genders.length > 0) {
//       const gender = pick(record, 'Gender', 'gender');
//       if (!gender || !query.genders.includes(gender)) return false;
//     }

//     // Category filter
//     if (query.categories.length > 0) {
//       const category = pick(record, 'Product Category', 'productCategory', 'product_category', 'category');
//       if (!category || !query.categories.includes(category)) return false;
//     }

//     // Tags filter
//     if (query.tags.length > 0) {
//       const recordTags = (pick(record, 'Tags', 'tags') || '').split(',').map(t => t.trim()).filter(Boolean);
//       const hasMatchingTag = query.tags.some(tag => recordTags.includes(tag));
//       if (!hasMatchingTag) return false;
//     }

//     // Payment method filter
//     if (query.paymentMethods.length > 0) {
//       const paymentMethod = pick(record, 'Payment Method', 'paymentMethod', 'payment_method');
//       if (!paymentMethod || !query.paymentMethods.includes(paymentMethod)) return false;
//     }

//     // Age range filter
//     if (query.ageMin !== null || query.ageMax !== null) {
//       const age = parseInt(pick(record, 'Age', 'age')) || 0;
//       if (query.ageMin !== null && age < query.ageMin) return false;
//       if (query.ageMax !== null && age > query.ageMax) return false;
//     }

//     // Date range filter
//     if (query.dateFrom || query.dateTo) {
//       const dateStr = pick(record, 'Date', 'date');
//       if (!dateStr) return false;
      
//       const recordDate = new Date(dateStr);
//       if (isNaN(recordDate.getTime())) return false;
      
//       if (query.dateFrom) {
//         const fromDate = new Date(query.dateFrom);
//         if (recordDate < fromDate) return false;
//       }
//       if (query.dateTo) {
//         const toDate = new Date(query.dateTo);
//         toDate.setHours(23, 59, 59, 999); // End of day
//         if (recordDate > toDate) return false;
//       }
//     }

//     return true;
//   });

//   // Sorting
//   results.sort((a, b) => {
//     let aVal = pick(a, query.sortBy, query.sortBy.replace(/\s+/g, ''), 
//                     query.sortBy.toLowerCase().replace(/\s+/g, '_'));
//     let bVal = pick(b, query.sortBy, query.sortBy.replace(/\s+/g, ''), 
//                     query.sortBy.toLowerCase().replace(/\s+/g, '_'));
    
//     // Numeric fields
//     const numericFields = ['Age', 'age', 'Quantity', 'quantity', 'Price per Unit', 'pricePerUnit', 'price_per_unit', 
//                           'Total Amount', 'totalAmount', 'total_amount', 'Final Amount', 'finalAmount', 'final_amount'];
//     if (numericFields.includes(query.sortBy)) {
//       aVal = parseFloat(aVal) || 0;
//       bVal = parseFloat(bVal) || 0;
//     }
    
//     // Date fields
//     if (['Date', 'date'].includes(query.sortBy)) {
//       aVal = new Date(aVal).getTime() || 0;
//       bVal = new Date(bVal).getTime() || 0;
//     }
    
//     // String comparison
//     if (typeof aVal === 'string' && typeof bVal === 'string') {
//       return query.sortOrder === 'asc' 
//         ? aVal.localeCompare(bVal) 
//         : bVal.localeCompare(aVal);
//     }
    
//     // Numeric comparison
//     if (query.sortOrder === 'asc') {
//       return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
//     } else {
//       return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
//     }
//   });

//   // Pagination
//   const startIndex = (query.page - 1) * query.pageSize;
//   const endIndex = startIndex + query.pageSize;
//   const paginatedResults = results.slice(startIndex, endIndex);

//   // Transform data
//   const transformedData = paginatedResults.map(record => ({
//     id: pick(record, 'Transaction ID', 'transactionId', 'transaction_id'),
//     transactionId: pick(record, 'Transaction ID', 'transactionId', 'transaction_id'),
//     date: pick(record, 'Date', 'date'),
//     customerId: pick(record, 'Customer ID', 'customerId', 'customer_id', 'customer'),
//     customerName: pick(record, 'Customer Name', 'customerName', 'customer_name', 'name'),
//     phoneNumber: pick(record, 'Phone Number', 'phoneNumber', 'phone_number', 'contact'),
//     gender: pick(record, 'Gender', 'gender'),
//     age: parseInt(pick(record, 'Age', 'age')) || 0,
//     region: pick(record, 'Customer Region', 'customerRegion', 'customer_region', 'region'),
//     customerType: pick(record, 'Customer Type', 'customerType', 'customer_type', 'type'),
//     productId: pick(record, 'Product ID', 'productId', 'product_id'),
//     productName: pick(record, 'Product Name', 'productName', 'product_name'),
//     brand: pick(record, 'Brand', 'brand'),
//     category: pick(record, 'Product Category', 'productCategory', 'product_category', 'category'),
//     tags: pick(record, 'Tags', 'tags') || '',
//     quantity: parseInt(pick(record, 'Quantity', 'quantity')) || 0,
//     pricePerUnit: parseFloat(pick(record, 'Price per Unit', 'pricePerUnit', 'price_per_unit')) || 0,
//     discountPercentage: parseFloat(pick(record, 'Discount Percentage', 'discountPercentage', 'discount_percentage')) || 0,
//     totalAmount: parseFloat(pick(record, 'Total Amount', 'totalAmount', 'total_amount')) || 0,
//     finalAmount: parseFloat(pick(record, 'Final Amount', 'finalAmount', 'final_amount')) || 0,
//     paymentMethod: pick(record, 'Payment Method', 'paymentMethod', 'payment_method'),
//     orderStatus: pick(record, 'Order Status', 'orderStatus', 'order_status'),
//     deliveryType: pick(record, 'Delivery Type', 'deliveryType', 'delivery_type'),
//     storeId: pick(record, 'Store ID', 'storeId', 'store_id'),
//     storeLocation: pick(record, 'Store Location', 'storeLocation', 'store_location', 'location'),
//     salespersonId: pick(record, 'Salesperson ID', 'salespersonId', 'salesperson_id', 'employeeId', 'employee_id'),
//     employeeName: pick(record, 'Employee Name', 'employeeName', 'employee_name')
//   }));

//   return {
//     data: transformedData,
//     pagination: {
//       page: query.page,
//       pageSize: query.pageSize,
//       total: results.length,
//       totalPages: Math.ceil(results.length / query.pageSize) || 1,
//       hasNext: endIndex < results.length,
//       hasPrev: query.page > 1
//     }
//   };
// }

// module.exports = {
//   getFilterOptions,
//   getSalesData,
//   streamJSONArray,
//   loadSalesDataCache
// };
















const { loadSalesData } = require("../utils/csvLoader");

let cachedData = null;

/**
 * Ensures data is loaded and cached in memory
 */
async function getData() {
  if (!cachedData) {
    console.log("📄 Loading data into memory...");
    cachedData = await loadSalesData();
    console.log(`✔ Loaded ${cachedData.length} records`);
  }
  return cachedData;
}

/**
 * Get filter options
 */
async function getFilterOptions() {
  const data = await getData();

  return {
    customerRegions: [...new Set(data.map(item => item["Customer Region"]))],
    genders: [...new Set(data.map(item => item["Gender"]))],
    productCategories: [...new Set(data.map(item => item["Product Category"]))],
    paymentMethods: [...new Set(data.map(item => item["Payment Method"]))],
    tags: [...new Set(data.flatMap(item => item["Tags"]?.split("|") || []))]
  };
}

/**
 * Get filtered/paginated sales
 */
async function getSalesData(query) {
  const {
    page = 1,
    limit = 20,
    sortBy = "Date",
    sortOrder = "desc"
  } = query;

  const data = await getData();

  // Sort
  const sorted = data.sort((a, b) => {
    if (sortOrder === "asc") return (a[sortBy] > b[sortBy] ? 1 : -1);
    return (a[sortBy] < b[sortBy] ? 1 : -1);
  });

  // Pagination
  const start = (page - 1) * limit;
  const results = sorted.slice(start, start + Number(limit));

  return {
    total: data.length,
    page: Number(page),
    limit: Number(limit),
    results
  };
}

module.exports = {
  getFilterOptions,
  getSalesData
};
