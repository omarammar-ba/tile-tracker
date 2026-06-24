
import React, { useState, useEffect, useRef } from 'react';
import { Tile } from '../types';
import { SaveIcon, CameraIcon, EditIcon, PlusIcon } from './Icons';

interface TileFormProps {
  onSave: (tile: any) => void;
  editingTile: Tile | null;
  onCancel: () => void;
  onViewImage: (src: string) => void;
  activeCategory?: 'tiles' | 'ceramics';
}

const PORCELAIN_CONFIG = {
  '60*60': { metersPerBox: 1.8, boxesPerPallet: 36 },
  '120*60': { metersPerBox: 2.16, boxesPerPallet: 44 }
};

const CERAMIC_PRESETS = [
    { label: '60*60 - فاشون', desc: '60*60 - فاشون', mBox: 1.46, bPallet: 36 },
    { label: '60*60 - بريما - قص ليزر', desc: '60*60 - بريما - قص ليزر', mBox: 1.41, bPallet: 36 },
    { label: '60*60 - بريما - قص عادي', desc: '60*60 - بريما - قص عادي', mBox: 1.44, bPallet: 36 },
    { label: '60*60 - 14 ملم', desc: '60*60 - 14 ملم', mBox: 1.08, bPallet: 36 },
    { label: '30*60 - بريما', desc: '30*60 - بريما', mBox: 1.62, bPallet: 48 },
    { label: '30*60 - فاشون', desc: '30*60 - فاشون', mBox: 1.62, bPallet: 32 },
    { label: '50*50', desc: '50*50', mBox: 1.50, bPallet: 32 },
];

interface FormState {
  name: string;
  quality: 'نخب أول' | 'نخب ثاني';
  shade: string;
  size: string; 
  surface: 'لامع' | 'مطفي';
  boxes: number | string;
  meters: number | string;
  pallets: number | string;
  image: string;
  ceramicPresetIdx?: number; 
}

const DEFAULT_IMAGE_BLUE = 'https://placehold.co/400x400/0284c7/ffffff?text=صورة+البلاط';
const DEFAULT_IMAGE_RED = 'https://placehold.co/400x400/e11d48/ffffff?text=صورة+السيراميك';

const initialFormState: FormState = {
  name: '',
  quality: 'نخب أول',
  shade: '', 
  size: '120*60',
  surface: 'لامع',
  boxes: '',
  meters: '',
  pallets: '',
  image: DEFAULT_IMAGE_BLUE,
  ceramicPresetIdx: 0,
};

