

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface TurnSourcesProps {
  sources: any[];
}

export const TurnSources: React.FC<TurnSourcesProps> = ({ sources }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  if (!sources || sources.length === 0) {
    return null;
  }

  // Filter for unique sources with valid web links
  const uniqueSources = Array.from(new Map(sources
    .filter(source => source.web?.uri && source.web?.title)
    .map(source => [source.web.uri, source])
  ).values());

  if (uniqueSources.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 text-center text-xs text-gray-500">
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center hover:text-gray-300 transition-colors"
            aria-expanded={isOpen}
        >
            <span>{t('informedByRealWorldEvents')}</span>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ml-1 transform transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>

        {isOpen && (
            <div className="mt-4 text-left max-w-2xl mx-auto bg-gray-900 p-4 rounded-md border border-gray-700 text-sm">
            <p className="text-gray-400 mb-2">{t('scenarioSourcesDescription')}</p>
            <ul className="list-disc pl-5 space-y-1">
                {uniqueSources.map((source: any, index) => (
                <li key={index}>
                    <a
                    href={source.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 hover:underline"
                    >
                    {source.web.title}
                    </a>
                </li>
                ))}
            </ul>
            </div>
        )}
    </div>
  );
};