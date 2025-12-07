import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import SearchBar from '../components/SearchBar.jsx';
import FilterPanel from '../components/FilterPanel.jsx';
import TransactionTable from '../components/TransactionTable.jsx';
import SortingDropdown from '../components/SortingDropdown.jsx';
import Pagination from '../components/Pagination.jsx';
import { fetchFilterOptions, fetchSalesData } from '../services/api';

const Dashboard = () => {
  const [filters, setFilters] = useState({
    search: '',
    region: '',
    state: '',
    city: '',
    category: '',
    subCategory: '',
    minPrice: '',
    maxPrice: '',
    minQuantity: '',
    maxQuantity: '',
    sortBy: 'Date',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  });

  const [data, setData] = useState({
    sales: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });

  const [filterOptions, setFilterOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Debounced search
  const debouncedFetchData = useCallback(
    debounce(async (filters) => {
      try {
        setLoading(true);
        setError(null);
        
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
        );
        
        console.log('Fetching data with filters:', cleanFilters);
        const result = await fetchSalesData(cleanFilters);
        
        setData({
          sales: result.data || [],
          total: result.pagination?.total || 0,
          page: result.pagination?.page || 1,
          limit: result.pagination?.limit || 20,
          totalPages: result.pagination?.totalPages || 0,
          hasNext: result.pagination?.hasNext || false,
          hasPrev: result.pagination?.hasPrev || false
        });
        
        setInitialLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        if (err.code === 'ECONNABORTED') {
          setError('Request timed out. The server may still be loading data. Please wait and try again in 30 seconds.');
        } else {
          setError(err.response?.data?.error || 'Failed to fetch data. Please try again.');
        }
        setData({
          sales: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        });
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Fetch data when filters change
  useEffect(() => {
    debouncedFetchData(filters);
  }, [filters, debouncedFetchData]);

  const handleFilterChange = (key, value) => {
    console.log('Filter changed:', key, value);
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  const handleSortChange = (sortBy, sortOrder) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      region: '',
      state: '',
      city: '',
      category: '',
      subCategory: '',
      minPrice: '',
      maxPrice: '',
      minQuantity: '',
      maxQuantity: '',
      sortBy: 'Date',
      sortOrder: 'desc',
      page: 1,
      limit: 20
    });
  };

  const loadFilterOptions = async () => {
    try {
      const options = await fetchFilterOptions();
      setFilterOptions(options);
    } catch (err) {
      console.error('Failed to load filter options:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Server is loading data. Please wait 30-60 seconds and refresh the page.');
      }
    }
  };

  // Calculate totals from actual data
  const totalAmount = data.sales.reduce((sum, item) => {
    const amount = parseFloat(item.finalAmount || item.totalAmount || 0);
    return sum + amount;
  }, 0);

  const avgAmount = data.sales.length > 0 ? totalAmount / data.sales.length : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage and analyze your sales transactions</p>
      </header>

      {initialLoading && loading ? (
        <div className="flex flex-col justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-xl text-gray-600 mb-2">Loading sales data...</p>
          <p className="text-sm text-gray-500">First load may take 30-60 seconds</p>
          <p className="text-xs text-gray-400 mt-2">Processing 1 million records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar - Filters */}
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              options={filterOptions}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Sort Controls */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="w-full sm:w-2/3">
                  <SearchBar 
                    value={filters.search} 
                    onChange={handleSearch}
                    placeholder="Search by customer name or phone number..."
                  />
                </div>
                <div className="w-full sm:w-1/3">
                  <SortingDropdown
                    sortBy={filters.sortBy}
                    sortOrder={filters.sortOrder}
                    onChange={handleSortChange}
                  />
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading transactions...</p>
              </div>
            )}

            {/* Transaction Table */}
            {!loading && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Transactions
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({data.total} total)
                    </span>
                  </h2>
                </div>
                <TransactionTable data={data.sales} />
              </div>
            )}

            {/* Pagination */}
            {!loading && data.sales.length > 0 && (
              <Pagination
                currentPage={data.page}
                totalPages={data.totalPages}
                onPageChange={handlePageChange}
                hasNext={data.hasNext}
                hasPrev={data.hasPrev}
              />
            )}

            {/* Summary Stats */}
            {!loading && data.sales.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Records</h3>
                  <p className="text-2xl font-bold text-gray-900">{data.total}</p>
                  <p className="text-xs text-gray-500 mt-1">Across all pages</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-sm font-medium text-gray-500">Page Total</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Current page total</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-sm font-medium text-gray-500">Avg. Transaction</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{avgAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Per transaction</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;