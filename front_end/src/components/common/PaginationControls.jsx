import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useLanguage } from '../../contexts/LanguageContext';

const PaginationControls = ({ currentPage, totalPages, onPageChange, itemsPerPage = 5 }) => {
  const { t } = useLanguage();
  
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 bg-white dark:bg-gray-800">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('pagination.showing') || 'Showing'}{' '}
            <span className="font-medium">
              {((currentPage - 1) * itemsPerPage) + 1}
            </span>{' '}
            {t('pagination.to') || 'to'}{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalPages * itemsPerPage)}
            </span>{' '}
            {t('pagination.of') || 'of'}{' '}
            <span className="font-medium">{totalPages * itemsPerPage}</span>{' '}
            {t('pagination.results') || 'results'}
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-400 ring-1 ring-inset ring-gray-300 
                dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-offset-0 
                ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="sr-only">{t('pagination.previous') || 'Previous'}</span>
              <HiChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                aria-current={currentPage === page ? 'page' : undefined}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold 
                  ${currentPage === page 
                    ? 'z-10 bg-blue-600 dark:bg-blue-700 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' 
                    : 'text-gray-900 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-offset-0'}`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-gray-400 ring-1 ring-inset ring-gray-300 
                dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-offset-0 
                ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="sr-only">{t('pagination.next') || 'Next'}</span>
              <HiChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
      
      {/* Mobile pagination */}
      <div className="flex sm:hidden justify-between items-center w-full">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300
            ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800
            ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <HiChevronLeft className="h-5 w-5 mr-1" />
          {t('pagination.previous') || 'Previous'}
        </button>
        
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {currentPage} / {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300
            ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800
            ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {t('pagination.next') || 'Next'}
          <HiChevronRight className="h-5 w-5 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls; 