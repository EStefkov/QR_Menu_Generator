import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems,
  startIndex,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemLabel = 'элементов'
}) => {
  const { t } = useLanguage();
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-4 gap-3">
      <div className="text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
        {t('pagination.showing', {
          from: startIndex + 1,
          to: Math.min(startIndex + itemsPerPage, totalItems),
          total: totalItems,
          items: itemLabel
        }) || `Показване на ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, totalItems)} от ${totalItems} ${itemLabel}`}
      </div>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label={t('pagination.firstPage') || "Първа страница"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label={t('pagination.previousPage') || "Предишна страница"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <span className="px-3 py-1 text-gray-700 dark:text-gray-300">
          {t('pagination.pageInfo', { current: currentPage, total: totalPages }) || `Страница ${currentPage} от ${totalPages}`}
        </span>
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label={t('pagination.nextPage') || "Следваща страница"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label={t('pagination.lastPage') || "Последна страница"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
        
        {onItemsPerPageChange && (
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="ml-2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
            aria-label={t('pagination.itemsPerPage') || "Елементи на страница"}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        )}
      </div>
    </div>
  );
};

export default Pagination; 