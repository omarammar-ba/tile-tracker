import React, { useState, useEffect } from 'react';
import { SearchIcon, CameraIcon } from './Icons';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onScanClick?: () => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ searchQuery, onSearchChange, onScanClick }) => {
  const [inputValue, setInputValue] = useState(searchQuery);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (inputValue !== searchQuery) {
        onSearchChange(inputValue);
      }
    }, 300);
    return () => clearTimeout(timerId);
  }, [inputValue, onSearchChange, searchQuery]);
  
  useEffect(() => {
      if (searchQuery !== inputValue) {
          setInputValue(searchQuery);
      }
  }, [searchQuery]);

  return (
      <div className="relative w-full flex items-center shadow-sm rounded-lg overflow-hidden border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 no-print transition-colors">
        
        {/* أيقونة البحث */}
        <div className="pl-3 pr-2 text-gray-400 dark:text-slate-500 pointer-events-none">
            <SearchIcon />
        </div>

        {/* حقل الإدخال */}
        <input
            type="text"
            placeholder="ابحث عن بلاطة..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow py-3 px-2 text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 bg-transparent border-none focus:ring-0 focus:outline-none"
        />

        {/* زر حذف النص (X) */}
        {inputValue && (
            <button
                type="button"
                onClick={() => { setInputValue(''); onSearchChange(''); }}
                className="p-3 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                title="مسح البحث"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        )}

        {/* زر الماسح الضوئي */}
        {onScanClick && (
            <button 
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onScanClick();
                }}
                className="p-3 bg-gray-50 dark:bg-slate-700/50 hover:bg-sky-50 dark:hover:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 border-r border-gray-200 dark:border-slate-700 transition-colors cursor-pointer active:bg-sky-100 dark:active:bg-sky-900/50 z-10"
                title="مسح QR Code"
            >
                <CameraIcon />
            </button>
        )}
      </div>
  );
};

export default SearchFilter;