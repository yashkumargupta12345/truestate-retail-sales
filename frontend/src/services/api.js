import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5500/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', config.method.toUpperCase(), config.url, config.params);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status, 'Data items:', response.data?.data?.length || 0);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('❌ Cannot connect to backend. Make sure server is running on', API_BASE_URL);
    } else if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const fetchFilterOptions = async () => {
  try {
    console.log('🔍 Fetching filter options...');
    const response = await api.get('/filter-options');
    console.log('✅ Filter options received:', Object.keys(response.data));
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching filter options:', error);
    throw error;
  }
};

export const fetchSalesData = async (params) => {
  try {
    // Clean up params - remove empty values
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    console.log('🔍 Fetching sales with params:', cleanParams);
    const response = await api.get('/sales', { params: cleanParams });
    console.log('✅ Sales data received:', {
      records: response.data?.data?.length || 0,
      page: response.data?.pagination?.page,
      totalPages: response.data?.pagination?.totalPages,
      total: response.data?.pagination?.total
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching sales data:', error);
    throw error;
  }
};

// Export salesAPI object for frontend hooks
export const salesAPI = {
  getFilterOptions: fetchFilterOptions,
  getSales: fetchSalesData
};

export default api;