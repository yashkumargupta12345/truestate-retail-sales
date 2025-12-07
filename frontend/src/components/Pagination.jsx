import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  pageSize, 
  onPageChange, 
  hasNext, 
  hasPrev 
}) => {
  const validCurrentPage = parseInt(currentPage) || 1;
  const validTotalPages = parseInt(totalPages) || 1;
  const validTotalItems = parseInt(totalItems) || 0;
  const validPageSize = parseInt(pageSize) || 20;
  
  const startItem = ((validCurrentPage - 1) * validPageSize) + 1;
  const endItem = Math.min(validCurrentPage * validPageSize, validTotalItems);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(validCurrentPage - 1)}
          disabled={!hasPrev || validCurrentPage === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(validCurrentPage + 1)}
          disabled={!hasNext || validCurrentPage === validTotalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{validTotalItems.toLocaleString()}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(validCurrentPage - 1)}
              disabled={!hasPrev || validCurrentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              ‹
            </button>
            
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">
              {validCurrentPage} / {validTotalPages}
            </span>

            <button
              onClick={() => onPageChange(validCurrentPage + 1)}
              disabled={!hasNext || validCurrentPage === validTotalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              ›
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;