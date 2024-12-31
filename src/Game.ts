import { useState, useMemo } from 'react';
import { nanoid } from 'nanoid';
import { Effect } from './types/effects';
import { GameState, Player, Season } from './types/game';
import { baseCards } from './Cards';
import { SEASON_DATA } from './static/Seasons';
import { shuffleArray } from './utils/UtilityFunctions';

export function processDurationEffect(
  state: GameState,
  player: Player,
  effect: Effect
): GameState {
  if (!effect.apply) return state;

  // Create a new state to avoid mutations
  let newState = { ...state };
  const playerIndex = newState.players.findIndex(p => p.id === player.id);
  
  // Apply the effect
  newState = effect.apply(newState, player);
  
  // Ensure the player object is updated in state
  if (playerIndex !== -1) {
    const updatedPlayer = newState.players[playerIndex];
    newState = {
      ...newState,
      players: newState.players.map((p, i) => 
        i === playerIndex ? updatedPlayer : p
      )
    };
  }

  return newState;
}

export function getSeasonalProductivityModifier(season: Season): number {
  return SEASON_DATA[season].modifier;
}

export function getSeasonalDescription(season: Season): string {
  return SEASON_DATA[season].description;
}

export function applyCardEffects(state: GameState, player: Player, cardId: string): GameState {
  const playedCard = player.inPlay[player.inPlay.length - 1];
  if (!playedCard?.effects) return state;

  return playedCard.effects.reduce((currentState, effect) => {
    if (effect.type === 'duration') {
      return {
        ...currentState,
        activeEffects: [...currentState.activeEffects, {
          id: nanoid(),
          sourceCard: cardId,
          playerId: player.id,
          remainingDuration: effect.duration || 1,
          effect
        }]
      };
    }
    return effect.type === 'immediate' ? effect.apply(currentState, player) : currentState;
  }, state);
}

export function processEffects(state: GameState, timing: string): GameState {
  return {
    ...state,
    activeEffects: state.activeEffects
      .filter(effectState => {
        const player = state.players.find(p => p.id === effectState.playerId);
        if (effectState.effect.timing === timing && player && 
            (!effectState.effect.condition || effectState.effect.condition(state))) {
          state = effectState.effect.apply?.(state, player) ?? state;
        }
        return --effectState.remainingDuration > 0;
      })
  };
}

export function startTurnPhase(state: GameState, player: Player): GameState {
  const playerIndex = state.players.findIndex(p => p.id === player.id);
  
  // Get passive boosts that affect turn start, only considering family cards in hand
  const allCards = [...player.deck, ...player.hand, ...player.discard, ...player.inPlay];
  const passiveBoosts = getPassiveBoosts(allCards, player.hand);
  
  // Calculate additional actions from passive boosts
  const additionalActions = passiveBoosts
    .filter(boost => boost.type === 'action')
    .reduce((total, boost) => total + boost.value, 0);

  // Calculate additional buys from passive boosts
  const additionalBuys = passiveBoosts
    .filter(boost => boost.type === 'buy')
    .reduce((total, boost) => total + boost.value, 0);

  // Set base values plus passive boosts, but keep existing coins
  const updatedPlayer = {
    ...player,
    actions: 1 + additionalActions,  // Base action + passive boosts
    buys: 1 + additionalBuys        // Base buy + passive boosts
  };

  let newState = {
    ...state,
    players: state.players.map((p, i) => 
      i === playerIndex ? updatedPlayer : p
    )
  };

  // Process any additional start of turn effects
  newState = processEffects(newState, 'startOfTurn');

  return newState;
}

export type BoostType = 'efficiency' | 'action' | 'buy' | 'coin' | 'draw';

export interface PassiveBoost {
  type: BoostType;
  value: number;
  source: string;
  trigger?: string;
}

export function calculateTotalFamilyMembers(player: Player): number {
  return [...player.deck, ...player.hand, ...player.discard, ...player.inPlay]
    .reduce((total, card) => total + (card.headcount || 0), 0);
}

export function getPassiveBoosts(cards: Card[], handOnly: Card[] = []): PassiveBoost[] {
  return [
    ...cards.map(card => card.productivityBonus && {
      type: 'efficiency' as BoostType,
      value: card.productivityBonus,
      source: card.name
    }).filter(Boolean),
    
    ...handOnly
      .filter(card => card.type.includes('family'))
      .flatMap(card => card.passiveBoosts || [])
  ];
}

export function createRandomSupply(): Map<string, Card[]> {
  const supply = new Map<string, Card[]>();
  
  // Select 12 random cards from all available cards
  const allCards = [...baseCards];
  const selectedRandomCards = shuffleArray(allCards).slice(0, 12);
  
  // Create supply piles with single copies of each selected card
  selectedRandomCards.forEach(card => {
    supply.set(card.id, [{...card}]);
  });

  return supply;
}

