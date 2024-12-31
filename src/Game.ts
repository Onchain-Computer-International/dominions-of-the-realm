import { useState, useMemo } from 'react';
import { nanoid } from 'nanoid';
import { Effect } from './types/effects';
import { GameState, Player, Season } from './types/game';
import { baseCards } from './Cards';
import { SEASON_DATA } from './static/Seasons';
import { shuffleArray } from './utils/UtilityFunctions';
import { drawCards } from './utils/CardUtils';

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
  
  // Set base values, including resetting coins to 0
  const updatedPlayer = {
    ...player,
    actions: 1,  // Base action
    buys: 1,     // Base buy
    coins: 0     // Reset coins to 0
  };

  let newState = {
    ...state,
    players: state.players.map((p, i) => 
      i === playerIndex ? updatedPlayer : p
    )
  };

  // Add duration effects from all cards (hand, deck, discard, and in play)
  const allCards = [...player.hand, ...player.deck, ...player.discard, ...player.inPlay];
  allCards.forEach(card => {
    if (card.effects) {
      card.effects.forEach(effect => {
        if (effect.type === 'duration' && effect.timing === 'startOfTurn') {
          // Add to active effects if not already present
          const effectExists = newState.activeEffects.some(
            ae => ae.sourceCard === card.id && ae.playerId === player.id
          );
          
          if (!effectExists) {
            newState = {
              ...newState,
              activeEffects: [...newState.activeEffects, {
                id: nanoid(),
                sourceCard: card.name || card.id,
                playerId: player.id,
                remainingDuration: effect.duration || Infinity,
                effect
              }]
            };
          }
        }
      });
    }
  });

  // Process any additional start of turn effects
  newState = processEffects(newState, 'startOfTurn');

  return newState;
}

export function calculateTotalFamilyMembers(player: Player): number {
  return [...player.deck, ...player.hand, ...player.discard, ...player.inPlay]
    .reduce((total, card) => total + (card.headcount || 0), 0);
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
  const adjustedTurn = (turn - 1) % 12;  // Get position in 12-turn cycle
  
  // Map each turn number to its season and month
  const seasonMap = [
    0, 0, 0,  // Spring (turns 1-3)
    1, 1, 1,  // Summer (turns 4-6)
    2, 2, 2,  // Autumn (turns 7-9)
    3, 3, 3   // Winter (turns 10-12)
  ];
  
  const monthMap = [
    1, 2, 3,  // Early, Mid, Late
    1, 2, 3,  // Early, Mid, Late
    1, 2, 3,  // Early, Mid, Late
    1, 2, 3   // Early, Mid, Late
  ];
  
  return {
    season: seasons[seasonMap[adjustedTurn]],
    month: monthMap[adjustedTurn]
  };
}

export function getSeasonEmoji(season: Season): string {
  return SEASON_DATA[season].emoji;
}

export function getMonthName(season: Season, monthNumber: number): string {
  return SEASON_DATA[season].months[monthNumber - 1];
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
    coins: 0,
    buys: 1
  };

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
    cloneCard(copper), cloneCard(copper), cloneCard(copper),
    cloneCard(woods), cloneCard(woods), cloneCard(woods),
    cloneCard(forest), cloneCard(forest),
    cloneCard(shack), cloneCard(shack), cloneCard(shack)
  ];
}

export function cleanupPhase(player: Player, season: Season): { reshuffled: boolean } {
  // Filter out wealth cards from both inPlay and hand
  const nonWealthHandCards = player.hand.filter(card => !card.type.includes('wealth'));
  const nonWealthPlayedCards = player.inPlay.filter(card => !card.type.includes('wealth'));
  
  // Add only non-wealth cards to discard
  player.discard.push(...nonWealthHandCards, ...nonWealthPlayedCards);
  player.hand = [];
  player.inPlay = [];
  
  player.actions = 1;
  player.buys = 1;
  player.coins = 0;  // Reset coins to 0
  
  const result = drawCards(player, 5);
  
  return result;
}

