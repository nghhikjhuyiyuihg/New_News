
import React, { useState } from 'react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

const ADMIN_SECRET_CODE = '1234';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (!isOpen) return null;

  const getUsers = () => JSON.parse(localStorage.getItem('registered_users') || '[]');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return alert('נא למלא את כל השדות');
    
    const users = getUsers();

    if (mode === 'login') {
      const user = users.find((u: any) => u.username === username && u.password === password);
      if (user) {
        onLogin({ 
          id: user.id, 
          username: user.username, 
          name: user.username, 
          role: user.role 
        });
        onClose();
        // Reset form
        setUsername('');
        setPassword('');
      } else {
        alert('שם משתמש או סיסמה לא נכונים. במידה ולא נרשמת, עבור ללשונית ההרשמה.');
      }
    } else {
      if (users.some((u: any) => u.username === username)) return alert('שם משתמש זה כבר תפוס');
      
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        password,
        role: adminCode === ADMIN_SECRET_CODE ? 'admin' : 'user'
      };

      localStorage.setItem('registered_users', JSON.stringify([...users, newUser]));
      alert(newUser.role === 'admin' ? 'נרשמת בהצלחה כמנהל!' : 'נרשמת בהצלחה! כעת ניתן להתחבר');
      setMode('login');
      setAdminCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-gray-100 overflow-hidden relative">
        <button onClick={onClose} className="absolute top-6 left-6 text-gray-400 hover:text-gray-900 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            {mode === 'login' ? 'ברוך הבא' : 'הצטרף אלינו'}
          </h2>
          <p className="text-gray-500 font-medium">חדשות אמת - עדכונים בזמן אמת</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 mr-1">שם משתמש</label>
            <input 
              type="text" 
              placeholder="בחר שם משתמש" 
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 mr-1">סיסמה</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          {mode === 'register' && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 mr-1 text-blue-600">קוד מנהל סודי (אופציונלי)</label>
              <input 
                type="text" 
                placeholder="הזן קוד אם יש לך הרשאות" 
                className="w-full p-4 bg-blue-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold placeholder:text-blue-300" 
                value={adminCode} 
                onChange={e => setAdminCode(e.target.value)} 
              />
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-blue-700 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-800 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
          >
            {mode === 'login' ? 'כניסה למערכת' : 'הרשמה מהירה'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')} 
            className="text-gray-500 font-bold hover:text-blue-700 transition-colors"
          >
            {mode === 'login' ? (
              <>אין לך חשבון? <span className="text-blue-700">הירשם כאן</span></>
            ) : (
              <>כבר יש לך חשבון? <span className="text-blue-700">התחבר כאן</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
