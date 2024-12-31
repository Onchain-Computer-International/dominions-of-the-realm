export type CardType = 'treasure' | 'family' | 'action' | 'duration' | 'reaction' | 'curse';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface Card {
  id: string;
  name: string;
  familyName?: string;
  type: CardType[];
  cost: number;
  victoryPoints?: number | ((player: Player) => number);
  coins?: number;
  actions?: number;
  cards?: number;
  buys?: number;
  headcount?: number;
  productivity?: number;
  productivityBonus?: number;
  productivityCost?: number;
  effects?: CardEffect[];
  lore: string;
  description: string;
}

export interface GameState {
  players: Player[];
  currentPlayer: number;
  supply: Map<string, Card[]>;
  trash: Card[];
  turn: number;
  activeEffects: EffectState[];
  gameEnded: boolean;
  season: Season;
  month: number; // 1-3 for each season
}

export interface Player {
  id: string;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  inPlay: Card[];
  actions: number;
  coins: number;
  buys: number;
  productivityMultiplier: number;
  productivityPoints: number;
}