// Add new function to handle end of turn
export function endTurn(state: GameState): void {
  const currentPlayer = state.players[state.currentPlayer];
  
  cleanupPhase(currentPlayer, state.season);
  
  // Increment turn by 1 only
  const newTurn = state.turn + 1;
  
  // Calculate new season and month
  const { season, month } = getSeasonAndMonth(newTurn);
  
  // Update state
  state.turn = newTurn;
  state.season = season;
  state.month = month;
  
  // Randomize supply at the end of each turn
  state.supply = createRandomSupply();
  
  // Move to next player (if multiplayer)
  state.currentPlayer = (state.currentPlayer + 1) % state.players.length;
  
  // Handle season transition if needed
  if (month === 1) {
    state.players.forEach(player => {
      const allCards = [...player.deck, ...player.hand, ...player.discard, ...player.inPlay];
      player.deck = shuffleArray(allCards);
      player.hand = [];
      player.discard = [];
      player.inPlay = [];
      drawCards(player, 5);
    });
  }
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

// Deep clone a single card
export function cloneCard(card: Card): Card {
  return {
    ...card,
    uid: `${card.id}-${nanoid(8)}`,
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
            (card.type.includes('action') && player.actions <= 0)) {
          return prev;
        }

        // Create updated player state
        const updatedPlayer = {
          ...player,
          hand: player.hand.filter((_, i) => i !== cardIndex),
          inPlay: [...player.inPlay],  // Create new array for inPlay
        };

        // Add the card to inPlay with updated headcount if it's a family card
        if (card.type.includes('family')) {
          updatedPlayer.inPlay.push({
            ...card,
            headcount: (card.headcount || 0) + (card.born || 0)
          });
        } else {
          updatedPlayer.inPlay.push(card);
        }

        // Apply other card effects
        if (card.type.includes('action')) {
          updatedPlayer.actions = player.actions + (card.actions || 0) - 1;
          updatedPlayer.coins = player.coins + (card.coins || 0);
          updatedPlayer.buys = player.buys + (card.buys || 0);
        }
        
        if (card.type.includes('treasure')) {
          updatedPlayer.coins = player.coins + (card.coins || 0);
        }

        if (card.cards) drawCards(updatedPlayer, card.cards);

        return applyCardEffects(
          { 
            ...prev, 
            players: prev.players.map((p, i) => 
              i === prev.currentPlayer ? updatedPlayer : p
            ) 
          },
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

        // If it's a family card, set initial population
        if (boughtCard.type.includes('family')) {
          boughtCard.headcount = boughtCard.starterHeadCount || 0;
        }

        const newPlayer = {
          ...player,
          discard: [...player.discard, boughtCard],
          buys: player.buys - 1,
          coins: player.coins - boughtCard.cost
        };

        return {
          ...prev,
          players: prev.players.map((p, i) => 
            i === prev.currentPlayer ? newPlayer : p
          ),
          supply: newSupply
        };
      });
    },

    endTurn: () => {
      setState(prev => {
        // Create a new state object to ensure React detects the change
        const newState = { ...prev };
        
        // Get current player before state update
        const currentPlayer = newState.players[newState.currentPlayer];
        
        // Perform cleanup
        cleanupPhase(currentPlayer, newState.season);
        
        // Increment turn by 1
        newState.turn += 1;
        
        // Calculate new season and month
        const { season, month } = getSeasonAndMonth(newState.turn);
        newState.season = season;
        newState.month = month;
        
        // Update supply
        newState.supply = createRandomSupply();
        
        // Move to next player
        newState.currentPlayer = (newState.currentPlayer + 1) % newState.players.length;
        
        // Handle season transition
        if (month === 1) {
          newState.players.forEach(player => {
            const allCards = [...player.deck, ...player.hand, ...player.discard, ...player.inPlay];
            player.deck = shuffleArray(allCards);
            player.hand = [];
            player.discard = [];
            player.inPlay = [];
            drawCards(player, 5);
          });
        }
        
        return newState;
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

export function calculateMaxPopulation(player: Player): number {
  const allCards = [...player.deck, ...player.hand, ...player.discard, ...player.inPlay];
  return allCards
    .filter(card => card.type.includes('family'))
    .reduce((total, card) => total + (card.maxHeadCount || 0), 0);
}

export function getCurrentPopulation(player: Player): number {
  const allCards = [...player.deck, ...player.hand, ...player.discard, ...player.inPlay];
  return allCards
    .filter(card => card.type.includes('family'))
    .reduce((total, card) => total + (card.headcount || 0), 0);
}