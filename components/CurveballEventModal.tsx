
import React from 'react';
import type { CurveballEvent } from '../types/game';
import { useLanguage } from '../contexts/LanguageContext';

interface CurveballEventModalProps {
  event: CurveballEvent;
  onSelectChoice: (choiceIndex: number) => void;
}

export const CurveballEventModal: React.FC<CurveballEventModalProps> = ({ event, onSelectChoice }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 bg-gray-900/90 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="curveball-title">
      <div className="bg-gray-800 rounded-lg shadow-2xl border border-amber-500 max-w-2xl w-full p-6 text-center animate-pulse-once">
        <div className="flex justify-center items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <h2 id="curveball-title" className="text-2xl font-bold font-orbitron text-amber-400">
            {t('curveballEventTitle')}
          </h2>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-100 mb-2">{event.event_title}</h3>
        <p className="text-gray-300 mb-6">{event.event_description}</p>

        <div className="flex flex-col space-y-3">
          {event.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => onSelectChoice(index)}
              className="w-full text-center p-4 rounded-lg transition-colors duration-150 text-gray-200 text-sm bg-gray-700 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {choice.choice_text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