// Rename the original function to make its purpose clearer
export const createInitialSupply = createRandomSupply;

export function getSeasonAndMonth(turn: number): { season: Season; month: number } {
  const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
  return {
    season: seasons[Math.floor((turn - 1) / 3) % 4],
    month: ((turn - 1) % 3) + 1
  };
}

export function getSeasonEmoji(season: Season): string {
  return SEASON_DATA[season].emoji;
}

export function getMonthName(season: Season, month: number): string {
  return SEASON_DATA[season].months[month - 1];
}

// Core game state management
export function createInitialGameState(): GameState {
  const player = createPlayer('player1');
  const { season, month } = getSeasonAndMonth(1);

  return {
    players: [player],
    currentPlayer: 0,
    supply: createInitialSupply(1),
    trash: [],
    turn: 1,
    activeEffects: [],
    gameEnded: false,
    season,
    month
  };
}

export function checkGameEnd(state: GameState): boolean {
  const provinces = state.supply.get('province') || [];
  if (provinces.length === 0) return true;

  let emptyPiles = 0;
  state.supply.forEach(pile => {
    if (pile.length === 0) emptyPiles++;
  });

  return emptyPiles >= 3;
}

export function calculateFinalScores(state: GameState): Map<string, number> {
  const scores = new Map<string, number>();
  
  state.players.forEach(player => {
    const allCards = getAllPlayerCards(player);
    let totalPoints = 0;

    allCards.forEach(card => {
      if (typeof card.victoryPoints === 'number') {
        totalPoints += card.victoryPoints;
      } else if (typeof card.victoryPoints === 'function') {
        totalPoints += card.victoryPoints(player);
      }
    });

    scores.set(player.id, totalPoints);
  });

  return scores;
}

// Player management
export function createPlayer(id: string): Player {
  const deck = createInitialDeck();
  const initialPlayer: Player = {
    id,
    deck,
    hand: [],
    discard: [],
    inPlay: [],
    actions: 1,
    coins: 10,
    buys: 1,
    productivityMultiplier: 0.5,
    productivityPoints: 0
  };

  initialPlayer.productivityMultiplier = calculateEfficiencyMultiplier(initialPlayer, 'spring');
  initialPlayer.productivityPoints = calculateMaxProductivityPoints(initialPlayer, 'spring');

  // Draw initial hand of 5 cards
  drawCards(initialPlayer, 5);

  return initialPlayer;
}

// Deck and card management
export function createInitialDeck(): Card[] {
  const copper = baseCards.find(card => card.id === 'copper');
  const woods = baseCards.find(card => card.id === 'woods');
  const forest = baseCards.find(card => card.id === 'forest');
  const shack = baseCards.find(card => card.id === 'shack');
  
  if (!copper || !woods || !forest || !shack) {
    throw new Error('Required starting cards not found');
  }

  return [
    {...copper}, {...copper}, {...copper},
    {...woods}, {...woods}, {...woods},
    {...forest}, {...forest},
    {...shack}, {...shack}, {...shack}
  ];
}

export function drawCards(player: Player, count: number): { reshuffled: boolean } {
  let reshuffled = false;
  let remainingToDraw = count;
  
  while (remainingToDraw > 0) {
    if (player.deck.length === 0 && player.discard.length > 0) {
      player.deck = shuffleArray([...player.discard]);
      player.discard = [];
      reshuffled = true;
    }
    
    if (player.deck.length === 0) break;
    
    const card = player.deck.pop();
    if (card) {
      player.hand.push({...card});
      remainingToDraw--;
    }
  }

  return { reshuffled };
}

export function cleanupPhase(player: Player, season: Season): { reshuffled: boolean } {
  player.discard.push(...player.hand, ...player.inPlay);
  player.hand = [];
  player.inPlay = [];
  
  player.actions = 1;
  player.buys = 1;
  
  resetProductivityPoints(player, season);
  
  const result = drawCards(player, 5);
  
  return result;
}

// Family and productivity calculations
export function calculateEfficiencyMultiplier(player: Player, season: Season): number {
  const baseEfficiency = 0.5;
  const seasonalModifier = getSeasonalProductivityModifier(season);
  return baseEfficiency * seasonalModifier;
}

export function calculateMaxProductivityPoints(player: Player, season: Season): number {
  const totalFamilyMembers = calculateTotalFamilyMembers(player);
  const efficiency = calculateEfficiencyMultiplier(player, season);
  return Math.floor(totalFamilyMembers * efficiency);
}

