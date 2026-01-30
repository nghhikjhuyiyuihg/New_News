
import React from 'react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onClick: (article: Article) => void;
  variant?: 'hero' | 'grid' | 'small';
  isAdmin?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  onClick, 
  variant = 'grid',
  isAdmin
}) => {
  const formattedDate = new Date(article.createdAt).toLocaleString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short'
  });

  if (variant === 'hero') {
    return (
      <div 
        onClick={() => onClick(article)}
        className="relative group cursor-pointer overflow-hidden rounded-[2.5rem] bg-black aspect-[21/9] shadow-2xl border border-gray-800"
      >
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[1500ms] ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16 z-10">
          <div className="flex flex-wrap gap-3 mb-6 items-center">
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-2.5 rounded-full shadow-lg shadow-indigo-900/40 flex items-center justify-center border border-indigo-400/30 group-hover:rotate-12 transition-transform duration-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>
            {article.isBreaking && (
              <span className="bg-red-600 text-white text-[10px] font-black px-5 py-2 rounded-full animate-pulse tracking-widest uppercase shadow-lg shadow-red-900/40">מבזק</span>
            )}
            <span className="bg-blue-600 text-white text-[10px] font-black px-5 py-2 rounded-full tracking-widest uppercase shadow-lg shadow-blue-900/40">{article.category}</span>
          </div>
          <h2 className="text-white text-4xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tighter group-hover:italic transition-all duration-500">{article.title}</h2>
          <p className="text-gray-300 text-xl md:text-2xl max-w-4xl line-clamp-2 mb-8 font-medium leading-relaxed">{article.subtitle}</p>
          <div className="flex items-center gap-4 text-gray-400 text-sm font-black uppercase tracking-widest">
            <span>{article.author}</span>
            <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(article)}
      className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group relative flex flex-col h-full"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute top-5 right-5 flex flex-col gap-2 items-end z-10">
          <div className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-blue-700 border border-blue-50 shadow-lg tracking-widest uppercase">
            {article.category}
          </div>
          {article.isBreaking && (
            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-[9px] font-black animate-pulse shadow-md uppercase tracking-wider">
              מבזק
            </div>
          )}
        </div>
      </div>
      <div className="p-8 flex flex-col flex-1">
        <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-blue-700 transition-colors leading-[1.2] line-clamp-2 tracking-tighter">
          {article.title}
        </h3>
        <p className="text-gray-500 text-base mb-8 line-clamp-2 leading-relaxed font-medium">
          {article.subtitle}
        </p>
        <div className="mt-auto flex justify-between items-center text-[10px] text-gray-400 font-black uppercase tracking-widest border-t border-gray-50 pt-6">
          <span className="text-gray-900">{article.author}</span>
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};
