
import React, { useEffect, useState, useRef } from 'react';
import { RefreshCw, Newspaper, Clock, Info, Sparkles, Loader2 } from 'lucide-react';
import { getLatestNews } from '../services/geminiService';
import { NewsData, NewsCategory, NewsItem } from '../types';

export const NewsSection: React.FC = () => {
  const [news, setNews] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NewsCategory>(NewsCategory.ECONOMY);
  const refreshIntervalRef = useRef<number | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(false);
    
    try {
      // 1. Priority Load: Economy only
      // This allows the user to see content much faster (1 API call with fewer tokens)
      const economyData = await getLatestNews([NewsCategory.ECONOMY]);
      setNews(economyData);
      setLoading(false); // Unlock UI for the user immediately

      // 2. Background Load: All other categories
      setBackgroundLoading(true);
      const otherCategories = Object.values(NewsCategory).filter(c => c !== NewsCategory.ECONOMY);
      const otherData = await getLatestNews(otherCategories);

      // Merge data
      setNews(prev => {
        if (!prev) return otherData;
        
        // Create a new items object starting with previous data
        const mergedItems = { ...prev.items };
        
        // Only update the categories we just fetched in the background
        // This prevents overwriting the existing Economy data with empty arrays
        otherCategories.forEach(cat => {
            mergedItems[cat] = otherData.items[cat];
        });

        // Combine and deduplicate sources
        const allSources = [...prev.sources, ...otherData.sources];
        const uniqueSources = Array.from(new Map(allSources.map(s => [s.uri, s])).values());

        return {
          items: mergedItems,
          sources: uniqueSources,
          timestamp: new Date() // Update timestamp to latest fetch
        };
      });

    } catch (err) {
      console.error(err);
      if (!news) setError(true); // Only show full error if we have no data at all
    } finally {
      setLoading(false);
      setBackgroundLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    refreshIntervalRef.current = window.setInterval(fetchNews, 900000); // 15 min

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Check if the current active category is still loading (empty items but background loading is true)
  const isCategoryLoading = !loading && backgroundLoading && news?.items[activeCategory]?.length === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible mb-12 max-w-5xl mx-auto z-10 relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-4 py-3 flex justify-between items-center rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-50 text-indigo-600 p-1 rounded-md">
            <Newspaper size={16} />
          </div>
          <h2 className="font-bold text-gray-800 text-lg">最新ニュース</h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {backgroundLoading && (
             <span className="text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-full animate-pulse">
               <Loader2 size={10} className="animate-spin" />
               他ジャンル取得中
             </span>
          )}
          {news && !backgroundLoading && (
            <span className="flex items-center gap-1 hidden md:flex">
              <Clock size={12} />
              {formatDate(news.timestamp)}更新
            </span>
          )}
          <button 
            onClick={fetchNews} 
            disabled={loading || backgroundLoading}
            className="flex items-center gap-1 hover:text-indigo-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading || backgroundLoading ? 'animate-spin' : ''} />
            更新
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 hide-scrollbar">
        {Object.values(NewsCategory).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-5 py-3 text-sm font-bold whitespace-nowrap transition-colors relative ${
              activeCategory === category
                ? 'text-indigo-600 bg-indigo-50/50'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {category}
            {activeCategory === category && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600" />
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-b-xl">
        {/* Main List */}
        <div className="w-full">
          {(loading || isCategoryLoading) ? (
            <div className="space-y-4 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span className="animate-pulse">ニュースを取得中...</span>
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-50 rounded-lg w-full animate-pulse"></div>
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 divide-dashed relative min-h-[100px]">
              {news?.items[activeCategory]?.length === 0 && !error && !backgroundLoading && (
                <li className="px-4 py-6 text-center text-gray-500 text-sm">
                  このカテゴリのニュースはありません。
                </li>
              )}

              {news?.items[activeCategory]?.map((item: NewsItem, index: number) => (
                <li key={index} className="group relative hover:z-20">
                  <div className="block px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-indigo-50/30 transition-colors">
                    <span className="flex items-center justify-center w-5 h-5 text-gray-400 text-[10px] font-bold mt-0.5 flex-shrink-0 group-hover:text-indigo-600 transition-colors">
                      {index + 1}
                    </span>
                    <span className="text-gray-800 text-sm md:text-base font-medium leading-relaxed group-hover:text-indigo-700">
                      {item.title}
                    </span>
                    
                    {/* Tooltip on Hover */}
                    <div className="absolute left-4 md:left-8 top-full mt-1 w-[calc(100%-2rem)] md:w-[400px] z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 pointer-events-none drop-shadow-2xl">
                        <div className="bg-gray-800/95 backdrop-blur-sm text-white p-4 rounded-xl shadow-xl text-xs leading-relaxed border border-gray-700">
                          <div className="font-bold mb-2 text-indigo-300 flex items-center gap-1.5 border-b border-gray-700 pb-2">
                              <Info size={14} />
                              ニュース詳細
                          </div>
                          <p className="text-gray-100 text-sm leading-6">
                            {item.summary}
                          </p>
                          {/* Upward Arrow */}
                          <div className="absolute bottom-full left-6 border-8 border-transparent border-b-gray-800/95"></div>
                        </div>
                    </div>
                  </div>
                </li>
              ))}
              
              {error && (
                  <li className="px-4 py-6 text-center text-gray-500 text-sm">
                    ニュースの読み込みに失敗しました。
                  </li>
              )}
            </ul>
          )}
        </div>
        
        {/* AI Disclaimer Footer */}
        <div className="px-4 py-2 bg-gray-50 rounded-b-xl border-t border-gray-100 flex items-center gap-2 text-[10px] text-gray-400 justify-end">
          <Sparkles size={10} />
          <span>※記事の選定・要約はAIが行っています。</span>
        </div>
      </div>
    </div>
  );
};
