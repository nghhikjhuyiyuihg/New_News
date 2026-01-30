
import React, { useState } from 'react';
import { Category, Article } from '../types';
import { generateNewsSummary, generateAiImage, generateFullArticleContent } from '../services/geminiService';

interface NewsEditorProps {
  onPublish: (article: Article) => void;
  author: string;
}

export const NewsEditor: React.FC<NewsEditorProps> = ({ onPublish, author }) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('פוליטיקה');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=800');
  const [isBreaking, setIsBreaking] = useState(false);
  const [breakingHours, setBreakingHours] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  const categories: Category[] = ['פוליטיקה', 'ספורט', 'טכנולוגיה', 'תרבות', 'כלכלה', 'בריאות'];

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return alert("אנא הזן כותרת ותוכן.");
    
    const now = Date.now();
    onPublish({
      id: Math.random().toString(36).substr(2, 9),
      title,
      subtitle,
      content,
      author,
      category,
      imageUrl,
      isBreaking,
      breakingExpiry: isBreaking ? now + (breakingHours * 60 * 60 * 1000) : undefined,
      createdAt: now,
      comments: []
    });
  };

  const handleAutoGenerate = async () => {
    if (!title) return alert("אנא הזן כותרת כדי לייצר תוכן.");
    setIsGenerating(true);
    try {
      const fullContent = await generateFullArticleContent(title);
      setContent(fullContent);
      const summary = await generateNewsSummary(fullContent);
      setSubtitle(summary);
      
      handleGenerateImage();
    } catch (e) { 
      alert("שגיאה בייצור התוכן."); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  const handleGenerateImage = async () => {
    if (!title) return alert("אנא הזן כותרת כדי לייצר תמונה מתאימה.");
    setIsGeneratingImg(true);
    try {
      const img = await generateAiImage(title);
      if (img) setImageUrl(img);
    } catch (e) {
      alert("שגיאה בייצור התמונה.");
    } finally {
      setIsGeneratingImg(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900">יצירת כתבה חדשה</h2>
          <p className="text-gray-400 font-medium text-sm">הזן פרטים או השתמש בבינה מלאכותית</p>
        </div>
        <button 
          type="button" 
          onClick={handleAutoGenerate}
          disabled={isGenerating || !title}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
        >
          {isGenerating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : "✨ ייצור כתבה ב-AI"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handlePublish} className="lg:col-span-2 space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 mr-2">כותרת הכתבה</label>
            <input 
              className="w-full p-5 bg-gray-50 border-0 rounded-2xl outline-none font-bold text-xl focus:ring-2 focus:ring-blue-600 transition-all" 
              placeholder="הזן כותרת מרתקת..."
              value={title} onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 mr-2">כותרת משנה</label>
            <input 
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none font-medium focus:ring-2 focus:ring-blue-600 transition-all" 
              placeholder="תיאור קצר של המתרחש"
              value={subtitle} onChange={e => setSubtitle(e.target.value)}
            />
          </div>

          <div className="space-y-4 bg-red-50/50 p-6 rounded-3xl border border-red-100">
            <div className="flex items-center gap-4">
              <input 
                type="checkbox" 
                id="isBreaking"
                checked={isBreaking}
                onChange={e => setIsBreaking(e.target.checked)}
                className="w-6 h-6 accent-red-600 rounded-lg cursor-pointer"
              />
              <label htmlFor="isBreaking" className="font-black text-red-900 cursor-pointer text-base">סמן ככתבת מבזק (Breaking News)</label>
            </div>

            {isBreaking && (
              <div className="pt-4 border-t border-red-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-black uppercase tracking-widest text-red-600">משך זמן המבזק</label>
                  <span className="text-sm font-black text-red-700 bg-red-100 px-3 py-1 rounded-full">
                    {breakingHours} שעות
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="24" 
                  value={breakingHours}
                  onChange={(e) => setBreakingHours(parseInt(e.target.value))}
                  className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                <div className="flex justify-between text-[10px] text-red-400 font-bold">
                  <span>שעה אחת</span>
                  <span>12 שעות</span>
                  <span>24 שעות</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 mr-2">גוף הכתבה</label>
            <textarea 
              className="w-full p-5 bg-gray-50 border-0 rounded-2xl outline-none min-h-[300px] focus:ring-2 focus:ring-blue-600 transition-all" 
              placeholder="כתוב את הכתבה כאן..."
              value={content} onChange={e => setContent(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 mr-2">קטגוריה</label>
              <select 
                className="w-full p-4 bg-gray-50 border-0 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all appearance-none" 
                value={category} onChange={e => setCategory(e.target.value as Category)}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 mr-2">כתובת תמונה (URL)</label>
              <input 
                className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-blue-600 transition-all" 
                placeholder="https://images..."
                value={imageUrl} onChange={e => setImageUrl(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-black text-white py-5 rounded-2xl font-black text-xl hover:bg-gray-900 transition-all shadow-xl active:scale-[0.98]">
            פרסם כתבה באתר
          </button>
        </form>

        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-24">
            <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-200">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 text-center">תצוגה מקדימה של התמונה</h3>
              
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 group bg-gray-200 border border-gray-300">
                <img 
                  src={imageUrl} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  alt="Preview" 
                  onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800')}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="text-white text-[10px] font-black uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">תצוגה מקדימה</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleGenerateImage}
                disabled={isGeneratingImg || !title}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 mb-4"
              >
                {isGeneratingImg ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    ייצור תמונת AI
                  </>
                )}
              </button>
              <p className="text-[10px] text-gray-400 text-center font-bold">התמונה נוצרת בהתאם לכותרת הכתבה</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
