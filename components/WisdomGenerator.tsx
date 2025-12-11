import React, { useState } from 'react';
import { getMorningWisdom } from '../services/gemini';
import { WisdomData, LoadingState } from '../types';

export const WisdomGenerator: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [wisdom, setWisdom] = useState<WisdomData | null>(null);

  const handleGenerate = async () => {
    setLoadingState(LoadingState.LOADING);
    try {
      const data = await getMorningWisdom();
      setWisdom(data);
      setLoadingState(LoadingState.SUCCESS);
    } catch (e) {
      setLoadingState(LoadingState.ERROR);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {loadingState === LoadingState.IDLE && (
        <button
          onClick={handleGenerate}
          className="group relative px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full 
                     text-white font-medium tracking-wide transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95 shadow-lg"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Receive Daily Wisdom
          </span>
        </button>
      )}

      {loadingState === LoadingState.LOADING && (
        <div className="flex flex-col items-center justify-center space-y-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-white/70 font-light text-sm tracking-wider">Consulting the spirits...</p>
        </div>
      )}

      {loadingState === LoadingState.ERROR && (
        <div className="text-center p-6 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm animate-fade-in">
          <p className="text-red-200 mb-4">The winds are silent. Please try again.</p>
          <button
            onClick={handleGenerate}
            className="text-sm px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {loadingState === LoadingState.SUCCESS && wisdom && (
        <div className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-10 text-center animate-slide-up shadow-2xl">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 text-xs tracking-[0.2em] text-cyan-200 border border-cyan-500/30 rounded-full uppercase bg-cyan-900/20 mb-6">
              {wisdom.theme}
            </span>
            <h3 className="text-4xl md:text-5xl font-serif-display text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-4 leading-relaxed">
              {wisdom.japanese}
            </h3>
            <p className="text-lg text-slate-400 font-light italic mb-8">
              {wisdom.romaji}
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            <p className="pt-8 text-xl md:text-2xl text-slate-100 font-light leading-relaxed font-serif-display">
              "{wisdom.english}"
            </p>
          </div>

          <button 
            onClick={handleGenerate}
            className="mt-12 text-xs text-white/40 hover:text-white/80 transition-colors uppercase tracking-widest"
          >
            Refresh Wisdom
          </button>
        </div>
      )}
    </div>
  );
};