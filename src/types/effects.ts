import { GameState, Player, Card } from './game';

export type EffectType = 'immediate' | 'duration' | 'reaction';
export type EffectTiming = 'startOfTurn' | 'endOfTurn' | 'whenGained' | 'whenPlayed' | 'onCardPlay';

export interface Effect {
  type: EffectType;
  timing?: EffectTiming;
  duration?: number;
  condition?: (state: GameState, trigger?: { card?: Card }) => boolean;
  apply: (state: GameState, player: Player, trigger?: { card?: Card }) => GameState;
}

export interface EffectState {
  id: string;
  sourceCard: string;
  playerId: string;
  remainingDuration: number;
  effect: Effect;
}