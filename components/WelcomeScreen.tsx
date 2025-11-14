import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface WelcomeScreenProps {
  onEnter: () => void;
}

const Particle: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    className="absolute rounded-full bg-purple-500/30"
    style={{
      ...style,
      animation: `float ${Math.random() * 8 + 6}s ease-in-out infinite, pulse-glow ${Math.random() * 4 + 3}s ease-in-out infinite`,
      animationDelay: `-${Math.random() * 5}s, -${Math.random() * 4}s`,
    }}
  ></div>
);


export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  const { t } = useLanguage();

  const particles = Array.from({ length: 20 }).map((_, i) => ({
    style: {
      width: `${Math.random() * 25 + 5}px`,
      height: `${Math.random() * 25 + 5}px`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    },
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background animated grid */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:2rem_2rem]">
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-0">
        {particles.map((p, i) => (
          <Particle key={i} style={p.style} />
        ))}
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center text-center flex-grow">
        <h1 className="text-4xl md:text-6xl font-bold font-orbitron text-purple-400 tracking-widest mb-4">
          AI SUPERPOWER 2035
        </h1>
        
        <p className="text-base md:text-lg text-gray-300 mb-12 max-w-3xl">
          {t('welcomeToSimulation_line1')}
          <br />
          {t('welcomeToSimulation_line2')}
        </p>

        <button
          onClick={onEnter}
          className="bg-purple-600 text-white font-bold font-orbitron tracking-wider text-xl py-4 px-12 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/50 shadow-[0_0_15px_rgba(192,132,252,0.4)] hover:shadow-[0_0_25px_rgba(192,132,252,0.6)]"
          aria-label="Enter the simulation"
        >
          ENTER
        </button>
      </div>

      <footer className="relative z-10 w-full max-w-2xl p-4">
        <div className="flex items-center justify-center space-x-5 border-t border-purple-500/10 pt-4">
          <div className="w-28 h-28 bg-gray-800/50 border-2 border-purple-500/30 rounded-full flex-shrink-0 shadow-lg shadow-purple-900/50 overflow-hidden">
            <img
              src="https://i.postimg.cc/7ZLzCq2g/Whats-App-Image-2025-11-08-at-09-11-44-1-removebg-preview.png"
              alt="Photo of Tamanna Mohantay"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left">
            <p className="font-orbitron font-bold text-xl text-purple-300 tracking-wide">Tamanna Mohantay</p>
            <p className="text-base text-gray-300">AI Governance Researcher, GovernAI</p>
          </div>
        </div>
      </footer>
    </div>
  );
};