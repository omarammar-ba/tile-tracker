import React from 'react';

interface HeaderProps {
  userEmail?: string;
  activeCategory?: 'tiles' | 'ceramics';
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

const Header: React.FC<HeaderProps> = ({ userEmail, activeCategory = 'tiles', isDarkMode, toggleDarkMode }) => {
  const isCeramic = activeCategory === 'ceramics';
  
  // تحديد الألوان بناءً على القسم النشط
  const gradientClass = isCeramic ? 'from-rose-500 to-rose-700' : 'from-sky-500 to-sky-700';
  const shadowClass = isCeramic ? 'shadow-rose-200 dark:shadow-rose-900/50' : 'shadow-sky-200 dark:shadow-sky-900/50';
  const bgDecoration = isCeramic ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-sky-50 dark:bg-sky-900/20';

  return (
    // تمت زيادة pt-12 للهواتف لتفادي النوتش/الجزيرة الديناميكية
    <div className="bg-white dark:bg-slate-800 shadow-xl rounded-[2.5rem] mb-6 p-4 pt-12 md:p-6 flex flex-col md:flex-row justify-between items-center gap-6 border border-slate-100 dark:border-slate-700 relative overflow-hidden transition-all no-print max-w-5xl mx-auto">
      
      {/* لمسة جمالية في الخلفية تتغير حسب القسم */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${bgDecoration} rounded-full -mr-16 -mt-16 opacity-50 transition-colors duration-500`}></div>
      
      {/* الشعار والعنوان */}
      <div className="flex items-center gap-5 w-full justify-center md:justify-start relative z-10">
          {/* أيقونة محسنة بتصميم أنيق وزخرفة بدلاً من الحرف */}
          <div className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${gradientClass} rounded-2xl flex items-center justify-center text-white shadow-lg ${shadowClass} flex-shrink-0 border-4 border-white dark:border-slate-800 ring-1 ring-slate-100 dark:ring-slate-700 relative overflow-hidden group transition-all duration-500`}>
              
              {/* زخرفة خلفية ناعمة داخل المربع */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              
              {/* زخرفة هندسية (شكل بلاط مجرد) */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10 opacity-90 transform group-hover:scale-110 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>

          </div>

          <div className="text-right flex-1 -mt-4 md:mt-0">
              {/* تصغير العنوان للجوال */}
              <h1 className="text-lg md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">معرض عمار للسيراميك والبورسلان</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`w-2 h-2 ${isCeramic ? 'bg-rose-500' : 'bg-sky-500'} rounded-full animate-pulse`}></span>
                <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">
                    نظام إدارة البلاط
                </p>
              </div>
          </div>
      </div>

      {/* زر التبديل للوضع الداكن */}
      {toggleDarkMode && (
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleDarkMode();
          }} 
          className="absolute bottom-4 left-4 md:bottom-6 md:left-6 p-2 md:p-3 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all shadow-sm z-50 cursor-pointer"
          title={isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};

export default Header;