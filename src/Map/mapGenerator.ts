import { Card, baseCards } from '../Cards';
import { noise2d } from './noiseGenerator';

const ELEVATION_SCALE = 0.03;
const MOISTURE_SCALE = 0.04;
const TEMPERATURE_SCALE = 0.02;
const DETAIL_SCALE = 0.2;

const RIDGE_SCALE = 0.08;
const RIVER_THRESHOLD = 0.78;
const MOUNTAIN_THRESHOLD = 0.65;

// Additional constants for advanced terrain features
const CONTINENT_SCALE = 0.01;  // Large-scale landmass features
const EROSION_SCALE = 0.15;    // For erosion patterns
const PLATEAU_THRESHOLD = 0.72; // For flat-topped mountains
const COAST_GRADIENT = 0.1;    // For coastal shelves
const VALLEY_DEPTH = 0.3;      // How deep valleys cut into terrain

// Add new constants for biome generation
const BIOME_SCALE = 0.04;        // Increased from 0.015 for smaller regions
const TRANSITION_SCALE = 0.08;    // Increased from 0.05 for sharper transitions
const BIOME_INFLUENCE = 0.6;      // Increased from 0.4 for stronger biome characteristics
const BIOME_NOISE_OCTAVES = 3;    // Multiple noise layers for more varied regions

type TerrainType = 'mountains' | 'hills' | 'plains' | 'desert' | 'rainforest' | 
                   'forest' | 'tundra' | 'river' | 'lake' | 'ocean' | 'swamp' | 'woods';

type BiomeType = 'alpine' | 'coastal' | 'temperate' | 'tropical' | 
                 'arid' | 'wetland' | 'tundra' | 'aquatic';

// Biome definitions with their characteristic features
interface BiomeDefinition {
  elevation: number;
  moistureMin: number;
  moistureMax: number;
  tempMin: number;
  tempMax: number;
  cards: string[];
  weight: number;  // Added weight property
}

const biomeDefinitions: Record<BiomeType, BiomeDefinition> = {
  alpine: {
    elevation: 0.7,
    moistureMin: 0.3,
    moistureMax: 0.8,
    tempMin: 0.0,
    tempMax: 0.4,
    cards: ['copper', 'silver', 'gold', 'mountains'],
    weight: 0.4  // Rarer due to valuable resources
  },
  coastal: {
    elevation: 0.3,
    moistureMin: 0.6,
    moistureMax: 1.0,
    tempMin: 0.3,
    tempMax: 0.7,
    cards: ['river', 'lake', 'ocean'],
    weight: 0.7  // Common
  },
  temperate: {
    elevation: 0.5,
    moistureMin: 0.4,
    moistureMax: 0.7,
    tempMin: 0.3,
    tempMax: 0.6,
    cards: ['woods', 'forest', 'hills', 'plains'],
    weight: 1.0  // Most common
  },
  tropical: {
    elevation: 0.4,
    moistureMin: 0.7,
    moistureMax: 1.0,
    tempMin: 0.6,
    tempMax: 1.0,
    cards: ['rainforest', 'forest', 'groves'],
    weight: 0.5  // Moderately rare
  },
  arid: {
    elevation: 0.5,
    moistureMin: 0.0,
    moistureMax: 0.3,
    tempMin: 0.6,
    tempMax: 1.0,
    cards: ['desert', 'hills', 'plains'],
    weight: 0.6  // Moderately common
  },
  wetland: {
    elevation: 0.3,
    moistureMin: 0.7,
    moistureMax: 1.0,
    tempMin: 0.4,
    tempMax: 0.7,
    cards: ['swamp', 'river', 'lake'],
    weight: 0.5  // Moderately rare
  },
  tundra: {
    elevation: 0.5,
    moistureMin: 0.3,
    moistureMax: 0.6,
    tempMin: 0.0,
    tempMax: 0.3,
    cards: ['tundra', 'hills', 'plains'],
    weight: 0.4  // Rarer
  },
  aquatic: {
    elevation: 0.2,
    moistureMin: 0.8,
    moistureMax: 1.0,
    tempMin: 0.3,
    tempMax: 0.7,
    cards: ['ocean', 'lake', 'river'],
    weight: 0.6  // Moderately common
  }
};

