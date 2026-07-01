import React from 'react';
import { LogEntry } from '../types';

interface LogHistoryProps {
  logs: LogEntry[];
}

const LogHistory: React.FC<LogHistoryProps> = ({ logs }) => {
  
  const formatDateParts = (timestamp: any) => {
    if (!timestamp) return { date: '---', time: '' };
    try {
      const dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const dateStr = new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric', month: 'numeric', day: 'numeric'
      }).format(dateObj);
      const timeStr = new Intl.DateTimeFormat('ar-EG', {
        hour: 'numeric', minute: 'numeric', hour12: true
      }).format(dateObj);
      return { date: dateStr, time: timeStr };
    } catch (e) {
      return { date: 'تاريخ غير صالح', time: '' };
    }
  };

  const getActionStyles = (action: string) => {
      switch(action) {
          case 'إضافة': return { badge: 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800', row: 'border-l-4 border-l-green-500' };
          case 'تعديل': return { badge: 'text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800', row: 'border-l-4 border-l-sky-500' };
          case 'حذف': return { badge: 'text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800', row: 'border-l-4 border-l-rose-500' };
          case 'حجز': return { badge: 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800', row: 'border-l-4 border-l-amber-500' };
          default: return { badge: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700', row: 'border-l-4 border-l-gray-300 dark:border-l-gray-600' };
      }
  };

  // دالة لتنسيق تفاصيل التعديل بشكل أفضل
  const renderDetails = (details: string, action: string) => {
      if (action === 'تعديل' && details.includes('|')) {
          const changes = details.split('|');
          return (
              <div className="flex flex-wrap gap-1 mt-0.5">
                  {changes.map((change, idx) => (
                      <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-[9px] font-bold text-slate-600 dark:text-slate-300">
                          {change.trim()}
                      </span>
                  ))}
              </div>
          );
      }
      return <span className="opacity-80 leading-tight text-[11px]">{details}</span>;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 mt-2 mb-8 no-print overflow-hidden transition-colors flex flex-col" dir="rtl">
      
      {logs.length === 0 ? (
        <div className="text-center py-20 px-6">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200 dark:border-slate-600">
             <span className="text-3xl grayscale opacity-50">📝</span>
          </div>
          <p className="text-slate-400 dark:text-slate-500 font-bold">لا يوجد سجل حركات حتى الآن.</p>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-3 py-2 text-right text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">التفاصيل</th>
                <th className="px-3 py-2 text-right text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest w-20">الحدث</th>
                <th className="px-3 py-2 text-right text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest w-20">بواسطة</th>
                <th className="px-3 py-2 text-right text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest w-24">التوقيت</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-50 dark:divide-slate-700/50">
              {logs.map((log) => {
                const styles = getActionStyles(log.action);
                const { date, time } = formatDateParts(log.timestamp);
                return (
                  <tr key={log.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${styles.row}`}>
                    <td className="px-3 py-2">
                       <div className="flex flex-col leading-tight">
                          <span className="font-black text-slate-800 dark:text-slate-100 text-xs">{log.tileName}</span>
                          <span className="opacity-80 text-slate-600 dark:text-slate-300">{renderDetails(log.details, log.action)}</span>
                       </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${styles.badge}`}>
                          {log.action}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs font-black text-slate-700 dark:text-slate-300">
                      {log.user ? log.user.split('@')[0] : 'نظام'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-tight" dir="ltr">
                      <div>{date}</div>
                      <div className="text-[9px] opacity-70">{time}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LogHistory;
export default LogHistory;
