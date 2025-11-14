

import React, { useState, useMemo } from 'react';
import type { Jargon } from '../types/game';
import { useLanguage } from '../contexts/LanguageContext';
import { KEY_TERMS } from '../constants/keyTerms';

interface GlossaryProps {
  jargons: Jargon[];
}

/**
 * Calculates the Levenshtein distance between two strings.
 * This is a measure of the difference between two sequences.
 * @param a The first string.
 * @param b The second string.
 * @returns The Levenshtein distance.
 */
function levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i += 1) {
        matrix[0][i] = i;
    }

    for (let j = 0; j <= b.length; j += 1) {
        matrix[j][0] = j;
    }

    for (let j = 1; j <= b.length; j += 1) {
        for (let i = 1; i <= a.length; i += 1) {
            const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1, // deletion
                matrix[j - 1][i] + 1, // insertion
                matrix[j - 1][i - 1] + substitutionCost // substitution
            );
        }
    }

    return matrix[b.length][a.length];
}

interface Term {
    term: string;
    definition: string;
}

export const Glossary: React.FC<GlossaryProps> = ({ jargons }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();

  const allTerms = useMemo(() => {
    // Filter out malformed jargon objects at the source.
    const scenarioTerms: Term[] = jargons
        .filter(j => j && j.term && j.definition)
        .map(j => ({
            term: j.term,
            definition: j.definition
        }));

    const scenarioTermSet = new Set(scenarioTerms.map(j => j.term.toLowerCase()));

    const generalTerms: Term[] = KEY_TERMS
        .filter(keyTerm => !scenarioTermSet.has(keyTerm.term.toLowerCase()))
        .map(keyTerm => ({
            term: keyTerm.term,
            definition: t(keyTerm.definitionKey)
        }));

    const combined = [...scenarioTerms, ...generalTerms];
    combined.sort((a, b) => a.term.localeCompare(b.term));
    return combined;
  }, [jargons, t]);

  const filteredTerms = useMemo(() => {
    if (!searchTerm.trim()) {
      return allTerms;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    
    return allTerms.filter(item => {
      // Use optional chaining and nullish coalescing for safety.
      const termLower = (item.term || '').toLowerCase();
      const definitionLower = (item.definition || '').toLowerCase();

      if (termLower.includes(lowercasedFilter) || definitionLower.includes(lowercasedFilter)) {
        return true;
      }

      if (lowercasedFilter.length > 3) {
        const distance = levenshteinDistance(termLower, lowercasedFilter);
        const threshold = 2; 
        if (distance <= threshold) {
          return true;
        }
      }

      return false;
    });
  }, [allTerms, searchTerm]);
  
  const renderContent = () => {
    if (allTerms.length === 0) {
        return <p className="text-gray-400 text-center italic px-4 py-6">{t('jargonGlossaryEmpty')}</p>;
    }
    if (filteredTerms.length > 0) {
        return (
            <ul className="space-y-2 text-sm">
                {filteredTerms.map(item => (
                    <li key={item.term} className="bg-gray-900/50 p-3 rounded-md">
                        <p className="font-semibold text-cyan-300">{item.term}</p>
                        <p className="text-gray-400 mt-1">{item.definition}</p>
                    </li>
                ))}
            </ul>
        );
    }
    return <p className="text-gray-400 text-center p-4">{t('jargonSearchNoResults')}</p>;
  }

  return (
    <div className="bg-gray-800/70 rounded-lg border border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left"
        aria-expanded={isOpen}
        aria-controls="glossary-panel"
      >
        <h3 className="text-lg font-bold font-orbitron text-gray-300">{t('jargonGlossary')}</h3>
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
        <div id="glossary-panel" className="p-4 border-t border-gray-700 max-h-96 overflow-y-auto">
            <div className="relative mb-4">
              <input
                type="search"
                placeholder={t('jargonSearchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
                aria-label="Search Glossary"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {renderContent()}
        </div>
      )}
    </div>
  );
};