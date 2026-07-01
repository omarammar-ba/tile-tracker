
import React, { useState, useEffect } from 'react';
import { Tile, LogEntry } from '../types';
import { EditIcon, DeleteIcon, QRIcon } from './Icons';

interface TileListProps {
  tiles: Tile[];
  loading?: boolean;
  onEdit: (tile: Tile) => void;
  onDelete: (id: string) => void;
  onOpenReservation: (tile: Tile) => void;
  onViewImage: (src: string) => void;
  viewMode: 'preview' | 'full';
  onShowQR: (tile: Tile) => void;
  activeCategory?: 'tiles' | 'ceramics';
  logs?: LogEntry[];
}

const TileList: React.FC<TileListProps> = ({ tiles, loading, onEdit, onDelete, onOpenReservation, onViewImage, viewMode, onShowQR, activeCategory = 'tiles', logs = [] }) => {
  
  const [displayLimit, setDisplayLimit] = useState(50);
  const observerTarget = React.useRef<HTMLDivElement>(null);

  // عند تغيير القسم أو البيانات، نعيد تعيين العداد للبداية
  useEffect(() => {
    setDisplayLimit(50);
  }, [activeCategory, tiles]);

  // زيادة العداد عند الوصول لنهاية القائمة
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayLimit < tiles.length) {
          setDisplayLimit(prev => Math.min(prev + 30, tiles.length));
        }
      },
      {
        root: null, // يستخدم النافذة أو الحاوية الأقرب
        rootMargin: '200px', // تحميل قبل الوصول بـ 200 بيكسل
        threshold: 0.1
      }
    );

    observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [displayLimit, tiles.length]);

  const containerStyles = viewMode === 'preview' 
    ? { maxHeight: '320px', overflowY: 'auto' as const } 
    : { maxHeight: 'none' };
  
  const tableMinWidth = 'min-w-[550px]'; 
  const cellPadding = 'px-1 py-2 md:px-3 md:py-4';

  const isCeramic = activeCategory === 'ceramics';
  
  const headerBgClass = isCeramic ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800' : 'bg-sky-50 dark:bg-sky-900/30 border-sky-100 dark:border-sky-800';
  const headerTextClass = isCeramic ? 'text-rose-700 dark:text-rose-400' : 'text-sky-700 dark:text-sky-400';

  // تقطيع القائمة للعرض الحالي
  const visibleTiles = tiles.slice(0, displayLimit);

  return (
    <div className="mt-4 print:mt-0 print:w-full" dir="rtl">
      
      <div className="hidden print:block text-center mb-5 border-b-2 border-black pb-2">
          <h1 className="text-2xl font-black text-black">كشف مخزون - معرض عمار للسيراميك</h1>
          <p className="text-sm text-black">تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden print:border-none print:shadow-none print:rounded-none print:bg-transparent print:overflow-visible transition-colors duration-300">
            <div style={containerStyles} className="overflow-x-auto custom-scrollbar print:!overflow-visible print:!h-auto print:!max-h-none print:w-full">
            <table className={`${tableMinWidth} w-full divide-y divide-slate-100 dark:divide-slate-700 text-right print:min-w-full print:table print:border-collapse`}>
                <thead className={`${headerBgClass} sticky top-0 z-20 backdrop-blur-md print:bg-gray-200 print:static print:table-header-group border-b dark:border-slate-700`}>
                <tr className="print:border-b-2 print:border-black">
                    <th className={`${cellPadding} text-right text-[10px] md:text-xs font-black ${headerTextClass} uppercase tracking-widest print:hidden`}>الصنف</th>
                    <th className={`${cellPadding} text-center text-[10px] md:text-xs font-black ${headerTextClass} uppercase tracking-widest print:hidden`}>المواصفات</th>
                    <th className={`${cellPadding} text-center text-[10px] md:text-xs font-black ${headerTextClass} uppercase tracking-widest print:hidden`}>المتوفر الفعلي</th>
                    <th className={`${cellPadding} text-center text-[10px] md:text-xs font-black ${headerTextClass} uppercase tracking-widest print:hidden whitespace-nowrap`}>حالة الحجز</th>
                    <th className={`${cellPadding} text-center text-[10px] md:text-xs font-black ${headerTextClass} uppercase tracking-widest no-print`}>إجراءات</th>

                    <th className="hidden print:table-cell px-2 py-2 text-center font-black text-black border border-black bg-gray-200 text-sm">اسم الصنف</th>
                    <th className="hidden print:table-cell px-2 py-2 text-center font-black text-black border border-black bg-gray-200 text-sm">المقاس / المواصفات</th>
                    <th className="hidden print:table-cell px-2 py-2 text-center font-black text-black border border-black bg-gray-200 text-sm">السطح</th>
                    <th className="hidden print:table-cell px-2 py-2 text-center font-black text-black border border-black bg-gray-200 text-sm">النخب</th>
                    <th className="hidden print:table-cell px-2 py-2 text-center font-black text-black border border-black bg-gray-200 text-sm">الشيد</th>
                    <th className="hidden print:table-cell px-2 py-2 text-center font-black text-black border border-black bg-gray-200 text-sm">المتوفر م²</th>
                    <th className="hidden print:table-cell px-2 py-2 text-center font-black text-black border border-black bg-gray-200 text-sm">طبليات</th>
                </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-50 dark:divide-slate-700/50 print:bg-white print:divide-y print:divide-black">
                
                {loading ? (
                    <tr>
                        <td colSpan={5} className="py-8 pr-8 text-right">
                            <div className="flex items-center justify-start gap-4">
                                <div className={`w-6 h-6 border-4 ${isCeramic ? 'border-rose-500' : 'border-sky-500'} border-t-transparent rounded-full animate-spin`}></div>
                                <span className={`${isCeramic ? 'text-rose-600 dark:text-rose-400' : 'text-sky-600 dark:text-sky-400'} font-bold text-sm`}>جاري تحديث البيانات...</span>
                            </div>
                        </td>
                    </tr>
                ) : tiles.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500 font-bold">
                            لا توجد أصناف مسجلة حالياً.
                        </td>
                    </tr>
                ) : (
                    visibleTiles.map((tile) => {
                    const totalReserved = tile.reservations?.reduce((sum, r) => sum + r.meters, 0) || 0;
                    const availableMeters = tile.meters - totalReserved;
                    const availablePallets = tile.meters > 0 ? (availableMeters / tile.meters) * tile.pallets : 0;
                    const displaySize = tile.size || '120*60';
                    
                    let lastUpdateStr = 'غير معروف';
                    if (logs && logs.length > 0) {
                        const tileLogs = logs.filter(log => log.tileName === tile.name && (log.action === 'تعديل' || log.action === 'إضافة' || log.action === 'تعديل حجز'));
                        if (tileLogs.length > 0) {
                            const latestLog = tileLogs[0];
                            if (latestLog && latestLog.timestamp) {
                                const dateObj = latestLog.timestamp.seconds ? new Date(latestLog.timestamp.seconds * 1000) : new Date(latestLog.timestamp);
                                if (!isNaN(dateObj.getTime())) {
                                    lastUpdateStr = dateObj.toLocaleDateString('ar-EG', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                }
                            }
                        }
                    }

                    return (
                        <tr key={tile.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group print:hover:bg-transparent print:break-inside-avoid">
                        
                        <td className={`${cellPadding} print:hidden`}>
                            <div className="flex items-center gap-2 md:gap-4 min-w-0">
                                <div className="relative flex-shrink-0 w-14 h-14 md:w-20 md:h-20 no-print">
                                    <img 
                                        src={tile.image} 
                                        className="w-full h-full rounded-xl shadow-sm object-cover border border-slate-100 cursor-pointer hover:scale-105 transition-transform" 
                                        onClick={() => onViewImage(tile.image)}
                                        loading="lazy" 
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs md:text-lg font-black text-slate-800 dark:text-slate-100 leading-tight mb-1 whitespace-normal break-words">{tile.name}</div>
                                    <div className="text-[9px] md:text-xs text-slate-500 dark:text-slate-400 font-bold flex flex-wrap items-center gap-1 mb-1">
                                        <span className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-600 whitespace-nowrap text-slate-700 dark:text-slate-300">{tile.quality}</span>
                                        <span className="text-slate-300 dark:text-slate-600">|</span>
                                        <span className={`${isCeramic ? 'text-rose-600 dark:text-rose-400' : 'text-sky-600 dark:text-sky-400'} whitespace-nowrap`}>{tile.surface}</span>
                                    </div>
                                    <div className="mt-1 w-fit">
                                        <span className="text-[8px] md:text-[9px] text-slate-400 dark:text-slate-500 font-medium bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700 flex items-center gap-1 w-max">
                                            تحديث: <span className="text-slate-600 dark:text-slate-300 font-bold">{lastUpdateStr}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </td>

                        <td className={`${cellPadding} print:hidden align-middle text-center`}>
                            <div className="flex flex-col items-center gap-1">
                                <span className="inline-block bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-600 text-[10px] md:text-xs font-black text-slate-700 dark:text-slate-300 whitespace-normal text-center max-w-[150px] leading-tight">
                                    {displaySize}
                                </span>
                                {tile.shade && (
                                    <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500">
                                        شيد: {tile.shade}
                                    </span>
                                )}
                            </div>
                        </td>

                        <td className={`${cellPadding} print:hidden align-middle text-center`}>
                            <div className="flex flex-col items-center justify-center">
                                <div className={`flex items-center justify-center gap-1 text-lg md:text-xl font-black whitespace-nowrap ${availableMeters <= 5 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                    {/* هنا كان الخطأ، تم تغيير toFixed(0) إلى toFixed(2) */}
                                    <span>{availableMeters.toFixed(2)}</span>
                                    <small className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">م²</small>
                                </div>
                                
                                <div className="flex items-center justify-center gap-1 text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap mt-0.5">
                                    <span>{availablePallets.toFixed(1)}</span>
                                    <span>طبلية</span>
                                </div>
                            </div>
                        </td>

                        <td className={`${cellPadding} whitespace-nowrap print:hidden align-middle text-center`}>
                            {totalReserved > 0 ? (
                                <div className="flex items-center justify-center gap-1 px-1.5 py-0.5 md:px-3 md:py-1.5 rounded-full bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                    <span className="text-[8px] md:text-xs font-black">محجوز</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-1 px-1.5 py-0.5 md:px-3 md:py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 text-green-600 dark:text-green-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    <span className="text-[8px] md:text-xs font-black">متاح</span>
                                </div>
                            )}
                        </td>

                        <td className={`${cellPadding} whitespace-nowrap text-center no-print action-cell align-middle`}>
                            <div className="flex justify-center items-center gap-1.5">
                                <button onClick={() => onOpenReservation(tile)} className={`p-2 rounded-xl transition-colors ${totalReserved > 0 ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/50' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`} title="إدارة الحجوزات">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 md:h-4 md:w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                                </button>
                                
                                <button onClick={() => onShowQR(tile)} className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" title="رمز QR">
                                    <QRIcon />
                                </button>
                                
                                <button onClick={() => onEdit(tile)} className={`p-2 rounded-xl transition-colors ${isCeramic ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-800/50' : 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-800/50'}`} title="تعديل">
                                    <EditIcon />
                                </button>
                                
                                <button onClick={() => onDelete(tile.id)} className="p-2 bg-red-50 dark:bg-red-900/30 text-red-400 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-800/50 hover:text-red-600 dark:hover:text-red-300 transition-colors" title="حذف">
                                    <DeleteIcon />
                                </button>
                            </div>
                        </td>

                        <td className="hidden print:table-cell px-2 py-2 text-center font-bold border border-black text-black uppercase">{tile.name}</td>
                        <td className="hidden print:table-cell px-2 py-2 text-center font-bold border border-black text-black">{displaySize}</td>
                        <td className="hidden print:table-cell px-2 py-2 text-center font-bold border border-black text-black">{tile.surface}</td>
                        <td className="hidden print:table-cell px-2 py-2 text-center font-bold border border-black text-black">{tile.quality}</td>
                        <td className="hidden print:table-cell px-2 py-2 text-center font-bold border border-black text-black">{tile.shade || '-'}</td>
                        <td className="hidden print:table-cell px-2 py-2 text-center font-black border border-black text-black">{availableMeters.toFixed(2)}</td>
                        <td className="hidden print:table-cell px-2 py-2 text-center font-bold border border-black text-black">{availablePallets.toFixed(1)}</td>
                        </tr>
                    );
                    })
                )}
                
                </tbody>
            </table>
            
            {/* Observer Target for Infinite Scroll */}
            {displayLimit < tiles.length && (
              <div ref={observerTarget} className="py-4 flex justify-center items-center">
                  <div className={`w-5 h-5 border-4 ${isCeramic ? 'border-rose-500' : 'border-sky-500'} border-t-transparent rounded-full animate-spin`}></div>
                  <span className="mr-2 text-sm text-slate-500 font-bold">جاري تحميل المزيد...</span>
              </div>
            )}
            
            </div>
      </div>
    </div>
  );
};

export default React.memo(TileList);
export default React.memo(TileList);
