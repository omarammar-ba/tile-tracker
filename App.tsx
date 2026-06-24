
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tile, Reservation, LogEntry } from './types';
import Header from './components/Header';
import TileForm from './components/TileForm';
import TileList from './components/TileList';
import SummaryCards from './components/SummaryCards';
import Footer from './components/Footer';
import ImageModal from './components/ImageModal';
import SearchFilter from './components/SearchFilter';
import Toolbar from './components/Toolbar';
import ConfirmModal from './components/ConfirmModal';
import QRModal from './components/QRModal';
import QRScanner from './components/QRScanner';
import Login from './components/Login';
import { ListIcon, HomeIcon, CameraIcon, SaveIcon, CancelIcon, PlusIcon, DeleteIcon, EditIcon, HistoryIcon, WarningIcon, SearchIcon } from './components/Icons';
import { db, auth } from './firebase';
import ScanResultModal from './components/ScanResultModal';
import InstallPrompt from './components/InstallPrompt';
import LogHistory from './components/LogHistory';

type ViewMode = 'dashboard' | 'fullList' | 'logs';
type Category = 'tiles' | 'ceramics'; // tiles = بورسلان, ceramics = سيراميك

// --- مكون نافذة إدخال اسم الجهاز ---
const DeviceNameModal: React.FC<{ onSave: (name: string) => void }> = ({ onSave }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[300] p-4" dir="rtl">
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-scale-in text-center relative border-4 border-sky-100 dark:border-sky-900/50">
                <div className="w-20 h-20 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">مرحباً بك في النظام</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-bold leading-relaxed">
                    لتحسين سجل الحركات، يرجى إدخال اسمك أو اسم هذا الجهاز لمرة واحدة فقط.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="مثال: عمر - المعرض الرئيسي" 
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-slate-100 font-bold focus:border-sky-500 dark:focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/30 transition-all outline-none text-center placeholder-slate-300 dark:placeholder-slate-500"
                            autoFocus
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={!name.trim()}
                        className="w-full py-4 bg-sky-600 text-white rounded-2xl font-black shadow-xl shadow-sky-100 dark:shadow-sky-900/50 hover:bg-sky-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        حفظ ومتابعة
                    </button>
                </form>
            </div>
        </div>
    );
};

