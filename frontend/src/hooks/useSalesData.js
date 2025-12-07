import { useState, useEffect, useCallback } from 'react';
import { salesAPI } from '../services/api';

export const useSalesData = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    limit: 20,
  });

  const fetchSales = useCallback(async (queryParams) => {
    setLoading(true);
    setError(null);

    try {
      const cleanParams = Object.fromEntries(
        Object.entries(queryParams).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      );

      const result = await salesAPI.getSales(cleanParams);
      setData(result.data || []);
      setPagination(result.pagination || null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch sales data');
      setData([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1, // Reset to page 1 on filter change
    }));
  }, []);

  const resetFilters = useCallback(() => {
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
      limit: 20,
    });
  }, []);

  useEffect(() => {
    fetchSales(filters);
  }, [filters, fetchSales]);

  return {
    data,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch: () => fetchSales(filters),
  };
};
