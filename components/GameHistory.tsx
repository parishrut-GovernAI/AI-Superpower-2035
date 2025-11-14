

import React, { useState } from 'react';
import type { GameHistoryItem, Metrics } from '../types/game';
import { useLanguage } from '../contexts/LanguageContext';
import { MetricChanges } from './MetricChanges';
import { NewsFeed } from './NewsFeed';

interface GameHistoryItemCardProps {
  item: GameHistoryItem;
  previousMetrics: Metrics | null;
  isInitiallyOpen: boolean;
}

const GameHistoryItemCard: React.FC<GameHistoryItemCardProps> = ({ item, previousMetrics, isInitiallyOpen }) => {
    const { t } = useLanguage();
    const curveballNews = item.newsFeed?.find(news => news.is_curveball && news.event);

    return (
        <details open={isInitiallyOpen} className="bg-gray-900/50 rounded-md overflow-hidden transition-all duration-300">
            <summary className="p-4 font-bold text-purple-400 font-orbitron cursor-pointer flex justify-between items-center hover:bg-gray-800/50">
                <span>{t('year')} {item.year}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-200 transform details-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </summary>
            
            <div className="p-4 border-t border-gray-700/50 space-y-4">
                <section>
                    <h4 className="font-semibold text-gray-300 text-sm">{t('decisionsMade')}</h4>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                        {item.scenarios.map((scenario, sIndex) => (
                            <li key={sIndex}>
                                <span className="font-semibold text-gray-300">{scenario.scenario_title}:</span>
                                <span className="text-gray-400"> {scenario.choices[item.choiceIndices[sIndex]]}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section>
                    <p className="text-sm text-gray-400">
                        <span className="font-semibold text-gray-300">{t('outcome')}:</span> {item.outcome}
                    </p>
                    {item.newsFeed && item.newsFeed.length > 0 && <NewsFeed newsFeed={item.newsFeed} />}
                </section>
                
                {curveballNews && typeof item.curveballChoiceIndex === 'number' && (
                    <div className="p-3 bg-amber-900/20 border-l-4 border-amber-500 rounded-r-md">
                        <p className="text-sm font-semibold text-amber-300">{t('curveballEventResponse')}: {curveballNews.event?.event_title}</p>
                        <p className="text-xs text-gray-400 mt-1">
                            <span className="font-semibold text-gray-300">{t('yourChoice')}:</span> {curveballNews.event?.choices[item.curveballChoiceIndex].choice_text}
                        </p>
                    </div>
                )}
                
                <MetricChanges before={previousMetrics} after={item.metrics} />
            </div>
            <style>{`
                details[open] > summary .details-arrow {
                    transform: rotate(180deg);
                }
            `}</style>
        </details>
    );
};

// FIX: Added the missing `GameHistoryProps` interface to fix a type error.
interface GameHistoryProps {
  history: GameHistoryItem[];
  initialMetrics: Metrics | null;
}

export const GameHistory: React.FC<GameHistoryProps> = ({ history, initialMetrics }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  if (history.length === 0) {
    return null; // Don't render anything if there's no history yet
  }

  return (
    <div className="bg-gray-800/70 rounded-lg border border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left"
        aria-expanded={isOpen}
        aria-controls="history-panel"
      >
        <h3 className="text-lg font-bold font-orbitron text-gray-300">{t('gameHistory')}</h3>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transform transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div id="history-panel" className="p-4 border-t border-gray-700">
            <div className="space-y-2">
                {history.map((item, index) => {
                  const previousMetrics = index === history.length - 1 ? initialMetrics : history[index + 1].metrics;
                  return (
                    <GameHistoryItemCard 
                        key={item.year} 
                        item={item} 
                        previousMetrics={previousMetrics} 
                        isInitiallyOpen={index === 0}
                    />
                  );
                })}
            </div>
        </div>
      )}
    </div>
  );
};
