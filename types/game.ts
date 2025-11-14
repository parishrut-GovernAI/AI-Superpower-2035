
export interface Country {
  id: 'singapore' | 'laos' | 'indonesia' | 'india' | 'china' | 'usa' | 'philippines' | 'eu';
  name: string;
  flag: string;
  description: string;
  specialAbilityName: string;
  specialAbilityDescription: string;
}

export interface Metrics {
  gdpContribution: number; // in %
  stemWorkforce: number; // in millions
  aiStartups: number; // absolute number
  governmentAdoption: number; // score 1-10
  defenseSpending: number; // in % of budget
  rdSpending: number; // in % of budget
}

export interface Jargon {
  term: string;
  definition: string;
}

export interface CurveballEventChoice {
    choice_text: string;
    metric_impacts: Partial<Metrics>;
}

export interface CurveballEvent {
    event_title: string;
    event_description: string;
    choices: CurveballEventChoice[];
}

export interface NewsItem {
  headline: string;
  summary: string;
  is_curveball: boolean;
  event?: CurveballEvent;
}

export interface Scenario {
  scenario_title: string;
  scenario_description: string;
  choices: string[];
  jargons?: Jargon[];
}

export interface GameHistoryItem {
    year: number;
    scenarios: Scenario[];
    choiceIndices: number[];
    outcome: string;
    metrics: Metrics;
    newsFeed?: NewsItem[];
    curveballChoiceIndex?: number;
}

export enum GameState {
    WELCOME,
    SELECTING_COUNTRY,
    IN_PROGRESS,
    GAME_OVER,
}