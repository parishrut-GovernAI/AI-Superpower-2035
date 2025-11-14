
import React, { useState } from 'react';
import type { Scenario } from '../types/game';

interface ScenarioCardProps {
    scenario: Scenario;
    onSelectChoice: (choiceIndex: number) => void;
    selectedChoiceIndex?: number;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onSelectChoice, selectedChoiceIndex }) => {
    const [justClicked, setJustClicked] = useState<number | null>(null);

    const handleChoiceClick = (index: number) => {
        onSelectChoice(index);
        setJustClicked(index);
        setTimeout(() => {
            setJustClicked(null);
        }, 250); // Match animation duration
    };

    return (
        <div className="bg-gray-800/70 p-6 rounded-lg shadow-lg border border-gray-700 h-full flex flex-col">
            <h2 className="text-xl font-bold font-orbitron text-purple-400 mb-3">{scenario.scenario_title}</h2>
            <div className="mb-6 flex-grow">
                <p className="text-gray-300">
                    {scenario.scenario_description}
                </p>
            </div>
            <div className="flex flex-col space-y-3">
                {scenario.choices.map((choice, index) => {
                    const isSelected = selectedChoiceIndex === index;
                    const isAnimating = justClicked === index;
                    return (
                        <button
                            key={index}
                            onClick={() => handleChoiceClick(index)}
                            className={`w-full text-left p-4 rounded-lg transition-colors duration-150 text-gray-200 text-sm ${
                                isSelected 
                                ? 'bg-purple-600 ring-2 ring-purple-300' 
                                : 'bg-gray-700 hover:bg-purple-500'
                            } ${isAnimating ? 'animate-pulse-once' : ''}`}
                        >
                            {choice}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};