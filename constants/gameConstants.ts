import type { Country, Metrics } from '../types/game';

export const COUNTRIES: Country[] = [
  {
    id: 'singapore',
    name: 'Singapore',
    flag: '🇸🇬',
    description: 'countryDescription_singapore',
    specialAbilityName: 'abilityName_singapore',
    specialAbilityDescription: 'abilityDesc_singapore'
  },
  {
    id: 'indonesia',
    name: 'Indonesia',
    flag: '🇮🇩',
    description: 'countryDescription_indonesia',
    specialAbilityName: 'abilityName_indonesia',
    specialAbilityDescription: 'abilityDesc_indonesia'
  },
  {
    id: 'laos',
    name: 'Laos',
    flag: '🇱🇦',
    description: 'countryDescription_laos',
    specialAbilityName: 'abilityName_laos',
    specialAbilityDescription: 'abilityDesc_laos'
  },
  {
    id: 'india',
    name: 'India',
    flag: '🇮🇳',
    description: 'countryDescription_india',
    specialAbilityName: 'abilityName_india',
    specialAbilityDescription: 'abilityDesc_india'
  },
  {
    id: 'china',
    name: 'China',
    flag: '🇨🇳',
    description: 'countryDescription_china',
    specialAbilityName: 'abilityName_china',
    specialAbilityDescription: 'abilityDesc_china'
  },
  {
    id: 'usa',
    name: 'United States',
    flag: '🇺🇸',
    description: 'countryDescription_usa',
    specialAbilityName: 'abilityName_usa',
    specialAbilityDescription: 'abilityDesc_usa'
  },
  {
    id: 'philippines',
    name: 'Philippines',
    flag: '🇵🇭',
    description: 'countryDescription_philippines',
    specialAbilityName: 'abilityName_philippines',
    specialAbilityDescription: 'abilityDesc_philippines'
  },
  {
    id: 'eu',
    name: 'European Union',
    flag: '🇪🇺',
    description: 'countryDescription_eu',
    specialAbilityName: 'abilityName_eu',
    specialAbilityDescription: 'abilityDesc_eu'
  }
];

export const INITIAL_METRICS: Record<Country['id'], Metrics> = {
  singapore: {
    gdpContribution: 5,
    stemWorkforce: 1.5,
    aiStartups: 500,
    governmentAdoption: 8,
    defenseSpending: 10,
    rdSpending: 15,
  },
  indonesia: {
    gdpContribution: 1,
    stemWorkforce: 5,
    aiStartups: 200,
    governmentAdoption: 4,
    defenseSpending: 3,
    rdSpending: 5,
  },
  laos: {
    gdpContribution: 0.5,
    stemWorkforce: 0.5,
    aiStartups: 20,
    governmentAdoption: 2,
    defenseSpending: 1,
    rdSpending: 2,
  },
  india: {
    gdpContribution: 2,
    stemWorkforce: 10,
    aiStartups: 400,
    governmentAdoption: 5,
    defenseSpending: 4,
    rdSpending: 6,
  },
  china: {
    gdpContribution: 4,
    stemWorkforce: 15,
    aiStartups: 800,
    governmentAdoption: 9,
    defenseSpending: 15,
    rdSpending: 20,
  },
  usa: {
    gdpContribution: 6,
    stemWorkforce: 12,
    aiStartups: 1200,
    governmentAdoption: 7,
    defenseSpending: 18,
    rdSpending: 25,
  },
  philippines: {
    gdpContribution: 1.5,
    stemWorkforce: 3,
    aiStartups: 150,
    governmentAdoption: 3,
    defenseSpending: 2,
    rdSpending: 4,
  },
  eu: {
    gdpContribution: 5.5,
    stemWorkforce: 14,
    aiStartups: 700,
    governmentAdoption: 6,
    defenseSpending: 12,
    rdSpending: 22,
  },
};

export const COUNTRY_MODIFIERS: Record<Country['id'], Partial<Metrics>> = {
  singapore: { aiStartups: 100 },
  indonesia: { stemWorkforce: 1 },
  laos: { governmentAdoption: 1 },
  india: { stemWorkforce: 2 },
  china: { governmentAdoption: 1, rdSpending: 2 },
  usa: { aiStartups: 200 },
  philippines: { gdpContribution: 0.5 },
  eu: { rdSpending: 3 },
};

export const MAX_METRICS: Metrics = {
    gdpContribution: 40,
    stemWorkforce: 20,
    aiStartups: 5000,
    governmentAdoption: 10,
    defenseSpending: 30,
    rdSpending: 30,
};

export const METRIC_WEIGHTS: Record<keyof Metrics, number> = {
    gdpContribution: 0.25,
    stemWorkforce: 0.20,
    aiStartups: 0.20,
    governmentAdoption: 0.15,
    defenseSpending: 0.10,
    rdSpending: 0.10,
};

export const YEARS = [2025, 2030, 2035];
export const FINAL_YEAR = 2035;