function calculateBiomeWeight(biome: BiomeType, noise: number, latitude: number): number {
  const def = biomeDefinitions[biome];
  let weight = def.weight;

  // Calculate average rarity with more variance
  const biomeCards = baseCards.filter(card => 
    def.cards.includes(card.id) && card.type.includes('treasure')
  );
  
  const avgRarity = biomeCards.reduce((sum, card) => sum + (card.rarity || 5), 0) / biomeCards.length;
  
  // Adjust weight based on card rarity with more dramatic effect
  weight *= (11 - avgRarity) / 4;  // Increased from 5 to 4 for more variance

  // More dramatic noise influence
  weight *= 1 + noise * 0.4;  // Increased from 0.3

  // Enhanced latitude adjustments
  switch (biome) {
    case 'tundra':
      weight *= 1 + Math.pow(latitude, 1.5) * 2;
      break;
    case 'tropical':
      weight *= 1 + Math.pow(1 - latitude, 1.5) * 2;
      break;
    case 'alpine':
      weight *= 1 + Math.pow(Math.abs(noise), 1.5) * 3;
      break;
    case 'temperate':
      weight *= 1 + Math.sin(latitude * Math.PI * 2) * 0.6;  // Double frequency
      break;
    case 'coastal':
      weight *= 1 + Math.cos(latitude * Math.PI) * 0.4;
      break;
  }

  return weight;
}

function generateBiomeInfluence(x: number, y: number, seed: number): BiomeType {
  let biomeNoise = 0;
  let amplitude = 1;
  let frequency = 1;
  
  // Generate more detailed noise for biome variation
  for (let i = 0; i < BIOME_NOISE_OCTAVES; i++) {
    biomeNoise += amplitude * noise2d(
      x * BIOME_SCALE * frequency + i * 100, 
      y * BIOME_SCALE * frequency + i * 100, 
      seed + 1000 + i
    );
    amplitude *= 0.5;
    frequency *= 2;
  }
  
  // Add secondary noise layer for more variation
  const secondaryNoise = noise2d(
    x * BIOME_SCALE * 2.1, 
    y * BIOME_SCALE * 2.1, 
    seed + 2000
  );
  
  const transitionNoise = noise2d(
    x * TRANSITION_SCALE, 
    y * TRANSITION_SCALE, 
    seed + 1001
  );
  
  const latitude = Math.abs(y) / 100;
  // Add more variance to latitude influence
  const modifiedLatitude = latitude + transitionNoise * 0.3 + secondaryNoise * 0.2;

  // Calculate weights with additional variation
  const biomeWeights = Object.entries(biomeDefinitions).map(([biome, def]) => {
    let weight = calculateBiomeWeight(biome as BiomeType, biomeNoise, modifiedLatitude);
    
    // Add more local variation to weights
    weight *= 1 + secondaryNoise * 0.4;
    
    // Add some random variation for each position
    weight *= 1 + noise2d(x * 0.1, y * 0.1, seed + 3000) * 0.2;
    
    return {
      biome: biome as BiomeType,
      weight
    };
  });

  // Sort by weight but keep more options viable
  biomeWeights.sort((a, b) => b.weight - a.weight);
  
  // Take more top choices for more variety
  const topChoices = biomeWeights.slice(0, 4);  // Increased from 3
  
  // Add more randomness to selection
  const randomFactor = noise2d(
    x * BIOME_SCALE * 3 + secondaryNoise, 
    y * BIOME_SCALE * 3 + transitionNoise, 
    seed + 1002
  );
  
  const totalWeight = topChoices.reduce((sum, b) => sum + b.weight, 0);
  let selection = (randomFactor + 1) / 2 * totalWeight;
  
  // Add chance for random selection from top choices
  if (Math.random() < 0.15) {  // 15% chance for random selection
    return topChoices[Math.floor(Math.random() * topChoices.length)].biome;
  }
  
  // Normal weighted selection
  for (const biomeChoice of topChoices) {
    selection -= biomeChoice.weight;
    if (selection <= 0) {
      return biomeChoice.biome;
    }
  }

  return topChoices[0].biome;
}

