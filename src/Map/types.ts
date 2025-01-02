export type TerrainType = 
  | 'ocean'
  | 'coast'
  | 'beach'
  | 'plains'
  | 'grassland'
  | 'hills'
  | 'mountains'
  | 'snow'
  | 'desert'
  | 'forest'
  | 'rainforest'
  | 'tundra'
  | 'swamp';

export type BiomeType =
  | 'tropical'
  | 'temperate'
  | 'continental'
  | 'polar'
  | 'arid';

export interface Territory {
  id: string;
  x: number;
  y: number;
  owner: string | null;
  type: TerrainType;
  biome: BiomeType;
  elevation: number;
  moisture: number;
  temperature: number;
  resources: Resources;
  features: TerrainFeatures;
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