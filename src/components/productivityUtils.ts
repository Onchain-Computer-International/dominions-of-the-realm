import { Player, Season } from '../types/game';
import { calculateTotalFamilyMembers, getSeasonalProductivityModifier } from '../Game';

// Calculate base efficiency (now just returns base value since no passive bonuses)
export function calculateBaseEfficiency(): number {
  return 0.5; // Base efficiency is 0.5
}

// Calculate the final efficiency multiplier including seasonal effects
export function calculateEfficiencyMultiplier(player: Player, season: Season): number {
  const baseEfficiency = calculateBaseEfficiency();
  const seasonalModifier = getSeasonalProductivityModifier(season);
  return baseEfficiency * seasonalModifier;
}

// Calculate maximum productivity points based on family size and efficiency
export function calculateMaxProductivityPoints(player: Player, season: Season): number {
  const totalFamilyMembers = calculateTotalFamilyMembers(player);
  const efficiency = calculateEfficiencyMultiplier(player, season);
  return Math.floor(totalFamilyMembers * efficiency);
}

// Reset productivity points to maximum at start of turn
export function resetProductivityPoints(player: Player, season: Season): void {
  player.productivityMultiplier = calculateEfficiencyMultiplier(player, season);
  player.productivityPoints = calculateMaxProductivityPoints(player, season);
}