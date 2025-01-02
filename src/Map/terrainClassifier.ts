import type { TerrainType, BiomeType } from '../types/game';

const ELEVATION_THRESHOLDS = {
  DEEP_OCEAN: 0.2,
  OCEAN: 0.3,
  COAST: 0.35,
  BEACH: 0.37,
  LOWLAND: 0.5,
  HILLS: 0.7,
  MOUNTAINS: 0.85,
} as const;

const MOISTURE_THRESHOLDS = {
  ARID: 0.3,
  DRY: 0.45,
  MODERATE: 0.65,
  WET: 0.8,
} as const;

export function determineTerrainType(elevation: number, moisture: number): TerrainType {
  if (elevation < ELEVATION_THRESHOLDS.DEEP_OCEAN) return 'ocean';
  if (elevation < ELEVATION_THRESHOLDS.OCEAN) return 'ocean';
  if (elevation < ELEVATION_THRESHOLDS.COAST) return 'coast';
  if (elevation < ELEVATION_THRESHOLDS.BEACH) return 'beach';
  
  // Land features
  if (elevation > ELEVATION_THRESHOLDS.MOUNTAINS) return 'mountains';
  if (elevation > ELEVATION_THRESHOLDS.HILLS) return 'hills';
  
  // Moisture-based terrain
  if (moisture < MOISTURE_THRESHOLDS.ARID) return 'desert';
  if (moisture > MOISTURE_THRESHOLDS.WET) {
    return elevation > ELEVATION_THRESHOLDS.LOWLAND ? 'rainforest' : 'swamp';
  }
  if (moisture > MOISTURE_THRESHOLDS.MODERATE) return 'forest';
  if (moisture > MOISTURE_THRESHOLDS.DRY) return 'grassland';
  
  return 'plains';
}

export function determineBiome(elevation: number, moisture: number, temperature: number): BiomeType {
  if (temperature < 0.2) return 'polar';
  if (temperature < 0.4) return 'continental';
  if (moisture < 0.3) return 'arid';
  if (temperature > 0.7) return 'tropical';
  return 'temperate';
} 