import React from 'react';
import { HiX } from 'react-icons/hi';

const SearchBar = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder || 'Search...'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      />
      <svg 
        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
        />
      </svg>
      
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          <HiX className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar; 