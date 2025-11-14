
import React from 'react';
import type { NewsItem } from '../types/game';
import { useLanguage } from '../contexts/LanguageContext';

interface NewsFeedProps {
  newsFeed: NewsItem[];
}

const NewsItemCard: React.FC<{ item: NewsItem }> = ({ item }) => {
  const isCurveball = item.is_curveball;

  const containerClasses = isCurveball
    ? 'border-l-4 border-amber-400 bg-amber-900/20'
    : 'border-l-4 border-cyan-400 bg-cyan-900/10';
  
  const icon = isCurveball ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
        <path fillRule="evenodd" d="M8 5a1 1 0 011-1h.01a1 1 0 110 2H9a1 1 0 01-1-1zM6 5a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zM4 5a1 1 0 011-1h.01a1 1 0 110 2H5a1 1 0 01-1-1zM2 5a1 1 0 011-1h.01a1 1 0 110 2H3a1 1 0 01-1-1zm11-1h2a1 1 0 110 2h-2a1 1 0 110-2zM13 5a1 1 0 011-1h.01a1 1 0 110 2H14a1 1 0 01-1-1zM15 5a1 1 0 011-1h.01a1 1 0 110 2H16a1 1 0 01-1-1zM17 5a1 1 0 011-1h.01a1 1 0 110 2H18a1 1 0 01-1-1z" />
        <path fillRule="evenodd" d="M5.5 8a.5.5 0 00.5.5h8a.5.5 0 000-1h-8a.5.5 0 00-.5.5zM5 10.5a.5.5 0 01.5-.5h8a.5.5 0 010 1h-8a.5.5 0 01-.5-.5zM5.5 13a.5.5 0 00.5.5h8a.5.5 0 000-1h-8a.5.5 0 00-.5.5zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  );

  return (
    <details className={`p-3 rounded-md overflow-hidden ${containerClasses}`}>
      <summary className="cursor-pointer flex items-center text-sm font-semibold text-gray-200 hover:text-white">
        {icon}
        {item.headline}
      </summary>
      <p className="mt-2 ml-7 text-xs text-gray-400">{item.summary}</p>
    </details>
  );
};


export const NewsFeed: React.FC<NewsFeedProps> = ({ newsFeed }) => {
  const { t } = useLanguage();
  return (
    <div className="mt-3 pt-3 border-t border-gray-700/50">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">{t('newsFeed')}</h4>
        <div className="space-y-2">
            {newsFeed.map((item, index) => (
                <NewsItemCard key={index} item={item} />
            ))}
        </div>
    </div>
  )
};
