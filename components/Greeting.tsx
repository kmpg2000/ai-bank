import React from 'react';

export const Greeting: React.FC = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "Good Night";
    if (hour < 12) return "Ohayou Gozaimasu";
    if (hour < 18) return "Konnichiwa";
    return "Konbanwa";
  };

  const getSubGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "Rest well.";
    if (hour < 12) return "Start your day with clarity.";
    if (hour < 18) return "Keep your focus.";
    return "Reflect on the day.";
  };

  return (
    <div className="text-center mt-4">
      <h2 className="text-3xl md:text-4xl font-serif-display text-white mb-1">
        {getGreeting()}
      </h2>
      <p className="text-slate-300 font-light italic">
        {getSubGreeting()}
      </p>
    </div>
  );
};