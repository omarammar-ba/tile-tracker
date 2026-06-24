import React, { useState, useEffect } from 'react';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsVisible(false);
    }
    
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-sky-600 dark:bg-sky-800 text-white p-4 mb-4 rounded-lg shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 no-print mx-4 mt-4 border-2 border-white dark:border-slate-700">
      <div className="text-center sm:text-right">
        <h3 className="font-bold text-lg">تثبيت التطبيق</h3>
        <p className="text-sky-100 dark:text-sky-200 text-sm">للحصول على تجربة أفضل وبدون إنترنت، قم بتثبيت التطبيق الآن.</p>
      </div>
      <button
        onClick={handleInstallClick}
        className="bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-400 px-6 py-2 rounded-full font-bold shadow-md hover:bg-sky-50 dark:hover:bg-slate-700 transition-transform transform hover:scale-105 whitespace-nowrap"
      >
        تنزيل على الهاتف 📲
      </button>
    </div>
  );
};

export default InstallPrompt;