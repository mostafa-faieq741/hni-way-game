/**
 * gameConfig.js
 * Central configuration constants for the HNI Way Game.
 * All game-wide rules and thresholds live here so they are easy to adjust
 * and easy to wire to a future Google Sheets "game_config" tab.
 */

export const GAME_CONFIG = {
  totalQuarters:              20,
  quartersPerYear:            4,
  totalYears:                 5,
  startingCash:               100_000,
  forecastCostPerYear:        15_000,
  specialistCostPerQuarter:   5_000,
  consultantCostPerQuarter:   10_000,
  winReputationThreshold:     100,   // must exceed this to qualify for leaderboard
  maxReputation:              200,
}

/** Project level matrix – used for validation and mock data generation */
export const PROJECT_LEVEL_MATRIX = [
  {
    level:               1,
    stars:               1,
    label:               '1-Star',
    minReputation:       0,
    salesRequirement:    { type: 'specialist', count: 1 },
    departmentsRequired: 2,
    maxRevenue:          25_000,
    costRatioMin:        0.40,
    costRatioMax:        0.50,
  },
  {
    level:               2,
    stars:               2,
    label:               '2-Star',
    minReputation:       10,
    salesRequirement:    { type: 'specialist', count: 1 },
    departmentsRequired: 3,
    maxRevenue:          55_000,
    costRatioMin:        0.35,
    costRatioMax:        0.45,
  },
  {
    level:               3,
    stars:               3,
    label:               '3-Star',
    minReputation:       50,
    salesRequirement:    { type: 'consultant', count: 1 },
    departmentsRequired: 5,
    maxRevenue:          90_000,
    costRatioMin:        0.25,
    costRatioMax:        0.35,
  },
  {
    level:               4,
    stars:               4,
    label:               '4-Star',
    minReputation:       100,
    salesRequirement:    { type: 'consultant', count: 2 },
    departmentsRequired: 8,
    maxRevenue:          1_000_000,
    costRatioMin:        0.20,
    costRatioMax:        0.25,
  },
]