const ReservationModal: React.FC<{ tile: Tile, onClose: () => void, onUpdateReservations: (reservations: Reservation[]) => void }> = ({ tile, onClose, onUpdateReservations }) => {
    const [reservations, setReservations] = useState<Reservation[]>(tile.reservations || []);
    const [newName, setNewName] = useState('');
    const [newMeters, setNewMeters] = useState('');
    const [newNotes, setNewNotes] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const handleAddOrUpdate = () => {
        if (!newName || !newMeters) return;
        const metersNum = parseFloat(newMeters);
        
        if (editingId) {
            setReservations(reservations.map(r => r.id === editingId ? { ...r, customerName: newName, meters: metersNum, notes: newNotes } : r));
            setEditingId(null);
        } else {
            const newRes: Reservation = {
                id: Math.random().toString(36).substr(2, 9),
                customerName: newName,
                meters: metersNum,
                notes: newNotes,
                date: new Date().toLocaleDateString('ar-EG')
            };
            setReservations([...reservations, newRes]);
        }
        setNewName(''); setNewMeters(''); setNewNotes('');
        setShowAddForm(false);
    };

    const handleEdit = (res: Reservation) => {
        setEditingId(res.id);
        setNewName(res.customerName);
        setNewMeters(res.meters.toString());
        setNewNotes(res.notes);
        setShowAddForm(true);
    };

    const handleDeleteClick = (id: string) => {
        setConfirmDeleteId(id);
    };

    const confirmDeleteReservation = () => {
        if (confirmDeleteId) {
            setReservations(reservations.filter(r => r.id !== confirmDeleteId));
            setConfirmDeleteId(null);
        }
    };

    const totalReserved = reservations.reduce((sum, r) => sum + r.meters, 0);

    return (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" dir="rtl" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto relative border border-white/20 dark:border-slate-700" onClick={e => e.stopPropagation()}>
                
                {confirmDeleteId && (
                    <div className="absolute inset-0 z-[110] flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-[2.5rem]">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl border-2 border-rose-100 dark:border-rose-900/50 text-center w-64 animate-scale-in transform scale-100">
                            <div className="text-rose-500 dark:text-rose-400 mb-3 flex justify-center"><WarningIcon /></div>
                            <h4 className="font-black text-slate-800 dark:text-slate-100 mb-1">حذف الحجز؟</h4>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 font-bold">لا يمكن التراجع عن هذا الإجراء</p>
                            <div className="flex gap-2 justify-center">
                                <button onClick={confirmDeleteReservation} className="bg-rose-500 text-white px-6 py-2 rounded-xl text-sm font-black shadow-lg shadow-rose-200 dark:shadow-rose-900/50 hover:bg-rose-600 transition-all">حذف</button>
                                <button onClick={() => setConfirmDeleteId(null)} className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-black hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">إلغاء</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-6">
                    <div className="text-right">
                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-none">سجل الحجوزات</h3>
                        <p className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-1 uppercase tracking-widest">{tile.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-500 dark:hover:text-rose-400 transition-all"><CancelIcon /></button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-rose-50 dark:bg-rose-900/20 p-5 rounded-3xl border border-rose-100 dark:border-rose-800/50 text-right">
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 font-black uppercase mb-1">المحجوز حالياً</p>
                        <p className="text-3xl font-black text-rose-700 dark:text-rose-300 leading-none">{totalReserved.toFixed(2)} <small className="text-sm">م²</small></p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-600 text-right">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase mb-1">المتوفر للبيع</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-slate-100 leading-none">{(tile.meters - totalReserved).toFixed(2)} <small className="text-sm">م²</small></p>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center">
                        <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm">قائمة الحجوزات ({reservations.length})</h4>
                        {!showAddForm && (
                            <button onClick={() => setShowAddForm(true)} className="bg-sky-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-sky-100 dark:shadow-sky-900/50 flex items-center gap-2 hover:bg-sky-700 transition-all">
                                <PlusIcon /> إضافة حجز
                            </button>
                        )}
                    </div>

                    {reservations.length === 0 && !showAddForm ? (
                        <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl text-slate-400 dark:text-slate-500 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700">
                            لا توجد حجوزات مسجلة لهذا الصنف
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reservations.map(res => (
                                <div key={res.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl shadow-sm flex justify-between items-center group hover:border-sky-200 dark:hover:border-sky-700 transition-colors">
                                    <div className="flex-grow text-right">
                                        <p className="font-black text-slate-800 dark:text-slate-100">{res.customerName}</p>
                                        <div className="flex gap-3 items-center mt-1 justify-end">
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{res.date}</span>
                                            <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-md">{res.meters} م²</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(res)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"><EditIcon /></button>
                                        <button onClick={() => handleDeleteClick(res.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"><DeleteIcon /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {showAddForm && (
                    <div className="bg-sky-50/50 dark:bg-sky-900/10 p-6 rounded-[2rem] border-2 border-sky-100 dark:border-sky-800/50 animate-scale-in mb-8">
                        <h5 className="font-black text-sky-800 dark:text-sky-300 text-xs mb-4 uppercase tracking-widest text-right">{editingId ? 'تحديث البيانات' : 'إضافة حجز جديد'}</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-1 text-right">
                                <label className="text-[10px] font-black text-sky-700 dark:text-sky-400 mr-2">اسم الزبون</label>
                                <input type="text" placeholder="" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-4 py-3 border-2 border-white dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none text-right" />
                            </div>
                            <div className="space-y-1 text-right">
                                <label className="text-[10px] font-black text-sky-700 dark:text-sky-400 mr-2">الكمية بالمتر (م²)</label>
                                <input type="number" placeholder="" value={newMeters} onChange={e => setNewMeters(e.target.value)} className="w-full px-4 py-3 border-2 border-white dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none text-right" />
                            </div>
                        </div>
                        <div className="space-y-1 mb-6 text-right">
                            <label className="text-[10px] font-black text-sky-700 dark:text-sky-400 mr-2">ملاحظات</label>
                            <textarea placeholder="" value={newNotes} onChange={e => setNewNotes(e.target.value)} className="w-full px-4 py-3 border-2 border-white dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm font-bold h-20 outline-none focus:ring-2 focus:ring-sky-500 resize-none text-right"></textarea>
                        </div>
                        <div className="flex gap-3">
                             <button onClick={handleAddOrUpdate} className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-black shadow-lg shadow-sky-100 dark:shadow-sky-900/50 transition-all active:scale-95">{editingId ? 'تحديث' : 'تأكيد الحجز'}</button>
                             <button onClick={() => {setShowAddForm(false); setEditingId(null); setNewName(''); setNewMeters(''); setNewNotes('');}} className="px-6 py-3 text-slate-400 dark:text-slate-500 font-bold hover:text-slate-600 dark:hover:text-slate-300">إلغاء</button>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
                    <button onClick={onClose} className="flex-1 py-4 bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 rounded-2xl font-black hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">خروج</button>
                    <button onClick={() => onUpdateReservations(reservations)} className="flex-[2] py-4 bg-rose-600 text-white rounded-2xl font-black shadow-xl shadow-rose-100 dark:shadow-rose-900/50 hover:bg-rose-700 transition-all flex items-center justify-center gap-3 active:scale-95"><SaveIcon /> حفظ كافة التغييرات</button>
                </div>
            </div>
        </div>
    );
}

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // تقسيم البيانات لتخزينها في الذاكرة
  const [porcelainTiles, setPorcelainTiles] = useState<Tile[]>([]);
  const [ceramicTiles, setCeramicTiles] = useState<Tile[]>([]);
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingTile, setEditingTile] = useState<Tile | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [showingQRFor, setShowingQRFor] = useState<Tile | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [reservingTile, setReservingTile] = useState<Tile | null>(null);
  const [view, setView] = useState<ViewMode>('dashboard');
  const [scannedTileInfo, setScannedTileInfo] = useState<Tile | null>(null);
  
  const [activeCategory, setActiveCategory] = useState<Category>('tiles');
  const [quickSearch, setQuickSearch] = useState('');
  const [showQuickSearch, setShowQuickSearch] = useState(false);

  // حالة لتخزين اسم الجهاز
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [deviceName, setDeviceName] = useState<string>('');

  useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((u) => { setUser(u); setAuthLoading(false); });
      return () => unsubscribe();
  }, []);

  // التحقق من اسم الجهاز عند الدخول
  useEffect(() => {
      if (user) {
          const storedName = localStorage.getItem('device_owner');
          if (storedName) {
              setDeviceName(storedName);
          } else {
              // إذا لم يكن الاسم محفوظاً، أظهر النافذة
              setShowNamePrompt(true);
          }
      }
  }, [user]);

  const handleSaveDeviceName = (name: string) => {
      localStorage.setItem('device_owner', name);
      setDeviceName(name);
      setShowNamePrompt(false);
  };

  // جلب كل البيانات (بورسلان وسيراميك) عند بدء التطبيق
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    
    try {
      // 1. مراقب البورسلان
      const unsubscribePorcelain = db.collection('tiles').orderBy('name', 'asc').onSnapshot((snapshot) => {
        if (!snapshot.empty) {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Tile[];
            setPorcelainTiles(data);
        } else {
            setPorcelainTiles([]);
        }
      });

      // 2. مراقب السيراميك
      const unsubscribeCeramics = db.collection('ceramics').orderBy('name', 'asc').onSnapshot((snapshot) => {
        if (!snapshot.empty) {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Tile[];
            setCeramicTiles(data);
        } else {
            setCeramicTiles([]);
        }
        // إخفاء التحميل بمجرد وصول البيانات
        setLoading(false);
      });

      // 3. مراقب السجلات
      const unsubscribeLogs = db.collection("logs").orderBy('timestamp', 'desc').limit(50).onSnapshot((snapshot) => {
          if (!snapshot.empty) {
              const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LogEntry[];
              setLogs(logsData);
          }
      });

      return () => {
          unsubscribePorcelain();
          unsubscribeCeramics();
          unsubscribeLogs();
      };
    } catch (err) { 
        console.error(err);
        setLoading(false); 
    }
  }, [user]);

  // تحديد القائمة المعروضة حالياً باستخدام useMemo لتحسين الأداء
  const currentTiles = useMemo(() => {
    return activeCategory === 'tiles' ? porcelainTiles : ceramicTiles;
  }, [activeCategory, porcelainTiles, ceramicTiles]);

  useEffect(() => {
    if (currentTiles.length > 0 && !scannedTileInfo) {
        const params = new URLSearchParams(window.location.search);
        const tileIdFromUrl = params.get('tileId');
        if (tileIdFromUrl) {
            const targetTile = currentTiles.find(t => t.id === tileIdFromUrl);
            if (targetTile) {
                setScannedTileInfo(targetTile);
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
    }
  }, [currentTiles, scannedTileInfo]);

  const logAction = (action: string, tileName: string, details: string) => {
      // استخدام الاسم المحفوظ، أو الإيميل كخيار بديل
      const storedName = localStorage.getItem('device_owner');
      const currentUser = storedName || (user?.email ? user.email.split('@')[0] : 'مدير');
      
      const newLog: LogEntry = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          user: currentUser,
          action,
          tileName,
          details
      };
      // Optimistic update for logs
      setLogs(prev => [newLog, ...prev]);
      db.collection("logs").add(newLog).catch(err => console.error("Failed to persist log", err));
  };

  const handleEditClick = useCallback((tile: Tile) => {
      setEditingTile(tile);
      setView('dashboard'); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSaveTile = useCallback(async (tileData: Omit<Tile, 'id'> | Tile) => { 
      const collectionName = activeCategory === 'tiles' ? 'tiles' : 'ceramics';
      
      try { 
          if ('id' in tileData) { 
              const { id, ...dataToUpdate } = tileData; 
              
              // البحث في القائمة الصحيحة
              const oldTile = (activeCategory === 'tiles' ? porcelainTiles : ceramicTiles).find(t => t.id === id);
              let changeDetails = 'تم تحديث البيانات';
              
              if (oldTile) {
                  const changes: string[] = [];
                  if (oldTile.name !== dataToUpdate.name) changes.push(`الاسم: ${oldTile.name} -> ${dataToUpdate.name}`);
                  if (oldTile.meters !== dataToUpdate.meters) changes.push(`الأمتار: ${oldTile.meters} -> ${dataToUpdate.meters}`);
                  if (oldTile.boxes !== dataToUpdate.boxes) changes.push(`الكراتين: ${oldTile.boxes} -> ${dataToUpdate.boxes}`);
                  if (oldTile.quality !== dataToUpdate.quality) changes.push(`النخب: ${oldTile.quality} -> ${dataToUpdate.quality}`);
                  
                  if (changes.length > 0) {
                      changeDetails = changes.join(' | ');
                  }
              }

              // التحديث المحلي المتفائل
              const updateLocalState = activeCategory === 'tiles' ? setPorcelainTiles : setCeramicTiles;
              updateLocalState(prev => prev.map(t => t.id === id ? { ...t, ...dataToUpdate } : t));
              
              logAction('تعديل', dataToUpdate.name, changeDetails);
              await db.collection(collectionName).doc(id).update(dataToUpdate); 
          } else { 
              const newId = Math.random().toString(36).substr(2, 9);
              const newTile = { ...tileData, id: newId, reservations: [] } as Tile;
              
              // الإضافة المحلية المتفائلة
              const updateLocalState = activeCategory === 'tiles' ? setPorcelainTiles : setCeramicTiles;
              updateLocalState(prev => [...prev, newTile]);
              
              logAction('إضافة', tileData.name, `تم إضافة صنف جديد في ${activeCategory === 'tiles' ? 'البورسلان' : 'السيراميك'}. الكمية: ${tileData.meters} م²`);
              await db.collection(collectionName).add({ ...tileData, reservations: [] }); 
          } 
          setEditingTile(null); 
          window.scrollTo({ top: 0, behavior: 'smooth' }); 
      } catch (e) { 
          console.error(e);
          alert("تم حفظ البيانات محلياً (قد يوجد مشكلة في الاتصال)."); 
      } 
  }, [activeCategory, porcelainTiles, ceramicTiles]);

  const handleUpdateReservations = useCallback(async (updatedReservations: Reservation[]) => {
    if (!reservingTile) return;
    const collectionName = activeCategory === 'tiles' ? 'tiles' : 'ceramics';
    try {
        const updatedTile = { ...reservingTile, reservations: updatedReservations, isReserved: updatedReservations.length > 0 };
        
        // التحديث المحلي
        const updateLocalState = activeCategory === 'tiles' ? setPorcelainTiles : setCeramicTiles;
        updateLocalState(prev => prev.map(t => t.id === reservingTile.id ? updatedTile : t));

        logAction('حجز', reservingTile.name, `تم تحديث الحجوزات. عدد الحجوزات: ${updatedReservations.length}`);
        
        await db.collection(collectionName).doc(reservingTile.id).update({ 
            reservations: updatedReservations, 
            isReserved: updatedReservations.length > 0 
        });
        setReservingTile(null);
    } catch (e) { alert("فشل تحديث الحجوزات"); }
  }, [reservingTile, activeCategory]);

  const handleConfirmDelete = useCallback(async () => { 
      if (!deleteTargetId) return; 
      const collectionName = activeCategory === 'tiles' ? 'tiles' : 'ceramics';
      
      const targetList = activeCategory === 'tiles' ? porcelainTiles : ceramicTiles;
      const tileToDelete = targetList.find(t => t.id === deleteTargetId);
      
      // الحذف المحلي
      const updateLocalState = activeCategory === 'tiles' ? setPorcelainTiles : setCeramicTiles;
      updateLocalState(prev => prev.filter(t => t.id !== deleteTargetId));

      const idToDelete = deleteTargetId; 
      setDeleteTargetId(null); 
      setEditingTile(null);
      setScannedTileInfo(null);

      if (tileToDelete) {
          logAction('حذف', tileToDelete.name, 'تم حذف الصنف نهائياً');
      }

      try { 
          await db.collection(collectionName).doc(idToDelete).delete(); 
      } catch (e) { console.error(e); } 
  }, [deleteTargetId, activeCategory, porcelainTiles, ceramicTiles]);

  const handleScanSuccess = useCallback((decodedText: string) => {
    setIsScanning(false);
    let tileId = decodedText;
    try {
        if (decodedText.includes('tileId=')) {
            const url = new URL(decodedText);
            const idFromUrl = url.searchParams.get('tileId');
            if (idFromUrl) tileId = idFromUrl;
        }
    } catch (e) { console.log("Using raw text as ID"); }

    // البحث في كل من البورسلان والسيراميك
    let targetTile = porcelainTiles.find(x => x.id === tileId);
    if (targetTile) {
        if (activeCategory !== 'tiles') setActiveCategory('tiles'); // الانتقال التلقائي للقسم
    } else {
        targetTile = ceramicTiles.find(x => x.id === tileId);
        if (targetTile && activeCategory !== 'ceramics') setActiveCategory('ceramics'); // الانتقال التلقائي للقسم
    }

    if (targetTile) {
        setScannedTileInfo(targetTile);
    } else {
        alert('الصنف غير موجود في قاعدة البيانات');
    }
  }, [activeCategory, porcelainTiles, ceramicTiles]);

  const changeView = useCallback((newView: ViewMode) => {
      setEditingTile(null);
      setScannedTileInfo(null);
      setView(newView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // استخدام useMemo للقوائم المصفاة
  const filteredTiles = useMemo(() => {
      const query = (searchQuery || '').toLowerCase().trim(); 
      if (!query) return currentTiles;
      return currentTiles.filter(tile => 
          (tile.name || '').toLowerCase().includes(query) || 
          (tile.shade || '').toLowerCase().includes(query) || 
          (tile.quality || '').toLowerCase().includes(query) || 
          (tile.size || '').toLowerCase().includes(query) || 
          (tile.surface || '').toLowerCase().includes(query)
      );
  }, [currentTiles, searchQuery]);

  // دالة تصفية مستقلة للمجموعتين لضمان سرعة العرض
  const getDashboardTiles = (list: Tile[]) => {
      const query = (quickSearch || '').toLowerCase().trim();
      if (!query) return list;
      return list.filter(tile => 
          (tile.name || '').toLowerCase().includes(query) || 
          (tile.shade || '').toLowerCase().includes(query) || 
          (tile.size || '').toLowerCase().includes(query)
      );
  };
  
  // حساب القوائم بشكل منفصل
  const porcelainDashboardTiles = useMemo(() => getDashboardTiles(porcelainTiles), [porcelainTiles, quickSearch]);
  const ceramicDashboardTiles = useMemo(() => getDashboardTiles(ceramicTiles), [ceramicTiles, quickSearch]);

  const handlePrint = useCallback(() => { window.print(); }, []);

  if (authLoading) return <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900"><div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-4"></div><div className="text-sky-800 dark:text-sky-400 font-bold text-lg">جاري تحميل معرض عمار...</div></div>;
  if (!user) return <Login onLoginSuccess={(e) => setUser({email: e})} />;

  return (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen flex flex-col transition-colors duration-300" dir="rtl">
      <InstallPrompt />
      {/* نافذة طلب الاسم */}
      {showNamePrompt && <DeviceNameModal onSave={handleSaveDeviceName} />}

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex-grow w-full">
        <div className="no-print"><Header userEmail={user?.email} activeCategory={activeCategory} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></div>
        
        {/* التبويبات الملونة */}
        <div className="flex gap-4 mb-6 no-print">
            <button 
                onClick={() => { setActiveCategory('tiles'); setView('dashboard'); setQuickSearch(''); setShowQuickSearch(false); }}
                className={`
                    flex-1 py-3 rounded-[1.5rem] font-black text-lg shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 border-2
                    ${activeCategory === 'tiles' 
                        ? 'bg-gradient-to-br from-sky-500 to-sky-700 text-white ring-4 ring-sky-200 dark:ring-sky-900/50 border-transparent shadow-sky-200/50 dark:shadow-sky-900/50' 
                        : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700 hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-100 dark:hover:border-sky-800'
                    }
                `}
            >
                <div className="flex flex-col items-center gap-0.5">
                    <span>بورسلان</span>
                    {activeCategory === 'tiles' && <div className="w-6 h-1 bg-white/40 rounded-full mt-1 animate-pulse"></div>}
                </div>
            </button>

            <button 
                onClick={() => { setActiveCategory('ceramics'); setView('dashboard'); setQuickSearch(''); setShowQuickSearch(false); }}
                className={`
                    flex-1 py-3 rounded-[1.5rem] font-black text-lg shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 border-2
                    ${activeCategory === 'ceramics' 
                        ? 'bg-gradient-to-br from-rose-500 to-rose-700 text-white ring-4 ring-rose-200 dark:ring-rose-900/50 border-transparent shadow-rose-200/50 dark:shadow-rose-900/50' 
                        : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-100 dark:hover:border-rose-800'
                    }
                `}
            >
                <div className="flex flex-col items-center gap-0.5">
                    <span>سيراميك</span>
                    {activeCategory === 'ceramics' && <div className="w-6 h-1 bg-white/40 rounded-full mt-1 animate-pulse"></div>}
                </div>
            </button>
        </div>

        {view === 'logs' ? (
             <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6 no-print">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <HistoryIcon />
                        السجل
                    </h2>
                    <button onClick={() => changeView('dashboard')} className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-6 py-3 rounded-2xl shadow-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 font-black text-slate-600 dark:text-slate-300 transition-all active:scale-95">
                        <HomeIcon /> الرجوع للرئيسية
                    </button>
                </div>
                <LogHistory logs={logs} />
             </div>
        ) : view === 'dashboard' ? (
            <>
                <div className="no-print"><TileForm onSave={handleSaveTile} editingTile={editingTile} onCancel={() => setEditingTile(null)} onViewImage={setViewingImage} activeCategory={activeCategory} /></div>
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4 px-4">
                        <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-6 rounded-full ${activeCategory === 'tiles' ? 'bg-sky-600' : 'bg-rose-600'}`}></span>
                            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
                                {activeCategory === 'tiles' ? 'نظرة سريعة على البورسلان' : 'نظرة سريعة على السيراميك'}
                            </h2>
                            <button 
                                onClick={() => setShowQuickSearch(!showQuickSearch)}
                                className={`p-1.5 rounded-full transition-all ${showQuickSearch ? (activeCategory === 'tiles' ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400' : 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400') : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                title="بحث سريع في القائمة"
                            >
                                <SearchIcon />
                            </button>
                        </div>
                        
                        {showQuickSearch && (
                            <div className="animate-scale-in flex items-center">
                                <input 
                                    type="text" 
                                    autoFocus
                                    value={quickSearch}
                                    onChange={(e) => setQuickSearch(e.target.value)}
                                    placeholder="بحث سريع..." 
                                    className={`w-32 sm:w-48 text-xs font-bold px-3 py-1.5 rounded-lg border-2 outline-none transition-all ${activeCategory === 'tiles' ? 'border-sky-100 dark:border-sky-800 focus:border-sky-300 dark:focus:border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-slate-800 dark:text-slate-100' : 'border-rose-100 dark:border-rose-800 focus:border-rose-300 dark:focus:border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-slate-800 dark:text-slate-100'}`}
                                />
                                {quickSearch && (
                                    <button onClick={() => setQuickSearch('')} className="mr-1 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400">
                                        <small>✕</small>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* العرض الشرطي لإلغاء القائمة غير النشطة من الذاكرة */}
                    {activeCategory === 'tiles' ? (
                        <TileList 
                            tiles={porcelainDashboardTiles} 
                            loading={loading && porcelainTiles.length === 0}
                            onEdit={handleEditClick} 
                            onDelete={setDeleteTargetId} 
                            onOpenReservation={setReservingTile} 
                            onViewImage={setViewingImage} 
                            viewMode="preview" 
                            onShowQR={setShowingQRFor}
                            activeCategory="tiles"
                        />
                    ) : (
                        <TileList 
                            tiles={ceramicDashboardTiles} 
                            loading={loading && ceramicTiles.length === 0}
                            onEdit={handleEditClick} 
                            onDelete={setDeleteTargetId} 
                            onOpenReservation={setReservingTile} 
                            onViewImage={setViewingImage} 
                            viewMode="preview" 
                            onShowQR={setShowingQRFor}
                            activeCategory="ceramics"
                        />
                    )}

                </div>
                <div className="grid grid-cols-3 gap-4 mt-8 no-print">
                    <button onClick={() => setIsScanning(true)} className="bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-2 border-sky-100 dark:border-sky-800/50 p-6 rounded-[2.5rem] font-black flex flex-col justify-center items-center gap-3 shadow-xl hover:bg-sky-100 dark:hover:bg-sky-900/40 active:scale-95 transition-all group">
                        <CameraIcon /> 
                        <span className="text-sm group-hover:scale-105 transition-transform">مسح باركود</span>
                    </button>
                    <button onClick={() => changeView('fullList')} className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-100 dark:border-indigo-800/50 p-6 rounded-[2.5rem] font-black flex flex-col justify-center items-center gap-3 shadow-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 active:scale-95 transition-all group">
                        <ListIcon /> 
                        <span className="text-sm group-hover:scale-105 transition-transform">القائمة الكاملة</span>
                    </button>
                    <button onClick={() => changeView('logs')} className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-2 border-orange-100 dark:border-orange-800/50 p-6 rounded-[2.5rem] font-black flex flex-col justify-center items-center gap-3 shadow-xl hover:bg-orange-100 dark:hover:bg-orange-900/40 active:scale-95 transition-all group">
                        <HistoryIcon /> 
                        <span className="text-sm group-hover:scale-105 transition-transform">السجل</span>
                    </button>
                </div>
                <div className="no-print"><SummaryCards tiles={currentTiles} activeCategory={activeCategory} /></div>
            </>
        ) : (
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6 no-print">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
                        {activeCategory === 'tiles' ? 'قائمة البورسلان الكلية' : 'قائمة السيراميك الكلية'}
                    </h2>
                    <button onClick={() => changeView('dashboard')} className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-6 py-3 rounded-2xl shadow-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 font-black text-slate-600 dark:text-slate-300 transition-all active:scale-95"><HomeIcon /> الرجوع للرئيسية</button>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 mb-8 flex flex-col md:flex-row gap-4 no-print transition-colors">
                    <div className="flex-1"><SearchFilter searchQuery={searchQuery} onSearchChange={setSearchQuery} onScanClick={() => setIsScanning(true)} /></div>
                    <Toolbar onPrint={handlePrint} onExport={() => alert('ميزة الإكسل ستتوفر قريباً')} />
                </div>
                <div id="print-area">
                    <div className="hidden print:block text-center mb-5 border-b-2 border-black pb-2">
                        <h1 className="text-2xl font-black text-black">
                             {activeCategory === 'tiles' ? 'كشف مخزون البورسلان' : 'كشف مخزون السيراميك'}
                        </h1>
                    </div>
                    <TileList tiles={filteredTiles} onEdit={handleEditClick} onDelete={setDeleteTargetId} onOpenReservation={setReservingTile} onViewImage={setViewingImage} viewMode="full" onShowQR={setShowingQRFor} activeCategory={activeCategory} />
                </div>
            </div>
        )}
      </div>
      <Footer userEmail={user?.email} onLogout={() => auth.signOut()} />
      {viewingImage && <ImageModal src={viewingImage} onClose={() => setViewingImage(null)} />}
      {reservingTile && <ReservationModal tile={reservingTile} onClose={() => setReservingTile(null)} onUpdateReservations={handleUpdateReservations} />}
      {showingQRFor && <QRModal tile={showingQRFor} onClose={() => setShowingQRFor(null)} />}
      {isScanning && <QRScanner onScanSuccess={handleScanSuccess} onClose={() => setIsScanning(false)} />}
      {deleteTargetId && <ConfirmModal isOpen={!!deleteTargetId} onClose={() => setDeleteTargetId(null)} onConfirm={handleConfirmDelete} message="هل تريد حذف هذا الصنف من النظام بشكل نهائي؟" />}
      {scannedTileInfo && <ScanResultModal tile={scannedTileInfo} onClose={() => setScannedTileInfo(null)} onEdit={(t) => { setScannedTileInfo(null); handleEditClick(t); }} />}
    </div>
  );
};

export default App;