// Custom terrain classification based on our card types
function classifyTerrain(elevation: number, moisture: number, temperature: number): {
  type: TerrainType;
  biome: BiomeType;
} {
  // Elevation thresholds
  const DEEP_WATER = 0.25;
  const SHALLOW_WATER = 0.35;
  const LOWLAND = 0.45;
  const HILLS = 0.65;
  const MOUNTAINS = 0.75;

  // Moisture thresholds
  const DRY = 0.3;
  const MODERATE = 0.5;
  const WET = 0.7;

  // Temperature thresholds
  const COLD = 0.3;
  const COOL = 0.4;
  const WARM = 0.6;
  const HOT = 0.8;

  let type: TerrainType;
  let biome: BiomeType;

  // First determine basic elevation-based terrain
  if (elevation < DEEP_WATER) {
    type = 'ocean';
    biome = 'aquatic';
  } else if (elevation < SHALLOW_WATER) {
    // Shallow waters can be lakes or coastal areas
    if (moisture > WET) {
      type = 'lake';
      biome = 'aquatic';
    } else {
      type = 'river';
      biome = 'coastal';
    }
  } else if (elevation > MOUNTAINS) {
    type = 'mountains';
    biome = 'alpine';
  } else if (elevation > HILLS) {
    type = 'hills';
    biome = temperature < COLD ? 'tundra' : 'temperate';
  } else {
    // For middle elevations, use moisture and temperature
    if (moisture > WET) {
      if (temperature > WARM) {
        type = 'rainforest';
        biome = 'tropical';
      } else if (temperature > COOL) {
        type = 'forest';
        biome = 'temperate';
      } else {
        type = 'woods';
        biome = 'temperate';
      }
    } else if (moisture > MODERATE) {
      if (temperature < COLD) {
        type = 'tundra';
        biome = 'tundra';
      } else if (elevation < LOWLAND) {
        type = 'swamp';
        biome = 'wetland';
      } else {
        type = 'woods';
        biome = 'temperate';
      }
    } else if (moisture < DRY) {
      if (temperature > HOT) {
        type = 'desert';
        biome = 'arid';
      } else {
        type = 'plains';
        biome = 'temperate';
      }
    } else {
      type = 'plains';
      biome = temperature < COOL ? 'tundra' : 'temperate';
    }
  }

  return { type, biome };
}

function generateTerrain(x: number, y: number, seed: number): {
  type: TerrainType;
  elevation: number;
  moisture: number;
  temperature: number;
  biome: BiomeType;
} {
  // Get biome influence first
  const dominantBiome = generateBiomeInfluence(x, y, seed);
  const biomeDef = biomeDefinitions[dominantBiome];
  
  // Generate base terrain features
  let elevation = 0;
  let amplitude = 1;
  let frequency = 1;
  
  // Generate detailed elevation with multiple layers
  for (let i = 0; i < 8; i++) {
    const nx = x * ELEVATION_SCALE * frequency;
    const ny = y * ELEVATION_SCALE * frequency;
    
    // Use different noise functions for variety
    let noiseValue = noise2d(nx, ny, seed + i);
    
    // Add turbulence to create more varied terrain
    if (i > 3) {
      const turbulence = Math.abs(noise2d(nx * 2, ny * 2, seed + i + 100));
      noiseValue *= (1 + turbulence * 0.3);
    }
    
    elevation += amplitude * noiseValue;
    amplitude *= 0.5;
    frequency *= 2.1;  // Non-integer multiplier for less regular patterns
  }
  
  // Normalize elevation
  elevation = (elevation + 1) / 2;
  
  // Apply continental influence
  const continentalNoise = noise2d(x * CONTINENT_SCALE, y * CONTINENT_SCALE, seed);
  elevation = elevation * 0.7 + (continentalNoise + 1) / 2 * 0.3;

  // Generate ridge systems
  const ridgeNoise = Math.abs(noise2d(x * RIDGE_SCALE, y * RIDGE_SCALE, seed + 100));
  const ridgeInfluence = Math.pow(ridgeNoise, 2.5);  // Adjusted power for sharper ridges
  
  // Create plateaus in mountainous regions
  const plateauNoise = noise2d(x * RIDGE_SCALE * 0.5, y * RIDGE_SCALE * 0.5, seed + 200);
  if (elevation > PLATEAU_THRESHOLD && plateauNoise > 0) {
    elevation = PLATEAU_THRESHOLD + (elevation - PLATEAU_THRESHOLD) * 0.3;
  }
  
  // Apply ridge influence
  elevation = elevation * 0.8 + ridgeInfluence * 0.2;

  // Generate moisture with improved river systems
  let moisture = 0;
  let moistureAmplitude = 1;
  
  // Multiple moisture layers for varied wetness patterns
  for (let i = 0; i < 4; i++) {
    const moistureNoise = noise2d(
      x * MOISTURE_SCALE * (i + 1), 
      y * MOISTURE_SCALE * (i + 1), 
      seed + 20 + i
    );
    
    moisture += moistureAmplitude * moistureNoise;
    moistureAmplitude *= 0.5;
  }
  moisture = (moisture + 1) / 2;

  // River system generation
  const riverNoise = noise2d(x * MOISTURE_SCALE * 2, y * MOISTURE_SCALE * 2, seed + 40);
  const riverGradient = noise2d(x * MOISTURE_SCALE, y * MOISTURE_SCALE, seed + 41);
  
  // Rivers form in valleys and follow elevation gradients
  if (riverNoise > RIVER_THRESHOLD && elevation < 0.7 && riverGradient < 0.3) {
    moisture = 1;
    elevation *= 0.85;
    
    // Create river valleys
    const valleyWidth = Math.abs(noise2d(x * EROSION_SCALE, y * EROSION_SCALE, seed + 42));
    if (valleyWidth < 0.3) {
      elevation -= VALLEY_DEPTH * (0.3 - valleyWidth);
    }
  }

  // Adjust elevation based on biome
  elevation = elevation * (1 - BIOME_INFLUENCE) + 
             biomeDef.elevation * BIOME_INFLUENCE;

  // Adjust moisture to fit biome characteristics
  const biomeRange = biomeDef.moistureMax - biomeDef.moistureMin;
  moisture = moisture * (1 - BIOME_INFLUENCE) +
            (biomeDef.moistureMin + biomeRange * Math.random()) * BIOME_INFLUENCE;

  // Temperature with biome influence
  const baseTemperature = noise2d(x * TEMPERATURE_SCALE, y * TEMPERATURE_SCALE, seed + 30);
  const tempRange = biomeDef.tempMax - biomeDef.tempMin;
  const temperature = baseTemperature * (1 - BIOME_INFLUENCE) +
                     (biomeDef.tempMin + tempRange * Math.random()) * BIOME_INFLUENCE;

  // Use the classifier with biome influence
  const { type } = classifyTerrain(elevation, moisture, temperature);

  return { 
    type, 
    elevation, 
    moisture, 
    temperature, 
    biome: dominantBiome 
  };
}

