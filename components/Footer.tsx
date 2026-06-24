import React from 'react';

interface FooterProps {
    userEmail?: string;
    onLogout?: () => void;
}

const Footer: React.FC<FooterProps> = ({ userEmail, onLogout }) => {
  return (
    <footer className="text-center py-6 mt-8 border-t border-gray-200 dark:border-slate-700 transition-colors">
      
      {userEmail && (
          <div className="mb-4 flex justify-center items-center gap-4 no-print">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{userEmail.split('@')[0]}</span>
              </div>
              <button 
                onClick={onLogout}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium underline decoration-red-200 dark:decoration-red-900/50 hover:decoration-red-500 transition-all"
              >
                  تسجيل خروج
              </button>
          </div>
      )}

      <p className="text-slate-400 dark:text-slate-500 text-xs">
       المهندس عمر بني عامر 
      </p>
    </footer>
  );
};

export default Footer;