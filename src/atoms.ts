import { atomWithStorage } from 'jotai/utils';
import { Territory } from './Map/types';

export const mapAtom = atomWithStorage<Territory[]>('game-map', []); 