
import React, { useEffect, useRef, useState } from 'react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onClose }) => {
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    let startPromise: Promise<any> | null = null;

    const startScanner = async () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const Html5Qrcode = (window as any).Html5Qrcode;
            
            if (!Html5Qrcode) {
                if(isMountedRef.current) setScanError("مكتبة المسح غير متوفرة.");
                return;
            }

            // إنشاء الماسح
            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;

            // بدء المسح فوراً باستخدام الكاميرا الخلفية
            startPromise = html5QrCode.start(
                { facingMode: "environment" }, // إجبار الكاميرا الخلفية
                {
                    fps: 10, // عدد الإطارات في الثانية
                    qrbox: { width: 250, height: 250 }, // حجم مربع المسح
                    aspectRatio: 1.0
                },
                (decodedText: string) => {
                    // عند النجاح
                     if (isMountedRef.current) {
                        onScanSuccess(decodedText);
                    }
                },
                (errorMessage: string) => {
                    // تجاهل أخطاء عدم وجود كود في الإطار الحالي
                }
            );
            
            await startPromise;

        } catch (e: any) {
            console.error("Scanner error", e);
            if(isMountedRef.current) {
                const errorStr = String(e).toLowerCase();
                if (e?.name === 'NotAllowedError' || errorStr.includes('permission dismissed') || errorStr.includes('notallowederror')) {
                    setScanError("تم رفض صلاحية الوصول للكاميرا. يرجى السماح بفتح الكاميرا للمسح.");
                } else {
                    setScanError("حدث خطأ أثناء تشغيل الكاميرا. يرجى التأكد من توفر كاميرا ومنح الصلاحيات.");
                }
            }
        }
    };

    // تأخير بسيط لضمان جاهزية العنصر DOM
    const timeoutId = setTimeout(startScanner, 100);

    return () => {
        isMountedRef.current = false;
        clearTimeout(timeoutId);
        
        const stopScanner = async () => {
            if (scannerRef.current) {
                try {
                    if (startPromise) {
                        await startPromise.catch(() => {});
                    }
                    
                    const state = typeof scannerRef.current.getState === 'function' ? scannerRef.current.getState() : -1;
                    const isScanning = scannerRef.current.isScanning || state === 2; // 2 is SCANNING state
                    
                    if (isScanning) {
                        await scannerRef.current.stop();
                    }
                } catch (err: any) {
                    if (err?.message !== "Cannot stop, scanner is not running or paused.") {
                        console.warn("QR scanner stop failed:", err);
                    }
                }
            }
        };
        
        stopScanner();
    };
  }, [onScanSuccess]);

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-[9999] p-4"
        onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl p-2 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
          {/* زر الإغلاق */}
          <button 
            onClick={onClose} 
            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-md z-20 hover:bg-red-600"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 text-center">جاري المسح...</h3>
          
          <div className="relative bg-black rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center">
             {scanError ? (
                 <div className="text-white p-4 text-center">
                     <p className="text-red-400 font-bold mb-2">تنبيه:</p>
                     {scanError}
                 </div>
             ) : (
                 <div id="reader" className="w-full h-full"></div>
             )}
          </div>
          
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">وجه الكاميرا نحو رمز الـ QR</p>
      </div>
    </div>
  );
};

export default QRScanner;