const TileForm: React.FC<TileFormProps> = ({ onSave, editingTile, onCancel, onViewImage, activeCategory = 'tiles' }) => {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
     setFormState(prev => ({
         ...initialFormState,
         size: activeCategory === 'tiles' ? '120*60' : CERAMIC_PRESETS[0].desc,
         image: activeCategory === 'tiles' ? DEFAULT_IMAGE_BLUE : DEFAULT_IMAGE_RED,
         ceramicPresetIdx: 0 
     }));
  }, [activeCategory]);

  useEffect(() => {
    if (editingTile) {
      setFormState({
        ...editingTile,
        size: editingTile.size || '120*60',
        boxes: editingTile.boxes === 0 ? '' : editingTile.boxes,
        meters: editingTile.meters === 0 ? '' : editingTile.meters,
        pallets: editingTile.pallets === 0 ? '' : editingTile.pallets,
        ceramicPresetIdx: 0
      } as FormState);
      setIsExpanded(true); 
    } else {
      setFormState({
          ...initialFormState,
          size: activeCategory === 'tiles' ? '120*60' : CERAMIC_PRESETS[0].desc,
          image: activeCategory === 'tiles' ? DEFAULT_IMAGE_BLUE : DEFAULT_IMAGE_RED,
          ceramicPresetIdx: 0
      });
      setIsExpanded(false); 
    }
  }, [editingTile, activeCategory]);

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setFormState(prev => ({ ...prev, image: compressed }));
        setIsCompressing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentConfig = () => {
      if (activeCategory === 'ceramics') {
          const idx = Number(formState.ceramicPresetIdx || 0);
          const preset = CERAMIC_PRESETS[idx] || CERAMIC_PRESETS[0];
          return { metersPerBox: preset.mBox, boxesPerPallet: preset.bPallet };
      } else {
          const sizeKey = formState.size as keyof typeof PORCELAIN_CONFIG;
          return PORCELAIN_CONFIG[sizeKey] || PORCELAIN_CONFIG['120*60'];
      }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'ceramicPresetIdx') {
        const newIdx = Number(value);
        const preset = CERAMIC_PRESETS[newIdx];
        const currentBoxes = Number(formState.boxes) || 0;
        
        setFormState(prevState => ({
            ...prevState,
            ceramicPresetIdx: newIdx,
            size: preset.desc,
            meters: prevState.boxes === '' ? '' : parseFloat((currentBoxes * preset.mBox).toFixed(2)),
            pallets: prevState.boxes === '' ? '' : parseFloat((currentBoxes / preset.bPallet).toFixed(2))
        }));
        return;
    }

    if (name === 'boxes' || name === 'meters' || name === 'pallets') {
        const currentConfig = getCurrentConfig();
        const numValue = value === '' ? 0 : parseFloat(value);
        const mPerBox = currentConfig.metersPerBox;
        const bPerPallet = currentConfig.boxesPerPallet;
        
        if (name === 'boxes') {
            setFormState(prevState => ({
                ...prevState,
                boxes: value,
                meters: value === '' ? '' : parseFloat((numValue * mPerBox).toFixed(2)),
                pallets: value === '' ? '' : parseFloat((numValue / bPerPallet).toFixed(2))
            }));
        } else if (name === 'meters') {
            setFormState(prevState => ({
                ...prevState,
                meters: value,
                boxes: value === '' ? '' : parseFloat((numValue / mPerBox).toFixed(2)),
                pallets: value === '' ? '' : parseFloat((numValue / (mPerBox * bPerPallet)).toFixed(2))
            }));
        } else if (name === 'pallets') {
            setFormState(prevState => ({
                ...prevState,
                pallets: value,
                boxes: value === '' ? '' : parseFloat((numValue * bPerPallet).toFixed(2)),
                meters: value === '' ? '' : parseFloat((numValue * bPerPallet * mPerBox).toFixed(2))
            }));
        }
    } else if (name === 'size' && activeCategory === 'tiles') {
        const newSize = value;
        if (newSize in PORCELAIN_CONFIG) {
            const newConfig = PORCELAIN_CONFIG[newSize as keyof typeof PORCELAIN_CONFIG];
            const currentBoxes = Number(formState.boxes) || 0;
            setFormState(prevState => ({
                ...prevState,
                size: newSize,
                meters: prevState.boxes === '' ? '' : parseFloat((currentBoxes * newConfig.metersPerBox).toFixed(2)),
                pallets: prevState.boxes === '' ? '' : parseFloat((currentBoxes / newConfig.boxesPerPallet).toFixed(2))
            }));
        }
    } else {
        setFormState(prevState => ({ ...prevState, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { ceramicPresetIdx, ...rest } = formState;
    const defaultImg = activeCategory === 'tiles' ? DEFAULT_IMAGE_BLUE : DEFAULT_IMAGE_RED;
    
    const dataToSave: any = {
        ...rest,
        boxes: Number(formState.boxes) || 0,
        meters: Number(formState.meters) || 0,
        pallets: Number(formState.pallets) || 0,
        image: formState.image || defaultImg
    };
    
    onSave(dataToSave);
    
    setFormState({
        ...initialFormState,
        size: activeCategory === 'tiles' ? '120*60' : CERAMIC_PRESETS[0].desc,
        image: activeCategory === 'tiles' ? DEFAULT_IMAGE_BLUE : DEFAULT_IMAGE_RED,
        ceramicPresetIdx: 0
    });
    
    if (editingTile) {
        setIsExpanded(false);
    }
  };

  const handleCancelForm = () => {
      onCancel();
      setIsExpanded(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const inputClass = "w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 font-bold outline-none transition-all";
  const labelClass = "block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest text-right";
  
  const themeColor = activeCategory === 'tiles' ? 'sky' : 'rose';
  const themeRing = activeCategory === 'tiles' ? 'focus:ring-sky-500' : 'focus:ring-rose-500';

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl mb-8 border border-slate-100 dark:border-slate-700 no-print transition-all duration-300 ${isExpanded ? 'p-8' : 'p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`} dir="rtl">
      
      <div 
        className="flex items-center gap-4 cursor-pointer group" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${themeColor}-100 dark:shadow-${themeColor}-900/50 transition-all duration-300 ${isExpanded ? 'bg-slate-400 dark:bg-slate-600 rotate-45' : `bg-${themeColor}-600 group-hover:scale-110`}`}>
           {editingTile ? <EditIcon /> : <PlusIcon />}
        </div>
        <div className="flex-1">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none">
                {editingTile ? 'تعديل الصنف الحسابي' : `إضافة صنف جديد (${activeCategory === 'tiles' ? 'بورسلان' : 'سيراميك'})`}
            </h2>
            <div className={`text-xs text-slate-400 dark:text-slate-500 font-bold mt-1 transition-opacity ${isExpanded ? 'opacity-0' : 'opacity-100'}`}>اضغط هنا لفتح نافذة الإدخال</div>
        </div>
      </div>
      
      {/* تم تغيير طريقة العرض هنا باستخدام CSS Grid للأنيميشن بدلاً من الحذف من DOM */}
      <div className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-8' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
        <div className="overflow-hidden">
            <form onSubmit={handleSubmit} className="animate-fade-in">
                <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group text-right">
                        <label className={labelClass}>اسم الصنف</label>
                        <input type="text" name="name" value={formState.name} onChange={handleChange} required className={`${inputClass} ${themeRing}`} placeholder="" />
                    </div>
                    
                    <div className="form-group text-right">
                        <label className={labelClass}>{activeCategory === 'ceramics' ? 'المواصفات (الشركة - القص - المقاس)' : 'المقاس'}</label>
                        {activeCategory === 'tiles' ? (
                            <select name="size" value={formState.size} onChange={handleChange} className={`${inputClass} ${themeRing}`}>
                                <option value="120*60">120 * 60 سم</option>
                                <option value="60*60">60 * 60 سم</option>
                            </select>
                        ) : (
                            <select name="ceramicPresetIdx" value={formState.ceramicPresetIdx} onChange={handleChange} className={`${inputClass} ${themeRing}`}>
                                {CERAMIC_PRESETS.map((preset, idx) => (
                                    <option key={idx} value={idx}>{preset.label}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="form-group text-right">
                    <label className={labelClass}>النخب</label>
                    <select name="quality" value={formState.quality} onChange={handleChange} className={`${inputClass} ${themeRing}`}>
                        <option value="نخب أول">نخب أول</option>
                        <option value="نخب ثاني">نخب ثاني</option>
                    </select>
                    </div>
                    <div className="form-group text-right">
                    <label className={labelClass}>السطح</label>
                    <select name="surface" value={formState.surface} onChange={handleChange} className={`${inputClass} ${themeRing}`}>
                        <option value="لامع">لامع</option>
                        <option value="مطفي">مطفي</option>
                    </select>
                    </div>
                    
                    {activeCategory === 'tiles' && (
                        <div className="form-group text-right">
                            <label className={labelClass}>الشيد</label>
                            <input type="text" name="shade" value={formState.shade} onChange={handleChange} className={`${inputClass} ${themeRing}`} placeholder="" />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="form-group text-right bg-slate-50 dark:bg-slate-700/50 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-700 relative group focus-within:ring-2 focus-within:ring-slate-300 dark:focus-within:ring-slate-600 transition-all shadow-sm">
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">الكراتين</label>
                        <input type="number" name="boxes" value={formState.boxes} onChange={handleChange} required min="0" step="any" className="w-full bg-white dark:bg-slate-800 px-4 py-3 rounded-xl text-slate-800 dark:text-slate-100 text-2xl font-black outline-none border border-slate-200 dark:border-slate-600 focus:border-slate-400 dark:focus:border-slate-500 placeholder-slate-300 dark:placeholder-slate-600" placeholder="0" />
                    </div>
                    <div className="form-group text-right bg-slate-50 dark:bg-slate-700/50 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-700 relative group focus-within:ring-2 focus-within:ring-slate-300 dark:focus-within:ring-slate-600 transition-all shadow-sm">
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">الأمتار</label>
                        <input type="number" name="meters" value={formState.meters} onChange={handleChange} required min="0" step="any" className="w-full bg-white dark:bg-slate-800 px-4 py-3 rounded-xl text-slate-800 dark:text-slate-100 text-2xl font-black outline-none border border-slate-200 dark:border-slate-600 focus:border-slate-400 dark:focus:border-slate-500 placeholder-slate-300 dark:placeholder-slate-600" placeholder="0" />
                    </div>
                    <div className="form-group text-right bg-slate-50 dark:bg-slate-700/50 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-700 relative group focus-within:ring-2 focus-within:ring-slate-300 dark:focus-within:ring-slate-600 transition-all shadow-sm">
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">الطبليات</label>
                        <input type="number" name="pallets" value={formState.pallets} onChange={handleChange} required min="0" step="any" className="w-full bg-white dark:bg-slate-800 px-4 py-3 rounded-xl text-slate-800 dark:text-slate-100 text-2xl font-black outline-none border border-slate-200 dark:border-slate-600 focus:border-slate-400 dark:focus:border-slate-500 placeholder-slate-300 dark:placeholder-slate-600" placeholder="0" />
                    </div>
                </div>

                <div className="pt-4 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group shrink-0">
                        <img 
                            src={formState.image} 
                            alt="صورة العينة" 
                            className={`w-32 h-32 object-cover rounded-[2rem] shadow-xl cursor-pointer border-4 border-white dark:border-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 group-hover:ring-${themeColor}-400 transition-all`} 
                            onClick={() => onViewImage(formState.image)} 
                        />
                        {isCompressing && <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 flex items-center justify-center rounded-[2rem]"><div className={`w-8 h-8 border-4 border-${themeColor}-600 border-t-transparent rounded-full animate-spin`}></div></div>}
                    </div>
                    <div className="flex-grow w-full text-right">
                        <p className={labelClass}>صورة العينة</p>
                        <div className="flex flex-wrap gap-4 justify-start">
                            <button 
                                type="button" 
                                onClick={() => cameraInputRef.current?.click()}
                                className={`flex items-center gap-3 px-6 py-3.5 bg-${themeColor}-600 text-white rounded-2xl cursor-pointer hover:bg-${themeColor}-700 transition-all font-black shadow-lg shadow-${themeColor}-100 dark:shadow-${themeColor}-900/50`}
                            >
                                <CameraIcon />
                                <span>التقاط صورة</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-3 px-6 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-black border-2 border-slate-100 dark:border-slate-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span>رفع من الجهاز</span>
                            </button>
                            <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </div>
                    </div>
                </div>
                </div>

                <div className="mt-12 flex flex-col md:flex-row justify-end gap-4 pt-8 border-t border-slate-100 dark:border-slate-700">
                    <button type="button" onClick={handleCancelForm} className="px-8 py-4 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 font-black transition-all order-2 md:order-1">
                        إغلاق / إلغاء
                    </button>
                    <button type="submit" disabled={isCompressing} className={`px-12 py-4 bg-${themeColor}-600 text-white rounded-2xl hover:bg-${themeColor}-700 shadow-xl shadow-${themeColor}-100 dark:shadow-${themeColor}-900/50 font-black transition-all active:scale-95 flex items-center justify-center gap-3 order-1 md:order-2 disabled:opacity-50`}>
                        <SaveIcon /> {editingTile ? 'تحديث البيانات' : 'حفظ وإضافة آخر'}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

// استخدام React.memo لتحسين الأداء
export default React.memo(TileForm);
