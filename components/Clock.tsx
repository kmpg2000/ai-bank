import React, { useState, useEffect } from 'react';

export const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="flex flex-col items-center text-center select-none">
      <h1 className="text-8xl md:text-9xl font-light tracking-tighter text-white drop-shadow-lg font-serif-display">
        {formatTime(time)}
      </h1>
      <p className="text-xl md:text-2xl font-light text-slate-200 mt-2 tracking-wide uppercase opacity-90">
        {formatDate(time)}
      </p>
    </div>
  );
};