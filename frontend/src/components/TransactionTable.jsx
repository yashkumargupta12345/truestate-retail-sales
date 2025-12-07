import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiDollarSign, FiPackage } from 'react-icons/fi';

const TransactionTable = ({ data }) => {
  const [expandedRows, setExpandedRows] = useState([]);

  const toggleRow = (id) => {
    setExpandedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '₹0.00';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(num);
  };

  const safeFormatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const [year, month, day] = dateString.split('-');
      return `${day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(month)-1]} ${year}`;
    } catch {
      return dateString;
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
        <p className="text-gray-600">Try adjusting your filters or search criteria</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Transaction ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone Number
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Gender
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Age
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Amount
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer Region
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Employee Name
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((transaction, index) => (
            <React.Fragment key={transaction.transactionId || transaction.id || `transaction-${index}`}>
              <tr className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleRow(transaction.transactionId || transaction.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedRows.includes(transaction.transactionId || transaction.id) ? (
                      <FiChevronUp className="h-5 w-5" />
                    ) : (
                      <FiChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {transaction.transactionId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {safeFormatDate(transaction.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.customerId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {transaction.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.phoneNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.gender}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.age}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.productId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{transaction.category}</div>
                  <div className="text-xs text-gray-500">{transaction.productName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(transaction.finalAmount || transaction.totalAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.region}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.employeeName}
                </td>
              </tr>
              
              {/* Expanded Row */}
              {expandedRows.includes(transaction.transactionId || transaction.id) && (
                <tr>
                  <td colSpan={14} className="px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">Customer Details</div>
                        <div className="text-sm font-medium">{transaction.customerName}</div>
                        <div className="text-sm text-gray-600">{transaction.phoneNumber}</div>
                        <div className="text-sm text-gray-600">
                          {transaction.gender}, {transaction.age} years
                        </div>
                        <div className="text-sm text-gray-600">{transaction.customerType}</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">Product Details</div>
                        <div className="text-sm font-medium">{transaction.productName}</div>
                        <div className="text-sm text-gray-600">Brand: {transaction.brand}</div>
                        <div className="text-sm text-gray-600">Category: {transaction.category}</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">Transaction Details</div>
                        <div className="flex items-center text-sm">
                          <FiPackage className="h-4 w-4 mr-2 text-gray-400" />
                          Qty: {transaction.quantity}
                        </div>
                        <div className="flex items-center text-sm">
                          <FiDollarSign className="h-4 w-4 mr-2 text-gray-400" />
                          {formatCurrency(transaction.finalAmount)}
                        </div>
                        <div className="text-sm">{transaction.paymentMethod}</div>
                        <div className="text-sm">Status: {transaction.orderStatus}</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">Tags</div>
                        <div className="flex flex-wrap gap-1">
                          {transaction.tags ? (
                            transaction.tags.split(',').map((tag, idx) => (
                              <span
                                key={`${transaction.transactionId}-tag-${idx}`}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag.trim()}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No tags</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;