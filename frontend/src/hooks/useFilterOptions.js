import { useState, useEffect } from 'react';
import { salesAPI } from '../services/api';

export const useFilterOptions = () => {
  const [options, setOptions] = useState({
    regions: [],
    states: [],
    cities: [],
    categories: [],
    subCategories: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await salesAPI.getFilterOptions();
        setOptions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { options, loading, error };
};
