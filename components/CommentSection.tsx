
import React, { useState } from 'react';
import { Comment, User } from '../types';

interface CommentSectionProps {
  comments: Comment[];
  currentUser: User | null;
  onAddComment: (text: string) => void;
  onDeleteComment: (commentId: string) => void;
  isAdmin: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ 
  comments, 
  currentUser, 
  onAddComment, 
  onDeleteComment,
  isAdmin 
}) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment('');
  };

  return (
    <div className="mt-16 pt-12 border-t border-gray-100">
      <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
        תגובות 
        <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">{comments.length}</span>
      </h3>

      <div className="space-y-8 mb-12">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                {comment.userName[0].toUpperCase()}
              </div>
              <div className="flex-1 bg-gray-50 rounded-2xl p-4 relative group">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-black text-gray-900 text-sm">{comment.userName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">
                      {new Date(comment.createdAt).toLocaleDateString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {(isAdmin || (currentUser && currentUser.name === comment.userName)) && (
                      <button 
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">{comment.text}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">אין עדיין תגובות. תהיו הראשונים להגיב!</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        {currentUser ? (
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-bold text-gray-700 mb-3">הוספת תגובה</label>
            <div className="relative">
              <textarea 
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] resize-none text-sm transition-all"
                placeholder="מה דעתך על הכתבה?"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute left-3 bottom-3 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md active:scale-95"
              >
                שלח תגובה
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 font-bold mb-2">עליך להתחבר כדי להגיב</p>
            <p className="text-xs text-gray-400">ההתחברות מהירה ומאפשרת לך לנהל את התגובות שלך</p>
          </div>
        )}
      </div>
    </div>
  );
};