export function resetProductivityPoints(player: Player, season: Season): void {
  player.productivityMultiplier = calculateEfficiencyMultiplier(player, season);
  player.productivityPoints = calculateMaxProductivityPoints(player, season);
}

// Add new function to handle end of turn
export function endTurn(state: GameState): void {
  const currentPlayer = state.players[state.currentPlayer];
  
  cleanupPhase(currentPlayer, state.season);
  
  // Randomize supply at the end of each turn
  state.supply = createRandomSupply();
  
  // Move to next player (if multiplayer)
  state.currentPlayer = (state.currentPlayer + 1) % state.players.length;
  
  // Increment turn counter
  state.turn += 1;
}

export function addCoins(player: Player, amount: number): void {
  player.coins += amount;
}

// Remove the coins check - allow spending even if not enough coins
export function spendCoins(player: Player, amount: number): void {
  player.coins -= amount;
}

export function calculateTreasureCoins(player: Player): number {
  return player.inPlay
    .filter(card => card.type.includes('treasure'))
    .reduce((total, card) => total + (card.coins || 0), 0);
}

export function calculateUpkeep(player: Player, spendCoins: boolean = false): {
  base: number;
  total: number;
  canAfford: boolean;
} {
  const base = calculateTotalFamilyMembers(player);
  const total = Math.ceil(base * 0.5);
  const canAfford = player.coins >= total;
  
  if (spendCoins) {
    player.coins -= total;
  }
  
  return { base, total, canAfford };
}

// Deep clone a single card
export function cloneCard(card: Card): Card {
  return {
    ...card,
    type: [...card.type],
    effects: card.effects ? [...card.effects] : undefined
  };
}

// Deep clone an array of cards
export function cloneCards(cards: Card[]): Card[] {
  return cards.map(cloneCard);
}

export function useGameState() {
  const [state, setState] = useState<GameState>(createInitialGameState);
  const [toast, setToast] = useState<string | null>(null);

  const actions = useMemo(() => ({
    playCard: (cardIndex: number) => {
      setState(prev => {
        const player = prev.players[prev.currentPlayer];
        const card = player.hand[cardIndex];

        // Early returns for invalid plays
        if (!card || 
            card.type.includes('family') ||
            (card.type.includes('action') && player.actions <= 0) ||
            (card.type.includes('treasure') && player.productivityPoints < (card.productivityCost || 0))) {
          return prev;
        }

        // Apply all card effects in a single object update
        const updatedPlayer = {
          ...player,
          hand: player.hand.filter((_, i) => i !== cardIndex),
          inPlay: [...player.inPlay, card],
          ...card.type.includes('action') && { 
            actions: player.actions + (card.actions || 0) - 1,
            coins: player.coins + (card.coins || 0),
            buys: player.buys + (card.buys || 0)
          },
          ...card.type.includes('treasure') && {
            productivityPoints: player.productivityPoints - (card.productivityCost || 0),
            coins: player.coins + (card.coins || 0)
          }
        };

        if (card.cards) drawCards(updatedPlayer, card.cards);

        return applyCardEffects(
          { ...prev, players: prev.players.map((p, i) => i === prev.currentPlayer ? updatedPlayer : p) },
          updatedPlayer, 
          card.id
        );
      });
    },

    buyCard: (cardId: string) => {
      setState(prev => {
        const player = prev.players[prev.currentPlayer];
        const supplyPile = prev.supply.get(cardId);

        if (!supplyPile?.length || player.buys <= 0 || player.coins < supplyPile[0].cost) {
          return prev;
        }

        const boughtCard = cloneCard(supplyPile[0]);
        const newSupply = new Map(prev.supply);
        newSupply.set(cardId, supplyPile.slice(1));

        const newPlayer = {
          ...player,
          discard: [...player.discard, boughtCard],
          buys: player.buys - 1,
          coins: player.coins - boughtCard.cost
        };

        const newState = {
          ...prev,
          players: prev.players.map((p, i) => i === prev.currentPlayer ? newPlayer : p),
          supply: newSupply,
          gameEnded: checkGameEnd({ ...prev, supply: newSupply })
        };

        return newState;
      });
    },

    endTurn: () => {
      setState(prev => {
        const newTurn = prev.turn + 1;
        const { season, month } = getSeasonAndMonth(newTurn);
        const player = prev.players[prev.currentPlayer];

        calculateUpkeep(player, true);
        
        const newState = {
          ...prev,
          turn: newTurn,
          season,
          month,
          supply: createRandomSupply()
        };

        endTurn(newState);
        return startTurnPhase(newState, player);
      });
    }
  }), []);

  return {
    gameState: state,
    ...actions,
    toastMessage: toast,
    hideToast: () => setToast(null)
  };
}