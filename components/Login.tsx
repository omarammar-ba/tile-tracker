import React, { useState } from 'react';
import { auth, isFirebaseConfigured } from '../firebase';

interface LoginProps {
  onLoginSuccess: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Fallback for development if firebase is not configured
    if (!isFirebaseConfigured) {
        onLoginSuccess('manager@ammar.com');
        return;
    }

    try {
      await auth.signInWithEmailAndPassword(email, password);
      // Success is handled by onAuthStateChanged listener in App.tsx
    } catch (err: any) {
      let errorMessage = 'فشل تسجيل الدخول. يرجى التحقق من البيانات والمحاولة مرة أخرى.';
      // More specific error messages for better UX
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      } else if (err.code === 'auth/network-request-failed') {
          errorMessage = 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.';
      }
      setError(errorMessage);
      setLoading(false); // Re-enable the button
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4 transition-colors" dir="rtl">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-sky-600 dark:border-sky-500">
        
        <div className="text-center mb-8">
            <div className="w-20 h-20 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">تسجيل الدخول</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">نظام إدارة مخزون البلاط</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">البريد الإلكتروني</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                    placeholder="name@example.com"
                    required
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">كلمة المرور</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                    placeholder="••••••••"
                    required
                />
            </div>

            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white font-bold py-3 rounded-lg shadow-md transition-all disabled:bg-sky-400 dark:disabled:bg-sky-700 disabled:cursor-not-allowed"
            >
                {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
        </form>

      </div>
    </div>
  );
};

export default Login;
