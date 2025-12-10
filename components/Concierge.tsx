import React, { useState } from 'react';
import { Sparkles, Send, X, Bot, Loader2 } from 'lucide-react';
import { getGeminiRecommendation } from '../services/geminiService';
import { MOCK_APPS } from '../constants';

interface ConciergeProps {
  isOpen: boolean;
  onClose: () => void;
  onRecommend: (appId: string) => void;
}

export const Concierge: React.FC<ConciergeProps> = ({ isOpen, onClose, onRecommend }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<{ message: string; appId: string | null } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const result = await getGeminiRecommendation(query);
      setResponse({
        message: result.message,
        appId: result.recommendedAppId
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendClick = () => {
    if (response?.appId) {
      onRecommend(response.appId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold">AI コンシェルジュ</h3>
              <p className="text-indigo-100 text-sm">あなたにぴったりのアプリをご提案します</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto bg-gray-50 space-y-4">
          {/* Initial Message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Bot size={18} className="text-indigo-600" />
            </div>
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-gray-700 text-sm">
              こんにちは！どんなアプリをお探しですか？<br />
              「計算が苦手」「法律の相談がしたい」「暇つぶししたい」など、お気軽に話しかけてください。
            </div>
          </div>

          {/* User Input Display (if submitting) */}
          {isLoading && (
             <div className="flex gap-3 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
              </div>
               <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm text-sm">
                 {query}
               </div>
             </div>
          )}

           {/* Loading State */}
          {isLoading && (
            <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Bot size={18} className="text-indigo-600" />
              </div>
               <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-gray-500 text-sm flex items-center gap-2">
                 <Loader2 className="w-4 h-4 animate-spin" />
                 考え中...
               </div>
            </div>
          )}

          {/* AI Response */}
          {!isLoading && response && (
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Bot size={18} className="text-indigo-600" />
              </div>
              <div className="space-y-2 max-w-[85%]">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-gray-700 text-sm whitespace-pre-wrap">
                  {response.message}
                </div>
                {response.appId && (
                   <button 
                    onClick={handleRecommendClick}
                    className="w-full bg-white border border-indigo-200 p-3 rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-3 group text-left shadow-sm"
                   >
                     {(() => {
                        const app = MOCK_APPS.find(a => a.id === response.appId);
                        if (!app) return null;
                        return (
                          <>
                            <img src={app.imageUrl} alt={app.name} className="w-12 h-12 rounded-lg object-cover" />
                            <div>
                              <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{app.name}</div>
                              <div className="text-xs text-gray-500">このアプリを見る &rarr;</div>
                            </div>
                          </>
                        )
                     })()}
                   </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例：契約書を確認したい..."
              className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={!query.trim() || isLoading}
              className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
