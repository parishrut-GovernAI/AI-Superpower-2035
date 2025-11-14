import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from './types/game';
// FIX: Imported the `NewsItem` type to resolve a type error.
import type { Country, Metrics, Scenario, GameHistoryItem, CurveballEvent, NewsItem } from './types/game';
import { Header } from './components/Header';
import { CountrySelection } from './components/CountrySelection';
import { GameScreen } from './components/GameScreen';
import { GameEndScreen } from './components/GameEndScreen';
import { INITIAL_METRICS, YEARS, FINAL_YEAR, METRIC_WEIGHTS, MAX_METRICS, COUNTRY_MODIFIERS } from './constants/gameConstants';
import { generateScenarios, generateCollectiveOutcome, translateHistoryBatch } from './services/geminiService';
import { useLanguage } from './contexts/LanguageContext';
import { Loader } from './components/Loader';
import { CurveballEventModal } from './components/CurveballEventModal';
import { WelcomeScreen } from './components/WelcomeScreen';

// Add a new type for the translation cache.
type TranslationCache = {
    [langCode: string]: GameHistoryItem[];
};

const App: React.FC = () => {
    const { language, t, isFetchingTranslations } = useLanguage();
    const [gameState, setGameState] = useState<GameState>(GameState.WELCOME);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [currentYear, setCurrentYear] = useState<number>(YEARS[0]);
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [initialMetrics, setInitialMetrics] = useState<Metrics | null>(null);
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [turnChoices, setTurnChoices] = useState<Record<number, number>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isChangingLanguage, setIsChangingLanguage] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [superpowerScore, setSuperpowerScore] = useState<number>(0);
    const [history, setHistory] = useState<GameHistoryItem[]>([]);
    const [activeCurveball, setActiveCurveball] = useState<CurveballEvent | null>(null);
    const [turnSources, setTurnSources] = useState<any[]>([]);
    const prevLanguageRef = useRef(language);
    // Use a ref to store the original, untranslated history.
    const originalHistoryRef = useRef<GameHistoryItem[]>([]);
    // State to hold the cache of translated histories.
    const [translationCache, setTranslationCache] = useState<TranslationCache>({});

    const calculateSuperpowerScore = useCallback((currentMetrics: Metrics, initialMetrics: Metrics | null): number => {
        if (!initialMetrics) {
            return 0;
        }

        let totalScore = 0;
        for (const key in METRIC_WEIGHTS) {
            const metricKey = key as keyof Metrics;
            
            const initialValue = initialMetrics[metricKey];
            const currentValue = currentMetrics[metricKey];
            const maxValue = MAX_METRICS[metricKey];

            const potentialGrowth = maxValue - initialValue;

            if (potentialGrowth <= 0) {
                // This metric is already at or above its max potential.
                // Award full points as long as it hasn't decreased.
                if (currentValue >= initialValue) {
                    totalScore += METRIC_WEIGHTS[metricKey];
                }
                continue;
            }

            const actualGrowth = currentValue - initialValue;

            // Calculate progress as a percentage of the potential growth.
            // Clamp the value between 0 and 1.
            const normalizedProgress = Math.max(0, Math.min(actualGrowth / potentialGrowth, 1));
            
            totalScore += normalizedProgress * METRIC_WEIGHTS[metricKey];
        }
        return totalScore * 100;
    }, []);

    const fetchNewScenarios = useCallback(async (country: Country, year: number, currentMetrics: Metrics, currentHistory: GameHistoryItem[], lang: string) => {
        setIsLoading(true);
        setError(null);
        setScenarios([]);
        setTurnSources([]);
        setTurnChoices({});
        try {
            const { scenarios: newScenarios, sources: newSources } = await generateScenarios(country, year, currentMetrics, currentHistory, lang);
            setScenarios(newScenarios);
            setTurnSources(newSources);
        } catch (err) {
            console.error("Error generating scenarios:", err);
            setError(t('simulationErrorGeneric'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    // The translateHistory function now takes the original history as an argument.
    const translateHistory = useCallback(async (untranslatedHistory: GameHistoryItem[], lang: string): Promise<GameHistoryItem[] | null> => {
        if (untranslatedHistory.length === 0) return [];
        try {
            const translatedTurns = await translateHistoryBatch(untranslatedHistory, lang);
            const newHistory = untranslatedHistory.map((oldItem, index) => {
                const translatedData = translatedTurns[index];
                return {
                    ...oldItem,
                    scenarios: translatedData.translated_scenarios,
                    outcome: translatedData.translated_outcome,
                };
            });
            return newHistory;
        } catch (err) {
            console.error("Error translating history:", err);
            setError(t('historyTranslationError'));
            return null;
        }
    }, [t]);

    useEffect(() => {
        const handleLanguageChange = async () => {
            if (gameState === GameState.IN_PROGRESS && selectedCountry && metrics) {
                setIsLoading(true);
                setError(null);
                setScenarios([]);
                setTurnChoices({});
                setTurnSources([]);

                // Check if the translation for the target language is already cached.
                if (translationCache[language]) {
                    setHistory(translationCache[language]);
                } else {
                    // If not cached, call the translation service.
                    const translatedHistory = await translateHistory(originalHistoryRef.current, language);
                    if (translatedHistory) {
                        setHistory(translatedHistory);
                        // Store the newly translated history in the cache.
                        setTranslationCache(prev => ({ ...prev, [language]: translatedHistory }));
                    }
                }

                // Always fetch new scenarios for the current turn in the new language.
                try {
                    const scenariosResult = await generateScenarios(selectedCountry, currentYear, metrics, originalHistoryRef.current, language);
                    setScenarios(scenariosResult.scenarios);
                    setTurnSources(scenariosResult.sources);
                } catch (err) {
                    console.error("Error during language change processing:", err);
                    setError(t('simulationErrorGeneric'));
                } finally {
                    setIsLoading(false);
                }
            }
        };

        const hasLanguageChanged = prevLanguageRef.current !== language;
        // The check for `isLoading` is removed here to allow language changes
        // even if a background process is running, as the new language state
        // should take precedence.
        if (hasLanguageChanged) {
            setIsChangingLanguage(true);
            handleLanguageChange();
        }
        prevLanguageRef.current = language;
    // The dependency array is updated to correctly handle state changes.
    }, [language, gameState, selectedCountry, currentYear, metrics, t, translateHistory, translationCache]);
    
    useEffect(() => {
        if (isChangingLanguage) {
            if (!isFetchingTranslations && !isLoading) {
                setIsChangingLanguage(false);
            }
        }
    }, [isChangingLanguage, isFetchingTranslations, isLoading]);

    const handleEnter = () => {
        setGameState(GameState.SELECTING_COUNTRY);
    };

    const handleCountrySelect = useCallback((country: Country) => {
        const baseMetrics = INITIAL_METRICS[country.id];
        const modifiers = COUNTRY_MODIFIERS[country.id];

        const startingMetrics: Metrics = {
            ...baseMetrics,
            gdpContribution: baseMetrics.gdpContribution + (modifiers.gdpContribution || 0),
            stemWorkforce: baseMetrics.stemWorkforce + (modifiers.stemWorkforce || 0),
            aiStartups: baseMetrics.aiStartups + (modifiers.aiStartups || 0),
            governmentAdoption: baseMetrics.governmentAdoption + (modifiers.governmentAdoption || 0),
            defenseSpending: baseMetrics.defenseSpending + (modifiers.defenseSpending || 0),
            rdSpending: baseMetrics.rdSpending + (modifiers.rdSpending || 0),
        };

        setSelectedCountry(country);
        setMetrics(startingMetrics);
        setInitialMetrics(startingMetrics);
        setCurrentYear(YEARS[0]);
        setGameState(GameState.IN_PROGRESS);
        setSuperpowerScore(calculateSuperpowerScore(startingMetrics, startingMetrics));
        setHistory([]);
        originalHistoryRef.current = []; // Reset original history
        setTranslationCache({}); // Reset translation cache
        setTurnSources([]);
        fetchNewScenarios(country, YEARS[0], startingMetrics, [], language);
    }, [calculateSuperpowerScore, fetchNewScenarios, language]);

    const handleChoiceSelect = (scenarioIndex: number, choiceIndex: number) => {
        setTurnChoices(prev => ({ ...prev, [scenarioIndex]: choiceIndex }));
    };
    
    const handleConfirmTurn = async () => {
        if (!selectedCountry || !metrics || !scenarios || !initialMetrics || Object.keys(turnChoices).length !== scenarios.length) return;

        setIsLoading(true);
        setError(null);

        const orderedChoiceIndices = scenarios.map((_, index) => turnChoices[index]);
        const orderedChoices = scenarios.map((scenario, index) => scenario.choices[orderedChoiceIndices[index]]);

        try {
            // Generate the outcome in the current language.
            const result = await generateCollectiveOutcome(selectedCountry, currentYear, metrics, scenarios, orderedChoices, language);
            const newMetrics = result.updated_metrics;

            const curveballNewsItem = result.news_feed?.find((item: NewsItem) => item.is_curveball && item.event);

            const newHistoryItem: GameHistoryItem = {
                year: currentYear,
                scenarios: scenarios,
                choiceIndices: orderedChoiceIndices,
                outcome: result.outcome_summary,
                metrics: newMetrics,
                newsFeed: result.news_feed,
            };
            
            // Store the untranslated version of the new history item.
            // A "true" original history would require re-generating the outcome in English,
            // but for caching purposes, we can use the current language's output as the "original"
            // and translate from there. This is a pragmatic approach to avoid extra API calls.
            const newOriginalHistory = [newHistoryItem, ...originalHistoryRef.current];
            originalHistoryRef.current = newOriginalHistory;

            // Update the displayed history and the cache for the current language.
            const newDisplayedHistory = [newHistoryItem, ...history];
            setHistory(newDisplayedHistory);
            setTranslationCache(prev => ({ ...prev, [language]: newDisplayedHistory }));


            setMetrics(newMetrics);
            setSuperpowerScore(calculateSuperpowerScore(newMetrics, initialMetrics));

            if (curveballNewsItem?.event) {
                setActiveCurveball(curveballNewsItem.event);
                setIsLoading(false);
            } else {
                const nextYear = currentYear + 5;
                if (nextYear > FINAL_YEAR) {
                    setGameState(GameState.GAME_OVER);
                    setIsLoading(false);
                } else {
                    setCurrentYear(nextYear);
                    // Fetch new scenarios using the untranslated history for context.
                    await fetchNewScenarios(selectedCountry, nextYear, newMetrics, newOriginalHistory, language);
                }
            }
        } catch (err) {
            console.error("Error generating outcome:", err);
            setError(t('outcomeErrorGeneric'));
            setIsLoading(false);
        }
    };

    const handleCurveballDecision = async (choiceIndex: number) => {
        if (!activeCurveball || !metrics || !initialMetrics || !selectedCountry) return;
    
        const choice = activeCurveball.choices[choiceIndex];
        
        const updatedMetrics = { ...metrics };
        for (const key in choice.metric_impacts) {
            const metricKey = key as keyof Metrics;
            updatedMetrics[metricKey] += choice.metric_impacts[metricKey] ?? 0;
            if (updatedMetrics[metricKey] < 0) {
                 updatedMetrics[metricKey] = 0;
            }
        }
    
        setMetrics(updatedMetrics);
        setSuperpowerScore(calculateSuperpowerScore(updatedMetrics, initialMetrics));
    
        // Update both the original and the displayed (translated) history.
        const newOriginalHistory = [...originalHistoryRef.current];
        if (newOriginalHistory.length > 0) {
            newOriginalHistory[0] = { 
                ...newOriginalHistory[0], 
                curveballChoiceIndex: choiceIndex, 
                metrics: updatedMetrics 
            };
            originalHistoryRef.current = newOriginalHistory;
        }

        const newDisplayedHistory = [...history];
        if (newDisplayedHistory.length > 0) {
            newDisplayedHistory[0] = { 
                ...newDisplayedHistory[0], 
                curveballChoiceIndex: choiceIndex, 
                metrics: updatedMetrics 
            };
            setHistory(newDisplayedHistory);
            // Update the cache for the current language.
            setTranslationCache(prev => ({ ...prev, [language]: newDisplayedHistory }));
        }
    
        setActiveCurveball(null);
    
        const nextYear = currentYear + 5;
        if (nextYear > FINAL_YEAR) {
            setGameState(GameState.GAME_OVER);
        } else {
            setCurrentYear(nextYear);
            // Pass the updated original history to generate the next turn's scenarios.
            await fetchNewScenarios(selectedCountry, nextYear, updatedMetrics, newOriginalHistory, language);
        }
    };
    
    const handleRestart = () => {
        setGameState(GameState.SELECTING_COUNTRY);
        setSelectedCountry(null);
        setMetrics(null);
        setInitialMetrics(null);
        setScenarios([]);
        setTurnChoices({});
        setError(null);
        setCurrentYear(YEARS[0]);
        setHistory([]);
        originalHistoryRef.current = []; // Reset original history
        setTranslationCache({}); // Reset translation cache
        setActiveCurveball(null);
        setTurnSources([]);
    };

    const renderContent = () => {
        switch (gameState) {
            case GameState.SELECTING_COUNTRY:
                return <CountrySelection onSelect={handleCountrySelect} />;
            case GameState.IN_PROGRESS:
                if (selectedCountry && metrics) {
                    return (
                        <GameScreen
                            country={selectedCountry}
                            year={currentYear}
                            metrics={metrics}
                            scenarios={scenarios}
                            turnChoices={turnChoices}
                            superpowerScore={superpowerScore}
                            onSelectChoice={handleChoiceSelect}
                            onConfirmTurn={handleConfirmTurn}
                            isLoading={isLoading}
                            error={error}
                            history={history}
                            initialMetrics={initialMetrics}
                            turnSources={turnSources}
                        />
                    );
                }
                return null;
            case GameState.GAME_OVER:
                 if (selectedCountry) {
                    return <GameEndScreen score={superpowerScore} country={selectedCountry} onRestart={handleRestart} finalYear={FINAL_YEAR} />;
                 }
                 return null;
            default:
                return null;
        }
    };
    
    if (gameState === GameState.WELCOME) {
        return <WelcomeScreen onEnter={handleEnter} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100">
             {isChangingLanguage && (
                 <div className="fixed inset-0 bg-gray-900/95 flex items-center justify-center z-50">
                    <Loader textKey="changingLanguage" />
                </div>
            )}
            {activeCurveball && (
                <CurveballEventModal event={activeCurveball} onSelectChoice={handleCurveballDecision} />
            )}
            <Header />
            <main className={`py-8 transition-all duration-300 ${isChangingLanguage || activeCurveball ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'}`}>
                {renderContent()}
            </main>
        </div>
    );
};

export default App;