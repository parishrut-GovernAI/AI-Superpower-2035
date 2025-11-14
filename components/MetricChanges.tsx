
import React from 'react';
import type { Metrics } from '../types/game';
import { useLanguage } from '../contexts/LanguageContext';

interface MetricChangesProps {
  before: Metrics | null;
  after: Metrics;
}

const metricLabelsMap: Record<keyof Metrics, string> = {
    gdpContribution: 'aiGdpContribution',
    stemWorkforce: 'stemWorkforce',
    aiStartups: 'aiStartups',
    governmentAdoption: 'govtAiAdoption',
    defenseSpending: 'aiInDefense',
    rdSpending: 'aiRdSpending',
};

const metricUnits: Record<keyof Metrics, string> = {
    gdpContribution: '%',
    stemWorkforce: 'M',
    aiStartups: '',
    governmentAdoption: '/10',
    defenseSpending: '%',
    rdSpending: '%',
};

export const MetricChanges: React.FC<MetricChangesProps> = ({ before, after }) => {
  const { t } = useLanguage();

  if (!before) return null;

  const changes = (Object.keys(metricLabelsMap) as Array<keyof Metrics>).map(key => {
    const beforeValue = before[key] ?? 0;
    const afterValue = after[key] ?? 0;
    const delta = afterValue - beforeValue;

    let colorClass = 'text-gray-400';
    let sign = '';
    let arrow = '';

    if (delta > 0.001) {
      colorClass = 'text-green-400';
      sign = '+';
      arrow = '▲';
    } else if (delta < -0.001) {
      colorClass = 'text-red-400';
      sign = ''; // Negative sign is already there
      arrow = '▼';
    }

    const isFractional = key === 'gdpContribution' || key === 'stemWorkforce' || key === 'defenseSpending' || key === 'rdSpending';
    
    const valueDisplay = isFractional ? afterValue.toFixed(1) : afterValue.toFixed(0);
    const deltaDisplay = isFractional ? delta.toFixed(1) : delta.toFixed(0);

    return {
      key,
      label: t(metricLabelsMap[key]),
      value: `${valueDisplay}${metricUnits[key]}`,
      delta: delta.toFixed(2), // for checking against threshold
      deltaDisplay: `${sign}${deltaDisplay}`,
      colorClass,
      arrow,
    };
  });

  return (
    <div className="mt-3 pt-3 border-t border-gray-700/50">
      <h4 className="text-sm font-semibold text-gray-300 mb-2">{t('metricChanges')}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {changes.map(change => (
          <div key={change.key} className="flex justify-between items-baseline">
            <span className="text-gray-400 truncate pr-2">{change.label}:</span>
            <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="font-mono text-gray-200">{change.value}</span>
                {Math.abs(parseFloat(change.delta)) > 0.001 && (
                     <span className={`font-mono font-semibold w-16 text-right ${change.colorClass}`}>
                       ({change.deltaDisplay}) {change.arrow}
                     </span>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
