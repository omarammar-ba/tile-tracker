import React from 'react';
import { Tile } from '../types';
import { EditIcon, CancelIcon } from './Icons';

interface ScanResultModalProps {
  tile: Tile;
  onClose: () => void;
  onEdit: (tile: Tile) => void;
}

const ScanResultModal: React.FC<ScanResultModalProps> = ({ tile, onClose, onEdit }) => {
  if (!tile) return null;

  const totalReserved = tile.reservations?.reduce((sum, r) => sum + r.meters, 0) || 0;
  const availableMeters = tile.meters - totalReserved;
  const displaySize = tile.size || '120*60';

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center relative animate-scale-in border border-white/20 dark:border-slate-700" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <div className="bg-green-500 text-white px-6 py-1 rounded-full text-xs font-black shadow-lg shadow-green-200 dark:shadow-green-900/50 border-2 border-white dark:border-slate-800">
               تم التعرف على الصنف ✓
            </div>
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-300 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-2"
          aria-label="إغلاق"
        >
          <CancelIcon />
        </button>

        <div className="mt-6 mb-8">
            <div className="w-28 h-28 mx-auto mb-6 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 ring-1 ring-slate-100 dark:ring-slate-700">
                <img src={tile.image} className="w-full h-full object-cover" alt={tile.name} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 leading-tight mb-2 uppercase tracking-tight">{tile.name}</h2>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
                <span className="bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 px-3 py-1 rounded-lg text-xs font-black border border-sky-100 dark:border-sky-800">{displaySize}</span>
                <span className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg text-xs font-black border border-slate-100 dark:border-slate-700">{tile.quality}</span>
                <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-lg text-xs font-black border border-amber-100 dark:border-amber-800">الشيد: {tile.shade || '---'}</span>
            </div>
        </div>
        
        <div className="space-y-4 text-right bg-slate-50 dark:bg-slate-700/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 mb-8 shadow-inner">
            <div className="flex justify-between items-end">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">المتوفر للبيع</span>
                    <span className="font-black text-3xl text-green-600 dark:text-green-400 leading-none">{availableMeters.toFixed(2)} <small className="text-sm font-bold">م²</small></span>
                </div>
                <div className="text-left">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">الإجمالي الكلي</span>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{tile.meters.toFixed(2)} م²</p>
                </div>
            </div>
            
            <div className="h-px bg-slate-200 dark:bg-slate-700 w-full opacity-50"></div>
            
            <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">حالة الحجوزات:</span>
                <span className={`text-xs font-black px-2 py-0.5 rounded ${totalReserved > 0 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                    {totalReserved > 0 ? `محجوز لـ ${tile.reservations?.length} زبائن` : 'لا توجد حجوزات'}
                </span>
            </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => onEdit(tile)} 
            className="w-full px-6 py-5 bg-sky-600 text-white rounded-2xl font-black shadow-xl shadow-sky-100 dark:shadow-sky-900/50 hover:bg-sky-700 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <EditIcon />
            تعديل الكميات أو المواصفات
          </button>
          <button onClick={onClose} className="w-full py-3 text-slate-400 dark:text-slate-500 font-bold hover:text-slate-600 dark:hover:text-slate-300 transition-all text-sm">
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanResultModal;