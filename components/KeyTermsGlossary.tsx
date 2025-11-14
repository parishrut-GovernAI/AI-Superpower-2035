
import React, { useState, useMemo } from 'react';
import { KEY_TERMS } from '../constants/keyTerms';
import { useLanguage } from '../contexts/LanguageContext';

interface KeyTermsGlossaryProps {
  seenJargonTerms: string[];
}

export const KeyTermsGlossary: React.FC<KeyTermsGlossaryProps> = ({ seenJargonTerms }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useLanguage();

  const seenJargonTermsSet = useMemo(() => 
    new Set(seenJargonTerms.map(term => term.toLowerCase())),
    [seenJargonTerms]
  );

  const filteredKeyTerms = useMemo(() => {
    const sorted = [...KEY_TERMS].sort((a, b) => a.term.localeCompare(b.term));
    return sorted.filter(keyTerm => !seenJargonTermsSet.has(keyTerm.term.toLowerCase()));
  }, [seenJargonTermsSet]);

  if (filteredKeyTerms.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800/70 rounded-lg border border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left"
        aria-expanded={isOpen}
        aria-controls="key-terms-panel"
      >
        <h3 className="text-lg font-bold font-orbitron text-gray-300">{t('keyTermsGlossary')}</h3>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transform transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div id="key-terms-panel" className="p-4 border-t border-gray-700 max-h-96 overflow-y-auto">
          <ul className="space-y-3 text-sm">
            {filteredKeyTerms.map(keyTerm => (
              <li key={keyTerm.term}>
                <strong className="text-cyan-300">{keyTerm.term}:</strong>
                <p className="text-gray-400 pl-2">{t(keyTerm.definitionKey)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
