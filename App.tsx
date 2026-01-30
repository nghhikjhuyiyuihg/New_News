
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Article, User, Category, Comment } from './types';
import { Navbar } from './components/Navbar';
import { ArticleCard } from './components/ArticleCard';
import { NewsEditor } from './components/NewsEditor';
import { AuthModal } from './components/AuthModal';
import { CommentSection } from './components/CommentSection';
import { subscribeToArticles, addArticleToDB, updateArticleInDB, saveArticlesToDB } from './services/storageService';
import { textToSpeech } from './services/geminiService';

const DEFAULT_ARTICLES: Article[] = [
  {
    id: 'default-1',
    title: 'מהפכת הבינה המלאכותית: האם הרובוטים בדרך להחליף את העיתונאים?',
    subtitle: 'מחקר חדש חושף כיצד כלי ה-AI משנים את פני המדיה העולמית.',
    content: 'עולם העיתונות עובר טלטלה משמעותית בשנה האחרונה. עם כניסתם של מודלים שפתיים מתקדמים, מערכות חדשות רבות החלו להטמיע כלים אוטומטיים ליצירת תוכן.',
    author: 'מערכת חדשות אמת',
    category: 'טכנולוגיה',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200',
    createdAt: Date.now() - 10000,
    comments: [],
    isBreaking: false
  },
  {
    id: 'default-2',
    title: 'משבר הדיור: האם המחירים בדרך לירידה משמעותית?',
    subtitle: 'נתונים חדשים מראים האטה בשוק הנדל"ן המקומי.',
    content: 'אחרי שנים של עליות בלתי פוסקות, נראה כי שוק הנדל"ן מתחיל להראות סימני התקררות.',
    author: 'אבי כהן',
    category: 'כלכלה',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
    createdAt: Date.now() - 50000,
    comments: [],
    isBreaking: false
  }
];

