export type CardType = 'action' | 'treasure' | 'family' | 'curse' | 'wealth';
export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export interface Card {
  id: string;
  uid?: string;
  name: string;
  familyName?: string;
  description: string;
  lore?: string;
  type: CardType[];
  cost: number;
  headcount?: number;
  starterHeadCount?: number;
  maxHeadCount?: number;
  born?: number;
  actions?: number;
  coins?: number;
  buys?: number;
  cards?: number;
  effects?: Array<{
    type: 'duration' | 'reaction';
    timing: 'startOfTurn' | 'onCardPlay' | 'whenGained';
    condition?: (state: GameState, trigger?: { card?: Card }) => boolean;
    apply: (state: GameState, player: Player) => GameState;
  }>;
  workload?: number;
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
}

export interface GameState {
  players: Player[];
  currentPlayer: number;
  supply: { [key: string]: number };
  turn: number;
  month: number;
  season: Season;
  workload: number;
  happiness: number;
  activeEffects: ActiveEffect[];
}

export interface GameAction {
  type: string;
  payload?: any;
}