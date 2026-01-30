import React from 'react';
import { User, Category } from '../types';

interface NavbarProps {
  user: User | null;
  activeCategory: Category | 'home';
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onLoginClick: () => void;
  onLogout: () => void;
  onAdminClick: () => void;
  onHomeClick: () => void;
  onCategoryClick: (category: Category) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  activeCategory,
  searchQuery,
  onSearchChange,
  onLoginClick, 
  onLogout, 
  onAdminClick, 
  onHomeClick,
  onCategoryClick
}) => {
  const categories: Category[] = ['פוליטיקה', 'כלכלה', 'טכנולוגיה', 'ספורט', 'תרבות', 'בריאות'];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl z-[100] border-b border-gray-100 h-20 flex items-center shadow-sm">
      <div className="container mx-auto px-6 flex justify-between items-center gap-6">
        <div className="flex items-center gap-10 flex-1">
          <div 
            onClick={onHomeClick}
            className="text-2xl font-black text-gray-900 cursor-pointer tracking-tighter flex items-center gap-2 group"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-base shadow-lg shadow-blue-200 group-hover:rotate-12 transition-transform">א</div>
            חדשות<span className="text-blue-600">אמת</span>
          </div>

          <div className="relative hidden md:block max-w-xs w-full group">
            <input 
              type="text" 
              placeholder="חפש בחדשות אמת..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-2.5 px-5 pr-10 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all text-right"
              dir="rtl"
            />
            <svg className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          
          <div className="hidden lg:flex gap-6 text-[11px] font-black uppercase tracking-widest text-gray-400">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => onCategoryClick(cat)}
                className={`transition-all border-b-4 py-2 ${activeCategory === cat ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-900 hover:border-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-5">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">מחובר כעת</span>
                <span className="text-xs font-black text-gray-900 leading-tight">{user.name}</span>
              </div>
              
              <div className="flex items-center gap-3 border-r border-gray-100 pr-4">
                {user.role === 'admin' && (
                  <button 
                    onClick={onAdminClick}
                    className="bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95"
                  >
                    כתבה חדשה
                  </button>
                )}
                <button 
                  onClick={onLogout} 
                  className="bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all p-2.5 rounded-xl border border-gray-100"
                  title="התנתק מהמערכת"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="bg-blue-600 text-white px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
            >
              כניסה לאתר
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
