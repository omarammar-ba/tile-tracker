import React from 'react';
import { PrintIcon, ExportIcon } from './Icons';

interface ToolbarProps {
  onPrint: () => void;
  onExport: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onPrint, onExport }) => {
  return (
    <div className="flex items-center gap-3 no-print w-full sm:w-auto">
      
      {/* زر الطباعة بتصميم محدث */}
      <button
        onClick={onPrint}
        className="flex flex-1 items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors text-sm font-medium"
      >
        <PrintIcon />
        <span>طباعة</span>
      </button>

      {/* زر التصدير بتصميم محدث */}
      <button
        onClick={onExport}
        className="flex flex-1 items-center justify-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg shadow-sm hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors text-sm font-medium"
      >
        <ExportIcon />
        <span>تصدير (Excel)</span>
      </button>
      
    </div>
  );
};

export default Toolbar;