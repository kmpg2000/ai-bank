import React from 'react';
import { Sparkles } from 'lucide-react';
import { HERO_TAGLINE } from '../constants';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 py-2 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          {/* Logo Mark */}
          <div className="bg-indigo-600 p-2.5 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-105 group-hover:shadow-indigo-200 transition-all duration-300 transform group-hover:-rotate-3">
            <Sparkles className="text-white w-6 h-6 fill-indigo-300" strokeWidth={2.5} />
          </div>
          
          {/* Logo Text */}
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors font-sans">
              AI-Bank
            </h1>
            <span className="text-[10px] text-gray-500 font-medium tracking-tight mt-0.5">
              {HERO_TAGLINE}
            </span>
          </div>
        </div>
        
        {/* Version Display removed */}
      </div>
    </header>
  );
};