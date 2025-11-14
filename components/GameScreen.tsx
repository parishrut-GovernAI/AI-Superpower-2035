import React from 'react';
import type { Country, Metrics, Scenario, GameHistoryItem } from '../types/game';
import { MetricDisplay } from './MetricDisplay';
import { ScenarioCard } from './ScenarioCard';
import { MAX_METRICS, YEARS } from '../constants/gameConstants';
import { GameHistory } from './GameHistory';
import { useLanguage } from '../contexts/LanguageContext';
import { Loader } from './Loader';
import { TurnSources } from './TurnSources';

interface GameScreenProps {
  country: Country;
  year: number;
  metrics: Metrics;
  scenarios: Scenario[];
  turnChoices: Record<number, number>;
  superpowerScore: number;
  onSelectChoice: (scenarioIndex: number, choiceIndex: number) => void;
  onConfirmTurn: () => void;
  isLoading: boolean;
  error: string | null;
  history: GameHistoryItem[];
  initialMetrics: Metrics | null;
  turnSources: any[];
}

export const GameScreen: React.FC<GameScreenProps> = ({
  country,
  year,
  metrics,
  scenarios,
  turnChoices,
  superpowerScore,
  onSelectChoice,
  onConfirmTurn,
  isLoading,
  error,
  history,
  initialMetrics,
  turnSources,
}) => {
  const { t } = useLanguage();

  const metricLabels: Record<keyof Metrics, string> = {
    gdpContribution: t('aiGdpContribution'),
    stemWorkforce: t('stemWorkforce'),
    aiStartups: t('aiStartups'),
    governmentAdoption: t('govtAiAdoption'),
    defenseSpending: t('aiInDefense'),
    rdSpending: t('aiRdSpending'),
  };
  
  const metricTooltips: Record<keyof Metrics, string> = {
    gdpContribution: t('tooltip_gdpContribution'),
    stemWorkforce: t('tooltip_stemWorkforce'),
    aiStartups: t('tooltip_aiStartups'),
    governmentAdoption: t('tooltip_governmentAdoption'),
    defenseSpending: t('tooltip_defenseSpending'),
    rdSpending: t('tooltip_rdSpending'),
  };

  const allChoicesMade = scenarios.length > 0 && Object.keys(turnChoices).length === scenarios.length;

  const renderScenarioContent = () => {
    if (isLoading && scenarios.length === 0) {
        return <Loader textKey="generatingScenario" />;
    }
    if (isLoading && scenarios.length > 0) {
        return <Loader textKey="simulatingNext5Years" />;
    }
    if (error) {
        return (
            <div className="p-6 bg-red-900/50 border border-red-500 rounded-lg text-center">
                <h3 className="text-xl font-bold mb-2 text-red-300">{t('simulationErrorTitle')}</h3>
                <p className="text-red-200">{error}</p>
            </div>
        );
    }
    if (scenarios.length > 0) {
        return (
            <>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {scenarios.map((scenario, index) => (
                        <ScenarioCard 
                            key={index}
                            scenario={scenario} 
                            onSelectChoice={(choiceIndex) => onSelectChoice(index, choiceIndex)}
                            selectedChoiceIndex={turnChoices[index]}
                        />
                    ))}
                </div>
                <div className="text-center">
                    <button
                        onClick={onConfirmTurn}
                        disabled={!allChoicesMade || isLoading}
                        className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
                        aria-label={t('confirmDecisionsForYear', { year })}
                    >
                        {t('confirmDecisionsForYear', { year })}
                    </button>
                </div>
                <TurnSources sources={turnSources} />
            </>
        )
    }
    return null;
  }

  return (
    <div className="grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto p-4">
      {/* Left Column: Dashboard */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="bg-gray-900/80 p-5 rounded-lg border border-gray-700">
            <div className="text-center mb-6">
            <h2 className="text-3xl font-bold">{country.flag} {country.name}</h2>
            <div className="relative pt-4">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-900/50">
                    {YEARS.map((y, index) => (
                        <div key={y} className={`flex-1 shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${year > y ? 'bg-blue-500' : ''}`}></div>
                    ))}
                </div>
                <div className="flex justify-between text-xs mt-1">
                    {YEARS.map(y => <span key={y}>{y}</span>)}
                </div>
            </div>
            </div>
            
            <div className="mb-6">
                <p className="text-center text-gray-400 text-sm">{t('aiSuperpowerScore')}</p>
                <p className="text-center text-6xl font-bold font-orbitron text-blue-400">{superpowerScore.toFixed(0)}</p>
            </div>

            <div className="space-y-3">
            <MetricDisplay label={metricLabels.gdpContribution} value={(metrics.gdpContribution ?? 0).toFixed(1)} unit="%" max={MAX_METRICS.gdpContribution} tooltipText={metricTooltips.gdpContribution} />
            <MetricDisplay label={metricLabels.stemWorkforce} value={(metrics.stemWorkforce ?? 0).toFixed(1)} unit="M" max={MAX_METRICS.stemWorkforce} tooltipText={metricTooltips.stemWorkforce} />
            <MetricDisplay label={metricLabels.aiStartups} value={metrics.aiStartups ?? 0} unit="" max={MAX_METRICS.aiStartups} tooltipText={metricTooltips.aiStartups} />
            <MetricDisplay label={metricLabels.governmentAdoption} value={metrics.governmentAdoption ?? 0} unit="/10" max={MAX_METRICS.governmentAdoption} tooltipText={metricTooltips.governmentAdoption} />
            <MetricDisplay label={metricLabels.defenseSpending} value={(metrics.defenseSpending ?? 0).toFixed(1)} unit="%" max={MAX_METRICS.defenseSpending} tooltipText={metricTooltips.defenseSpending} />
            <MetricDisplay label={metricLabels.rdSpending} value={(metrics.rdSpending ?? 0).toFixed(1)} unit="%" max={MAX_METRICS.rdSpending} tooltipText={metricTooltips.rdSpending} />
            </div>
        </div>
      </div>

      {/* Middle Pane: Scenarios */}
      <div className="lg:col-span-2">
        {renderScenarioContent()}
      </div>

      {/* Right Column: History */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <GameHistory history={history} initialMetrics={initialMetrics} />
      </div>
    </div>
  );
};