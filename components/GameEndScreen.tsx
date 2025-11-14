
import React from 'react';
import type { Country } from '../types/game';
import { useLanguage } from '../contexts/LanguageContext';

interface GameEndScreenProps {
  score: number;
  country: Country;
  onRestart: () => void;
  finalYear: number;
}

export const GameEndScreen: React.FC<GameEndScreenProps> = ({ score, country, onRestart, finalYear }) => {
  const { t } = useLanguage();

  const getEndingMessage = () => {
    let messageKey = '';
     if (score >= 95) {
      messageKey = 'endingMessageSuperpower';
    } else if (score >= 75) {
      messageKey = 'endingMessagePowerhouse';
    } else if (score >= 50) {
      messageKey = 'endingMessageContender';
    } else {
      messageKey = 'endingMessageChallenging';
    }
    return t(messageKey, { countryName: country.name });
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gray-800 rounded-lg shadow-2xl text-center flex flex-col items-center">
        <h2 className="text-4xl font-bold font-orbitron text-purple-400 mb-4">{t('year')} {finalYear}</h2>
        <p className="text-lg text-gray-300 mb-6">{country.flag} {country.name}'s journey concludes.</p>
        <div className="mb-6">
          <p className="text-gray-400 text-sm">{t('finalScoreLabel')}</p>
          <p className="text-7xl font-bold font-orbitron text-blue-400">{score.toFixed(0)}</p>
        </div>
        <p className="text-gray-300 mb-8 italic">{getEndingMessage()}</p>
        <button
          onClick={onRestart}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-150 transform hover:scale-105"
        >
          {t('playAgain')}
        </button>
    </div>
  );
};
