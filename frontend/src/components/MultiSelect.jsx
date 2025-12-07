import React from 'react';
import Select from 'react-select';

const MultiSelect = ({ options, selected, onChange, placeholder, isSearchable = false }) => {
  const handleChange = (selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    onChange(values);
  };

  const selectedOptions = options.filter(option => selected.includes(option.value));

  const customStyles = {
    control: (base) => ({
      ...base,
      borderColor: '#d1d5db',
      '&:hover': {
        borderColor: '#9ca3af'
      },
      boxShadow: 'none',
      minHeight: '40px'
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#dbeafe',
      borderRadius: '6px'
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#1e40af',
      fontWeight: '500'
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#1e40af',
      '&:hover': {
        backgroundColor: '#93c5fd',
        color: '#1e3a8a'
      }
    })
  };

  return (
    <Select
      isMulti
      options={options}
      value={selectedOptions}
      onChange={handleChange}
      placeholder={placeholder}
      isSearchable={isSearchable}
      styles={customStyles}
      className="react-select-container"
      classNamePrefix="react-select"
    />
  );
};

export default MultiSelect;