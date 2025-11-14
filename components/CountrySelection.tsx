import React from 'react';
import { COUNTRIES } from '../constants/gameConstants';
import type { Country } from '../types/game';
import { useLanguage } from '../contexts/LanguageContext';

interface CountrySelectionProps {
  onSelect: (country: Country) => void;
}

const CountryCard: React.FC<{ country: Country; onSelect: () => void }> = ({ country, onSelect }) => {
  const { t } = useLanguage();
  return (
    <div
      onClick={onSelect}
      className="bg-gray-800 rounded-lg p-6 border-2 border-transparent hover:border-purple-500 cursor-pointer transition-all duration-150 transform hover:scale-105 group flex flex-col"
    >
      <div className="text-5xl mb-4 text-center">{country.flag}</div>
      <h3 className="text-2xl font-bold text-center mb-2 font-orbitron text-gray-100 group-hover:text-purple-400">{country.name}</h3>
      <p className="text-gray-400 text-center text-sm flex-grow">{t(country.description)}</p>
      <div className="mt-4 pt-3 border-t border-gray-700/50 text-center">
        <p className="text-sm font-semibold text-purple-300">{t(country.specialAbilityName)}</p>
        <p className="text-xs text-gray-400 mt-1">{t(country.specialAbilityDescription)}</p>
      </div>
    </div>
  );
};

export const CountrySelection: React.FC<CountrySelectionProps> = ({ onSelect }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-center mb-2 text-gray-200">{t('chooseYourNation')}</h2>
      <p className="text-center text-gray-400 mb-8">{t('selectCountryPrompt')}</p>

      <div className="grid md:grid-cols-3 gap-6">
        {COUNTRIES.map((country) => (
          <CountryCard key={country.id} country={country} onSelect={() => onSelect(country)} />
        ))}
      </div>
    </div>
  );
};