function getCardForLocation(x: number, y: number, seed: number): Card {
  const terrain = generateTerrain(x, y, seed);
  const biomeDef = biomeDefinitions[terrain.biome];
  
  // Filter cards based on biome first
  const biomeCards = baseCards.filter(card => 
    card.type.includes('treasure') && 
    biomeDef.cards.includes(card.id)
  );

  // Secondary filter based on terrain type
  let candidateCards = biomeCards.filter(card => {
    switch (terrain.type) {
      case 'mountains':
        return ['copper', 'silver', 'gold'].includes(card.id);
      case 'forest':
      case 'woods':
        return ['woods', 'forest', 'groves'].includes(card.id);
      case 'river':
      case 'lake':
      case 'ocean':
        return ['river', 'lake', 'ocean'].includes(card.id);
      default:
        return card.id === terrain.type;
    }
  });

  // Fallback to biome-appropriate cards if no direct matches
  if (!candidateCards.length) {
    candidateCards = biomeCards;
  }

  // Weighted random selection based on rarity
  const totalWeight = candidateCards.reduce((sum, card) => sum + (10 - (card.rarity || 5)), 0);
  let random = Math.random() * totalWeight;
  
  let selectedCard = candidateCards[0];
  for (const card of candidateCards) {
    const weight = 10 - (card.rarity || 5);
    random -= weight;
    if (random <= 0) {
      selectedCard = card;
      break;
    }
  }

  return {
    ...selectedCard,
    id: `${selectedCard.id}-${x}-${y}`,
    terrain: terrain
  };
}

export function generateMap(size: number) {
  const territories = [];
  const seed = 12345;
  let idCounter = 0;
  
  for (let q = -size; q <= size; q++) {
    for (let r = -size; r <= size; r++) {
      if (Math.abs(q + r) <= size) {
        const card = getCardForLocation(q, r, seed);
        
        territories.push({
          id: idCounter.toString(),
          coordinates: `${q},${r}`,
          x: q,
          y: r,
          owner: null,
          card
        });
        idCounter++;
      }
    }
  }
  
  return territories;
}