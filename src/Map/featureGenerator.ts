import { TerrainType } from './types';

interface Features {
  rivers: boolean;
  mountains: boolean;
  forest: boolean;
}

export function generateFeatures(terrain: TerrainType): Features {
  const features = {
    rivers: false,
    mountains: false,
    forest: false
  };

  return features;
} 