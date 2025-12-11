import React from 'react';

export const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 bg-slate-900 w-full h-full">
      {/* Deep base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 opacity-80"></div>
      
      {/* Sunrise glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-orange-500/20 via-rose-500/10 to-transparent opacity-60"></div>
      
      {/* Animated blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vh] h-[60vh] bg-blue-600/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      
      {/* Grain overlay for texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
    </div>
  );
};