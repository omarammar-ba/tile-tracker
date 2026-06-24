import React, { useMemo } from 'react';
import { Tile } from '../types';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subValue: string;
  color?: string; 
  activeCategory?: 'tiles' | 'ceramics';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, subValue, activeCategory = 'tiles' }) => {
  const isCeramic = activeCategory === 'ceramics';
  
  // تحديد ألوان متدرجة حسب القسم
  const shadowColor = isCeramic ? 'hover:shadow-rose-100/50 dark:hover:shadow-rose-900/30' : 'hover:shadow-sky-100/50 dark:hover:shadow-sky-900/30';
  const blurColor = isCeramic ? 'from-rose-50/40 dark:from-rose-900/20' : 'from-sky-50/40 dark:from-sky-900/20';

  return (
    <div className={`p-6 rounded-[2.5rem] shadow-2xl bg-white/40 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 text-slate-800 dark:text-slate-100 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] ${shadowColor} hover:bg-white/50 dark:hover:bg-slate-800/80`}>
      <div className="relative z-10 text-right">
        <h3 className="text-[10px] font-black opacity-70 uppercase tracking-widest mb-1 text-slate-600 dark:text-slate-400">{title}</h3>
        {/* تصغير الخط للموبايل من text-3xl إلى text-2xl */}
        <p className={`text-2xl md:text-3xl font-black leading-none drop-shadow-sm ${isCeramic ? 'text-rose-900 dark:text-rose-400' : 'text-sky-900 dark:text-sky-400'}`}>{value}</p>
        <p className="text-[9px] font-bold mt-2 opacity-90 bg-white/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 inline-block px-3 py-1 rounded-full border border-white dark:border-slate-600 shadow-sm">{subValue}</p>
      </div>
      
      <div className={`absolute -right-6 -bottom-6 bg-gradient-to-br ${blurColor} to-transparent w-32 h-32 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500`}></div>
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
    </div>
  );
};

const SummaryCards: React.FC<{ tiles: Tile[], activeCategory?: 'tiles' | 'ceramics' }> = ({ tiles, activeCategory = 'tiles' }) => {
  const totals = useMemo(() => {
    let totalBoxes = 0;
    let totalMeters = 0;
    let totalPallets = 0;

    tiles.forEach(tile => {
      totalBoxes += Number(tile.boxes) || 0;
      totalMeters += Number(tile.meters) || 0;
      totalPallets += Number(tile.pallets) || 0;
    });

    return {
      typesCount: tiles.length,
      boxesCount: totalBoxes,
      metersCount: totalMeters,
      palletsCount: totalPallets
    };
  }, [tiles]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 no-print" dir="rtl">
       <SummaryCard 
        title="إجمالي عدد أنواع البلاط" 
        value={totals.typesCount} 
        subValue="أنواع مسجلة حالياً"
        activeCategory={activeCategory}
       />
       <SummaryCard 
        title="إجمالي الصناديق" 
        value={totals.boxesCount.toFixed(0)} 
        subValue="كرتونة داخل المستودع"
        activeCategory={activeCategory}
       />
       <SummaryCard 
        title="إجمالي الأمتار" 
        value={totals.metersCount.toFixed(1)} 
        subValue="متر مربع إجمالي"
        activeCategory={activeCategory}
       />
       <SummaryCard 
        title="إجمالي الطبليات" 
        value={totals.palletsCount.toFixed(1)} 
        subValue="طبلية موزعة"
        activeCategory={activeCategory}
       />
    </div>
  );
};

export default SummaryCards;