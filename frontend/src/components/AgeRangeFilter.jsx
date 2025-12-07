import React, { useState } from 'react';
import { FiUser } from 'react-icons/fi';

const AgeRangeFilter = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value || '');
  const [error, setError] = useState('');

  const handleApply = () => {
    if (!localValue.trim()) {
      onChange('');
      setError('');
      return;
    }

    // Validate format: e.g., "25-35"
    const regex = /^(\d{1,3})-(\d{1,3})$/;
    const match = localValue.match(regex);

    if (!match) {
      setError('Please use format: min-max (e.g., 25-35)');
      return;
    }

    const min = parseInt(match[1], 10);
    const max = parseInt(match[2], 10);

    if (isNaN(min) || isNaN(max)) {
      setError('Please enter valid numbers');
      return;
    }

    if (min < 18) {
      setError('Minimum age must be 18 or higher');
      return;
    }

    if (max > 120) {
      setError('Maximum age must be 120 or lower');
      return;
    }

    if (min > max) {
      setError('Minimum age cannot be greater than maximum');
      return;
    }

    setError('');
    onChange(`${min}-${max}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    setError('');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Age Range
      </label>
      
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiUser className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., 25-35"
            className="block w-full pl-10 pr-24 py-2 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     focus:outline-none transition duration-200"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-1">
            <button
              onClick={handleApply}
              className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md 
                       hover:bg-primary-700 focus:outline-none focus:ring-2 
                       focus:ring-primary-500 focus:ring-offset-1"
            >
              Apply
            </button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {value && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Current: <span className="font-semibold">{value}</span>
            </span>
            <button
              onClick={handleClear}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>• Enter age range as min-max (e.g., 25-35)</p>
          <p>• Valid range: 18-120 years</p>
        </div>
      </div>
    </div>
  );
};

export default AgeRangeFilter;