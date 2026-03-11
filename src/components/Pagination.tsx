import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 mt-6 sm:mt-8 mb-6 sm:mb-8">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1 || loading}
        className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-base border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        上一页
      </button>

      <div className="flex gap-1">
        {getPageNumbers().map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span className="px-1 sm:px-3 py-1.5 sm:py-2 text-gray-600">...</span>
            ) : (
              <button
                onClick={() => handlePageClick(page as number)}
                disabled={loading}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-base rounded transition-colors ${
                  page === currentPage
                    ? 'bg-blue-500 text-white'
                    : 'border border-gray-300 hover:bg-gray-50 disabled:opacity-50'
                }`}
              >
                {page}
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages || loading}
        className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-base border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        下一页
      </button>

      <span className="ml-2 sm:ml-4 text-xs sm:text-sm text-gray-600">
        {currentPage}/{totalPages}
      </span>
    </div>
  );
};
