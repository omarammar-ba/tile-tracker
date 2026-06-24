import React from 'react';
import { Tile } from '../types';
import { PrintIcon } from './Icons';

interface QRModalProps {
  tile: Tile;
  onClose: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ tile, onClose }) => {
  const currentUrl = window.location.origin;
  const qrData = `${currentUrl}?tileId=${tile.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;
  const displaySize = tile.size || '120*60';
  
  const handlePrint = () => {
    // إنشاء محتوى الطباعة
    const printContent = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <title>ملصق - ${tile.name}</title>
            <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
            <style>
                body { 
                    font-family: 'Tajawal', sans-serif; 
                    margin: 0; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    height: 100vh; 
                    background: #fff;
                }
                .label-container { 
                    width: 380px; 
                    border: 4px solid #000; 
                    padding: 2rem; 
                    text-align: center; 
                    border-radius: 1rem;
                }
                .header { font-size: 16px; font-weight: 700; color: #666; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                .tile-name { font-size: 32px; font-weight: 900; margin: 15px 0; color: #000; text-transform: uppercase; line-height: 1.1; }
                .specs { display: flex; justify-content: center; gap: 15px; font-size: 18px; font-weight: 800; color: #000; margin-bottom: 20px; }
                .shade-box { 
                    background: #000; 
                    color: #fff; 
                    display: inline-block; 
                    padding: 8px 30px; 
                    border-radius: 8px; 
                    font-weight: 900; 
                    font-size: 24px;
                    margin-bottom: 25px;
                }
                .qr-wrapper { display: flex; justify-content: center; margin-bottom: 15px; }
                img { width: 200px; height: 200px; }
                .footer-id { font-size: 12px; color: #000; font-family: monospace; font-weight: bold; margin-top: 10px; }
            </style>
        </head>
        <body>
             <div class="label-container">
                <div class="header">معرض عمار للسيراميك</div>
                <div class="tile-name">${tile.name}</div>
                <div class="specs">
                  <span>${displaySize}</span> | 
                  <span>${tile.quality}</span> | 
                  <span>${tile.surface}</span>
                </div>
                <div class="shade-box">الشيد: ${tile.shade || '---'}</div>
                <div class="qr-wrapper">
                    <img src="${qrCodeUrl}" alt="QR Code" />
                </div>
                <div class="footer-id">ID: ${tile.id.substring(0, 8)}</div>
            </div>
            <script>
                // طباعة تلقائية عند تحميل الصورة
                window.onload = function() {
                    // تأخير بسيط لضمان تحميل الصورة
                    setTimeout(function() {
                        window.print();
                        window.close();
                    }, 500);
                }
            </script>
        </body>
        </html>
    `;

    // استخدام نافذة جديدة بدلاً من iframe لضمان عدم حظر الطباعة
    const printWindow = window.open('', '_blank', 'width=500,height=600');
    if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
    } else {
        alert('الرجاء السماح للنوافذ المنبثقة (Pop-ups) للتمكن من الطباعة');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-[150] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative animate-scale-in border border-white/20 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
        <div className="w-16 h-1 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto mb-6"></div>
        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">{tile.name}</h3>
        <p className="text-sm font-bold text-slate-400 dark:text-slate-300 mb-6 bg-slate-50 dark:bg-slate-700/50 py-1 rounded-full border border-slate-100 dark:border-slate-600 uppercase tracking-widest">
            {displaySize} • {tile.quality} • {tile.shade || 'بدون شيد'}
        </p>
        
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-600 shadow-inner flex justify-center mb-8">
            <img src={qrCodeUrl} alt="QR Code" className="w-52 h-52 object-contain" />
        </div>
        
        <div className="flex flex-col gap-3 no-print">
            <button onClick={handlePrint} className="w-full py-4 bg-sky-600 text-white rounded-2xl font-black shadow-xl shadow-sky-100 dark:shadow-sky-900/50 hover:bg-sky-700 transition-all flex items-center justify-center gap-2">
                <PrintIcon /> طباعة ملصق المستودع
            </button>
            <button onClick={onClose} className="w-full py-3 text-slate-400 dark:text-slate-500 font-bold hover:text-slate-600 dark:hover:text-slate-300 transition-colors">إغلاق المعاينة</button>
        </div>
      </div>
    </div>
  );
};

export default QRModal;