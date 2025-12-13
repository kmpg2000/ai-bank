
import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Tag, Star, ArrowRight } from 'lucide-react';
import { MOCK_APPS } from './constants';
import { AppCategory, AIApp } from './types';
import { Header } from './components/Header';
import { Concierge } from './components/Concierge';
import { NewsSection } from './components/NewsSection';
import { VisitorCounter } from './components/VisitorCounter';

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>(AppCategory.ALL);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [highlightedAppId, setHighlightedAppId] = useState<string | null>(null);

  // Filter apps based on category only (Search removed)
  const filteredApps = MOCK_APPS.filter(app => {
    return selectedCategory === AppCategory.ALL || app.category === selectedCategory;
  });

  // Handle recommendation from Concierge
  const handleRecommendation = (appId: string) => {
    setHighlightedAppId(appId);
    setSelectedCategory(AppCategory.ALL); // Reset category to ensure visibility
    
    // Scroll to the app
    setTimeout(() => {
      const element = document.getElementById(`app-${appId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Remove highlight after animation
        setTimeout(() => setHighlightedAppId(null), 3000);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      <Header />

      <main className="container mx-auto px-4 py-8">
        
        {/* News Section */}
        <NewsSection />
        
        {/* Apps Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 mb-6 border-b border-gray-200 pb-4">
          
          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
            {Object.values(AppCategory).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Apps Grid */}
        {filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredApps.map((app) => (
              <div 
                key={app.id} 
                id={`app-${app.id}`}
                className={`group bg-white rounded-xl overflow-hidden border transition-all duration-500 flex flex-col h-full
                  ${highlightedAppId === app.id 
                    ? 'ring-4 ring-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.5)] scale-105 z-10' 
                    : 'border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1'
                  }`}
              >
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={app.imageUrl} 
                    alt={app.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    {app.rating}
                  </div>
                  <div className="absolute bottom-3 left-3">
                      <span className="bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-medium">
                        {app.category}
                      </span>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                    {app.name}
                  </h3>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-3 flex-1 leading-relaxed">
                    {app.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {app.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <a 
                    href={app.url || '#'} 
                    target={app.url ? "_blank" : "_self"}
                    rel={app.url ? "noopener noreferrer" : ""}
                    className="w-full mt-auto py-2 rounded-lg border border-indigo-100 text-indigo-600 font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-1.5 group-hover:border-indigo-600"
                  >
                    使ってみる
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">アプリが見つかりませんでした</h3>
            <p className="text-gray-500">カテゴリーを選び直してください。</p>
          </div>
        )}
      </main>

      {/* Floating Concierge Button */}
      <button
        onClick={() => setIsConciergeOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-full shadow-[0_8px_30px_rgb(79,70,229,0.3)] hover:shadow-[0_8px_35px_rgb(79,70,229,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 flex flex-col items-center justify-center gap-0.5 group border-2 border-white/20"
        aria-label="AIに相談"
      >
        <Sparkles size={24} className="group-hover:animate-pulse" />
        <span className="text-[9px] font-bold tracking-tight">AI相談</span>
      </button>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 border-t border-gray-800 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Left Side: Branding & Counter */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    AI-Bank
                  </h2>
                  <p className="text-gray-500 text-xs hidden md:block border-l border-gray-700 pl-4">
                    未来のテクノロジーを、すべての人の手に。
                  </p>
              </div>
              <VisitorCounter />
            </div>
            
            {/* Right Side: Links & Copyright */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full md:w-auto justify-end">
              <div className="flex gap-6 text-xs text-gray-400">
                <a href="#" className="hover:text-white transition-colors">利用規約</a>
                <a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a>
                <a href="#" className="hover:text-white transition-colors">お問い合わせ</a>
              </div>

              <div className="text-xs text-gray-600 whitespace-nowrap">
                &copy; {new Date().getFullYear()} AI-Bank
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Concierge Modal */}
      <Concierge 
        isOpen={isConciergeOpen} 
        onClose={() => setIsConciergeOpen(false)}
        onRecommend={handleRecommendation}
      />
    </div>
  );
};

export default App;
