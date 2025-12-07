import React, { useState } from 'react';
import { FiCalendar, FiX } from 'react-icons/fi';
import { format, subDays, startOfMonth, endOfMonth, isValid, parseISO } from 'date-fns';

const DateRangeFilter = ({ value, onChange }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const handleApply = () => {
    if (!startDate && !endDate) {
      onChange('');
      setError('');
      return;
    }

    // Validate at least one date is provided
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!isValid(start) || !isValid(end)) {
      setError('Please enter valid dates');
      return;
    }

    if (start > end) {
      setError('Start date cannot be after end date');
      return;
    }

    // Validate reasonable date range (e.g., not before 2000)
    const minDate = new Date('2000-01-01');
    if (start < minDate) {
      setError('Start date cannot be before 2000');
      return;
    }

    // Validate end date is not in the future
    const today = new Date();
    if (end > today) {
      setError('End date cannot be in the future');
      return;
    }

    setError('');
    const formattedStart = format(start, 'yyyy-MM-dd');
    const formattedEnd = format(end, 'yyyy-MM-dd');
    onChange(`${formattedStart}-${formattedEnd}`);
  };

  const handleQuickSelect = (rangeType) => {
    const today = new Date();
    let start, end;

    switch (rangeType) {
      case 'last7Days':
        start = subDays(today, 7);
        end = today;
        break;
      case 'last30Days':
        start = subDays(today, 30);
        end = today;
        break;
      case 'thisMonth':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      default:
        return;
    }

    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
    setError('');

    // Auto-apply after quick select
    setTimeout(() => {
      const formattedStart = format(start, 'yyyy-MM-dd');
      const formattedEnd = format(end, 'yyyy-MM-dd');
      onChange(`${formattedStart}-${formattedEnd}`);
    }, 100);
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    onChange('');
    setError('');
  };

  // Parse current value if it exists
  React.useEffect(() => {
    if (value) {
      const [start, end] = value.split('-');
      setStartDate(start);
      setEndDate(end);
    }
  }, [value]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Date Range
      </label>

      <div className="space-y-4">
        {/* Quick Select Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleQuickSelect('last7Days')}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg 
                     hover:bg-gray-200 focus:outline-none focus:ring-2 
                     focus:ring-primary-500"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handleQuickSelect('last30Days')}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg 
                     hover:bg-gray-200 focus:outline-none focus:ring-2 
                     focus:ring-primary-500"
          >
            Last 30 Days
          </button>
          <button
            onClick={() => handleQuickSelect('thisMonth')}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg 
                     hover:bg-gray-200 focus:outline-none focus:ring-2 
                     focus:ring-primary-500"
          >
            This Month
          </button>
          <button
            onClick={() => handleQuickSelect('lastMonth')}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg 
                     hover:bg-gray-200 focus:outline-none focus:ring-2 
                     focus:ring-primary-500"
          >
            Last Month
          </button>
        </div>

        {/* Custom Date Inputs */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           focus:outline-none transition duration-200"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           focus:outline-none transition duration-200"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg 
                       hover:bg-primary-700 focus:outline-none focus:ring-2 
                       focus:ring-primary-500 focus:ring-offset-1"
            >
              Apply Date Range
            </button>
            
            {(value || startDate || endDate) && (
              <button
                onClick={handleClear}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-4 w-4 mr-1" />
                Clear
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {value && (
          <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
            <span className="font-medium">Active range:</span>{' '}
            {value.split('-').join(' to ')}
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>• Select dates manually or use quick filters</p>
          <p>• Date range cannot extend into the future</p>
          <p>• Format: YYYY-MM-DD</p>
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilter;