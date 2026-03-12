import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

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
    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1 || loading}
        className="p-2 rounded-lg border border-dark-500 text-dark-300 hover:bg-dark-600 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        title="上一页"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>

      <div className="flex gap-1">
        {getPageNumbers().map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span className="px-2 py-2 text-dark-500">...</span>
            ) : (
              <button
                onClick={() => handlePageClick(page as number)}
                disabled={loading}
                className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all ${
                  page === currentPage
                    ? 'bg-primary text-white'
                    : 'border border-dark-500 text-dark-300 hover:bg-dark-600 hover:border-primary hover:text-primary'
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
        className="p-2 rounded-lg border border-dark-500 text-dark-300 hover:bg-dark-600 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        title="下一页"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
