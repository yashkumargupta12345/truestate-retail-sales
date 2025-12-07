import React from 'react';

const SortingDropdown = ({ sortBy, sortOrder, onChange }) => {
  const sortOptions = [
    { value: 'Date', label: 'Date' },
    { value: 'Final Amount', label: 'Amount' },
    { value: 'Customer Name', label: 'Customer' },
    { value: 'Product Name', label: 'Product' },
    { value: 'Quantity', label: 'Quantity' },
    { value: 'Transaction ID', label: 'Transaction ID' }
  ];

  return (
    <div className="flex gap-2 items-center">
      <select
        value={sortBy}
        onChange={(e) => onChange(e.target.value, sortOrder)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      <button
        onClick={() => onChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
      >
        {sortOrder === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  );
};

export default SortingDropdown;