function decodeBase64(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('news_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState<'home' | 'admin' | 'article'>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'home'>('home');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToArticles((updatedArticles) => {
      if (updatedArticles.length === 0) {
        // אם אין כלום גם בלוקאל וגם בענן, נטען ברירת מחדל
        const savedLocal = localStorage.getItem('news_articles_backup');
        if (!savedLocal || JSON.parse(savedLocal).length === 0) {
          setArticles(DEFAULT_ARTICLES);
        } else {
          setArticles(JSON.parse(savedLocal));
        }
      } else {
        setArticles(updatedArticles);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const breakingNews = useMemo(() => {
    return articles.filter(a => {
      if (!a.isBreaking) return false;
      if (a.breakingExpiry && a.breakingExpiry < currentTime) return false;
      return true;
    });
  }, [articles, currentTime]);

  const handlePlayAudio = async (article: Article) => {
    if (isPlaying) {
      sourceNodeRef.current?.stop();
      setIsPlaying(false);
      return;
    }
    setIsAudioLoading(true);
    try {
      const base64 = await textToSpeech(`${article.title}. ${article.content}`);
      if (!base64) throw new Error("No audio returned");
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const audioBuffer = await decodeAudioData(decodeBase64(base64), audioContextRef.current);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      sourceNodeRef.current = source;
      source.start();
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
      alert("נכשלה השמעת הכתבה.");
    } finally {
      setIsAudioLoading(false);
    }
  };

  const filteredArticles = useMemo(() => {
    let result = articles;
    if (selectedCategory !== 'home') {
      result = result.filter(a => a.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.content.toLowerCase().includes(q) || 
        a.subtitle.toLowerCase().includes(q)
      );
    }
    return result;
  }, [articles, selectedCategory, searchQuery]);

  const heroArticle = useMemo(() => 
    selectedCategory === 'home' && searchQuery === '' && articles.length > 0 ? articles[0] : null, 
  [articles, selectedCategory, searchQuery]);

  const listArticles = useMemo(() => 
    (selectedCategory === 'home' && searchQuery === '') ? filteredArticles.slice(1) : filteredArticles,
  [filteredArticles, selectedCategory, searchQuery]);

  const handlePublish = async (newArticle: Article) => {
    await addArticleToDB(newArticle);
    setView('home');
  };

  const handleArticleClick = (article: Article) => {
    if (isPlaying) {
      sourceNodeRef.current?.stop();
      setIsPlaying(false);
    }
    setSelectedArticle(article);
    setView('article');
    window.scrollTo(0, 0);
  };

  const handleAddComment = async (text: string) => {
    if (!selectedArticle || !currentUser) return;
    const newComment: Comment = { 
      id: Math.random().toString(36).substr(2, 9), 
      userName: currentUser.name, 
      text, 
      createdAt: Date.now() 
    };
    const updated = { 
      ...selectedArticle, 
      comments: [...(selectedArticle.comments || []), newComment] 
    };
    await updateArticleInDB(updated);
  };

  useEffect(() => {
    if (selectedArticle) {
      const latest = articles.find(a => a.id === selectedArticle.id);
      if (latest) {
        setSelectedArticle(latest);
      }
    }
  }, [articles]);

  const handleDeleteComment = async (cid: string) => {
    if (!selectedArticle) return;
    const updated = { 
      ...selectedArticle, 
      comments: (selectedArticle.comments || []).filter(c => c.id !== cid) 
    };
    await updateArticleInDB(updated);
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 relative font-['Heebo']">
      <Navbar 
        user={currentUser} 
        activeCategory={selectedCategory} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLoginClick={() => setIsAuthModalOpen(true)} 
        onLogout={() => {setCurrentUser(null); localStorage.removeItem('news_user');}} 
        onAdminClick={() => setView('admin')} 
        onHomeClick={() => {setView('home'); setSelectedCategory('home'); setSearchQuery('');}} 
        onCategoryClick={(c) => {setSelectedCategory(c); setView('home');}} 
      />
      
      <main className="container mx-auto px-4 pt-24 max-w-6xl">
        {breakingNews.length > 0 && view === 'home' && (
          <div className="mb-8 bg-white border border-red-100 rounded-2xl p-0.5 shadow-sm overflow-hidden flex items-center gap-4 group">
            <div className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse flex-shrink-0 z-10 shadow-lg shadow-red-200">
              מבזק חם
            </div>
            <div className="flex-1 overflow-hidden relative h-10 flex items-center">
              <div className="flex gap-16 whitespace-nowrap animate-ticker-scroll hover:[animation-play-state:paused] cursor-pointer">
                {breakingNews.map(a => (
                  <span 
                    key={a.id} 
                    onClick={() => handleArticleClick(a)} 
                    className="text-sm font-bold text-gray-800 hover:text-red-600 transition-colors flex items-center gap-3"
                  >
                    <span className="text-red-500 font-black">●</span>
                    {a.title}
                    <span className="text-gray-300 text-[10px] mr-2">
                      {new Date(a.createdAt).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'home' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {heroArticle && <ArticleCard article={heroArticle} variant="hero" onClick={handleArticleClick} />}
            {listArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {listArticles.map(a => <ArticleCard key={a.id} article={a} onClick={handleArticleClick} />)}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400 font-bold">לא נמצאו כתבות התואמות את החיפוש.</div>
            )}
          </div>
        )}

        {view === 'admin' && currentUser?.role === 'admin' && (
          <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-500">
            <NewsEditor onPublish={handlePublish} author={currentUser.name} />
          </div>
        )}

        {view === 'article' && selectedArticle && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
            <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100">
              <div className="relative h-[400px]">
                <img src={selectedArticle.imageUrl} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
              </div>
              <div className="p-12 -mt-20 relative bg-white rounded-t-[4rem]">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex gap-3">
                    <span className="bg-blue-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">{selectedArticle.category}</span>
                    {selectedArticle.isBreaking && (
                       <span className="bg-red-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse">מבזק</span>
                    )}
                  </div>
                  <button 
                    onClick={() => handlePlayAudio(selectedArticle)}
                    disabled={isAudioLoading}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black transition-all ${isPlaying ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {isAudioLoading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : isPlaying ? (
                      <>עצור האזנה</>
                    ) : (
                      <>האזן לכתבה</>
                    )}
                  </button>
                </div>
                
                <h1 className="text-5xl font-black mb-8 leading-[1.1] text-gray-900 tracking-tighter">{selectedArticle.title}</h1>
                <p className="text-xl text-gray-500 font-bold mb-12 border-r-[8px] border-blue-600 pr-6 leading-relaxed italic">{selectedArticle.subtitle}</p>
                
                <div className="prose prose-2xl max-w-none text-gray-800 leading-[1.8] whitespace-pre-wrap mb-20">
                  {selectedArticle.content}
                </div>

                <div className="flex items-center gap-4 text-gray-400 text-sm font-black uppercase tracking-widest border-t border-gray-50 pt-12">
                  <span>כתב: {selectedArticle.author}</span>
                  <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                  <span>פורסם ב: {new Date(selectedArticle.createdAt).toLocaleDateString('he-IL')}</span>
                </div>

                <CommentSection 
                  comments={selectedArticle.comments || []} 
                  currentUser={currentUser} 
                  isAdmin={currentUser?.role === 'admin'} 
                  onAddComment={handleAddComment} 
                  onDeleteComment={handleDeleteComment} 
                />
              </div>
            </div>
          </div>
        )}
      </main>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={(u) => {setCurrentUser(u); localStorage.setItem('news_user', JSON.stringify(u));}} 
      />
      
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        .animate-ticker-scroll {
          animation: ticker-scroll 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
