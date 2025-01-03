export type TerrainType = 'mountains' | 'hills' | 'plains' | 'desert' | 'rainforest' | 
                         'forest' | 'tundra' | 'water' | 'deep_water' | 'swamp' | 'woods';

export type BiomeType =
  | 'tropical'
  | 'temperate'
  | 'continental'
  | 'polar'
  | 'arid';

export interface Territory {
  id: string;
  coordinates: string;
  x: number;
  y: number;
  isOwned: boolean;
  type: string;
  features: {
    rivers: boolean;
    mountains: boolean;
    forest: boolean;
  };
  resources: {
    gold: number;
    production: number;
    food: number;
    science: number;
  };
  card: any; // Replace 'any' with your Card type
}

export interface Resources {
  gold: number;
  food: number;
  production: number;
  science: number;
}

export interface TerrainFeatures {
  rivers?: boolean;
  cliffs?: boolean;
  volcanic?: boolean;
  minerals?: string[];
  vegetation?: string[];
}