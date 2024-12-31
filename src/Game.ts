
import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { EffectState } from './types/effects';
import { Effect } from './types/effects';
import { GameState, Player, Season } from './types/game';
import { baseCards } from './Cards';

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
  // Each season affects productivity differently
  switch (season) {
    case 'spring': 
      // Spring is good for productivity with mild weather
      return 1.2;
    case 'summer':
      // Summer has long days but heat can be exhausting
      return 1.0;
    case 'autumn':
      // Autumn has moderate weather and harvest season
      return 1.1;
    case 'winter':
      // Winter is harsh and reduces productivity
      return 0.8;
  }
}

export function getSeasonalDescription(season: Season): string {
  switch (season) {
    case 'spring':
      return 'The mild weather boosts productivity by 20%';
    case 'summer':
      return 'Long days maintain normal productivity';
    case 'autumn':
      return 'The harvest season increases productivity by 10%';
    case 'winter':
      return 'Harsh conditions reduce productivity by 20%';
  }
}

export function applyCardEffects(state: GameState, player: Player, cardId: string): GameState {
  const playedCard = player.inPlay[player.inPlay.length - 1];
  if (!playedCard) return state;

  // First apply immediate effects of the played card
  let newState = state;
  if (playedCard.effects) {
    newState = playedCard.effects.reduce((currentState, effect) => {
      if (effect.type === 'immediate') {
        return effect.apply(currentState, player);
      } 
      
      if (effect.type === 'duration') {
        const effectState: EffectState = {
          id: nanoid(),
          sourceCard: cardId,
          playerId: player.id,
          remainingDuration: effect.duration || 1,
          effect
        };
        
        return {
          ...currentState,
          activeEffects: [...currentState.activeEffects, effectState]
        };
      }
      
      return currentState;
    }, state);
  }

  // Then trigger reaction effects from all cards in play
  return processReactionEffects(newState, player, playedCard);
}

function processReactionEffects(state: GameState, player: Player, trigger: Card): GameState {
  // Get all cards that could have reaction effects
  const allCards = [
    ...player.inPlay,
    ...player.hand,
    ...player.deck,
    ...player.discard
  ];

  // Process reaction effects
  return allCards.reduce((currentState, card) => {
    if (!card.effects) return currentState;

    return card.effects.reduce((state, effect) => {
      if (effect.type === 'reaction' && effect.timing === 'onCardPlay') {
        if (!effect.condition || effect.condition(state, { card: trigger })) {
          return effect.apply(state, player, { card: trigger });
        }
      }
      return state;
    }, currentState);
  }, state);
}

export function processEffects(state: GameState, timing: string): GameState {
  const { activeEffects, ...restState } = state;
  const remainingEffects: EffectState[] = [];
  
  let newState = { ...restState };

  // Process all active effects
  activeEffects.forEach(effectState => {
    if (effectState.effect.timing === timing) {
      const player = newState.players.find(p => p.id === effectState.playerId);
      if (player && (!effectState.effect.condition || effectState.effect.condition(newState))) {
        // Process the duration effect
        newState = processDurationEffect(newState, player, effectState.effect);
      }
      
      // Keep effect if it's not expired
      if (effectState.remainingDuration > 1) {
        remainingEffects.push({
          ...effectState,
          remainingDuration: effectState.remainingDuration - 1
        });
      }
    } else {
      remainingEffects.push(effectState);
    }
  });

  return {
    ...newState,
    activeEffects: remainingEffects
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

export function getPassiveBoosts(cards: Card[], handOnly: Card[] = []): PassiveBoost[] {
  const boosts: PassiveBoost[] = [];

  // Process treasure cards from anywhere
  cards.forEach(card => {
    if (card.productivityBonus) {
      boosts.push({
        type: 'efficiency',
        value: card.productivityBonus,
        source: card.name
      });
    }
  });

  // Process family card effects only from hand
  handOnly.forEach(card => {
    if (card.type.includes('family') && card.effects) {
      card.effects.forEach(effect => {
        if (effect.type === 'duration' && effect.timing === 'startOfTurn') {
          const effectStr = effect.apply.toString();
          
          if (effectStr.includes('actions')) {
            boosts.push({
              type: 'action',
              value: 1,
              source: card.name
            });
          }
          
          if (effectStr.includes('buys')) {
            boosts.push({
              type: 'buy',
              value: 1,
              source: card.name
            });
          }
        }
        
        if (effect.type === 'reaction') {
          const effectStr = effect.apply.toString();
          
          if (effect.timing === 'onCardPlay' && effectStr.includes('coins')) {
            boosts.push({
              type: 'coin',
              value: 1,
              source: card.name
            });
          }

          if (effect.timing === 'whenGained' && effectStr.includes('cards')) {
            boosts.push({
              type: 'draw',
              value: 1,
              source: card.name,
              trigger: 'when gaining a Family card'
            });
          }
        }
      });
    }
  });

  return boosts;
}

export function createRandomSupply(): Map<string, Card[]> {
  const supply = new Map<string, Card[]>();
  
  // Select 6 random cards from all available cards
  const allCards = [...baseCards];
  const selectedRandomCards = shuffleArray(allCards).slice(0, 6);
  
  // Create supply piles with single copies of each selected card
  selectedRandomCards.forEach(card => {
    supply.set(card.id, [{...card}]);
  });

  return supply;
}

// Rename the original function to make its purpose clearer
export const createInitialSupply = createRandomSupply;

export function getSeasonAndMonth(turn: number): { season: Season; month: number } {
  const monthsPerSeason = 3;
  const totalMonthsPerYear = monthsPerSeason * 4;
  
  // Convert turn to 0-based month index within the year
  const monthInYear = (turn - 1) % totalMonthsPerYear;
  
  // Calculate season (0-3)
  const seasonIndex = Math.floor(monthInYear / monthsPerSeason);
  const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
  
  // Calculate month within season (1-3)
  const monthInSeason = (monthInYear % monthsPerSeason) + 1;
  
  return {
    season: seasons[seasonIndex],
    month: monthInSeason
  };
}

export function getSeasonEmoji(season: Season): string {
  switch (season) {
    case 'spring': return '🌸';
    case 'summer': return '☀️';
    case 'autumn': return '🍂';
    case 'winter': return '❄️';
  }
}

export function getMonthName(season: Season, month: number): string {
  const months = {
    spring: ['Early Spring', 'Mid Spring', 'Late Spring'],
    summer: ['Early Summer', 'Mid Summer', 'Late Summer'],
    autumn: ['Early Autumn', 'Mid Autumn', 'Late Autumn'],
    winter: ['Early Winter', 'Mid Winter', 'Late Winter']
  };
  
  return months[season][month - 1];
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
    const allCards = [...player.deck, ...player.hand, ...player.discard, ...player.inPlay];
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

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
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
export function calculateTotalFamilyMembers(player: Player): number {
  const allCards = [...player.deck, ...player.hand, ...player.discard, ...player.inPlay];
  return allCards.reduce((total, card) => total + (card.headcount || 0), 0);
}

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
  
  // Log to verify this function is being called
  console.log('Ending turn, randomizing supply...');
  
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

export function calculateMonthlyUpkeep(player: Player): {
  baseUpkeep: number;
  modifiedUpkeep: number;
  canAfford: boolean;
} {
  const totalFamilyMembers = calculateTotalFamilyMembers(player);
  const baseUpkeep = totalFamilyMembers;
  const modifiedUpkeep = Math.ceil(baseUpkeep * 0.5); // Default 0.5x modifier
  
  return {
    baseUpkeep,
    modifiedUpkeep,
    canAfford: player.coins >= modifiedUpkeep
  };
}

export function processMonthlyUpkeep(player: Player): {
  amount: number;
} {
  const { modifiedUpkeep } = calculateMonthlyUpkeep(player);
  spendCoins(player, modifiedUpkeep);
  return { amount: modifiedUpkeep };
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

export function useBuyCard(setGameState: (state: GameState) => void) {
  return useCallback((cardId: string) => {
    setGameState(prevState => {
      const currentPlayer = prevState.players[prevState.currentPlayer];
      const supplyPile = prevState.supply.get(cardId);
      
      if (!supplyPile?.length || 
          currentPlayer.buys <= 0 ||
          currentPlayer.coins < supplyPile[0].cost) {
        return prevState;
      }

      // Deep clone the bought card
      const boughtCard = cloneCard(supplyPile[0]);
      
      const newSupply = new Map(prevState.supply);
      newSupply.set(cardId, supplyPile.slice(1));

      const newPlayer = {
        ...currentPlayer,
        discard: [...currentPlayer.discard, boughtCard],
        buys: currentPlayer.buys - 1
      };
      
      spendCoins(newPlayer, boughtCard.cost);

      const newPlayers = [...prevState.players];
      newPlayers[prevState.currentPlayer] = newPlayer;

      let newState = {
        ...prevState,
        players: newPlayers,
        supply: newSupply
      };

      if (checkGameEnd(newState)) {
        newState.gameEnded = true;
      }

      return newState;
    });
  }, []);
}

export function useEndTurn(setGameState: (state: GameState) => void, onReshuffle: () => void) {
  return useCallback(() => {
    setGameState(prevState => {
      // Get new turn info
      const newTurn = prevState.turn + 1;
      const { season, month } = getSeasonAndMonth(newTurn);
      
      // Create a deep copy of the state
      const newState = {
        ...prevState,
        turn: newTurn,
        season,
        month
      };

      // Process monthly upkeep
      const currentPlayer = newState.players[newState.currentPlayer];
      processMonthlyUpkeep(currentPlayer);
      
      // Call our endTurn function which will handle supply randomization
      endTurn(newState);
      
      // Start new turn with proper action handling
      return startTurnPhase(newState, currentPlayer);
    });
  }, [setGameState, onReshuffle]);
}

export function usePlayCard(setGameState: (state: GameState) => void) {
  return useCallback((cardIndex: number) => {
    setGameState(prevState => {
      const currentPlayer = prevState.players[prevState.currentPlayer];
      const card = currentPlayer.hand[cardIndex];

      // Check if card can be played
      if (!card) return prevState;
      
      // Prevent family cards from being played
      if (card.type.includes('family')) return prevState;
      
      // Check action requirements
      if (card.type.includes('action') && currentPlayer.actions <= 0) return prevState;
      
      // Check productivity cost for treasure cards
      if (card.type.includes('treasure')) {
        const productivityCost = card.productivityCost || 0;
        if (currentPlayer.productivityPoints < productivityCost) {
          return prevState;
        }
      }

      // Deep clone the card being played
      const playedCard = cloneCard(card);
      
      // Create new arrays to avoid mutations
      const newHand = [...currentPlayer.hand];
      newHand.splice(cardIndex, 1);

      const newPlayer = {
        ...currentPlayer,
        hand: newHand,
        inPlay: [...currentPlayer.inPlay, playedCard],
        actions: card.type.includes('action') 
          ? (currentPlayer.actions + (card.actions || 0) - 1)
          : currentPlayer.actions,
        coins: currentPlayer.coins + (card.coins || 0),
        buys: currentPlayer.buys + (card.buys || 0),
        productivityPoints: card.type.includes('treasure')
          ? currentPlayer.productivityPoints - (card.productivityCost || 0)
          : currentPlayer.productivityPoints
      };

      if (card.cards) {
        drawCards(newPlayer, card.cards);
      }

      const newPlayers = [...prevState.players];
      newPlayers[prevState.currentPlayer] = newPlayer;

      let newState = {
        ...prevState,
        players: newPlayers
      };

      return applyCardEffects(newState, newPlayer, playedCard.id);
    });
  }, []);
}

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
  }, []);

  const hideToast = useCallback(() => {
    setMessage(null);
  }, []);

  return {
    message,
    showToast,
    hideToast
  };
}

interface PendingEffect {
  card: Card;
  player: Player;
  context?: {
    maxCost?: number;
    selectedCard?: Card;
  };
}

export function useCardEffect(setGameState: (state: GameState) => void) {
  const [pendingEffect, setPendingEffect] = useState<PendingEffect | null>(null);

  const handleCardEffect = useCallback((card: Card, player: Player) => {
    switch (card.id) {
      case 'cellar':
      case 'chapel':
      case 'workshop':
      case 'remodel':
      case 'mine':
        setPendingEffect({ card, player });
        break;
    }
  }, []);

  const resolveEffect = useCallback((selectedCards: Card[]) => {
    if (!pendingEffect) return;

    const { card, player } = pendingEffect;

    setGameState(prevState => {
      const playerIndex = prevState.players.findIndex(p => p.id === player.id);
      const newPlayer = { ...player };

      switch (card.id) {
        case 'cellar': {
          // Discard selected cards and draw that many
          selectedCards.forEach(selectedCard => {
            const cardIndex = newPlayer.hand.findIndex(c => c.id === selectedCard.id);
            if (cardIndex !== -1) {
              newPlayer.hand.splice(cardIndex, 1);
              newPlayer.discard.push(selectedCard);
            }
          });
          
          // Draw cards equal to number discarded
          for (let i = 0; i < selectedCards.length; i++) {
            if (newPlayer.deck.length === 0) {
              if (newPlayer.discard.length === 0) break;
              newPlayer.deck = [...newPlayer.discard];
              newPlayer.discard = [];
              newPlayer.deck.sort(() => Math.random() - 0.5);
            }
            const card = newPlayer.deck.pop();
            if (card) newPlayer.hand.push(card);
          }
          break;
        }

        case 'chapel': {
          // Trash up to 4 cards
          selectedCards.forEach(selectedCard => {
            const cardIndex = newPlayer.hand.findIndex(c => c.id === selectedCard.id);
            if (cardIndex !== -1) {
              newPlayer.hand.splice(cardIndex, 1);
              prevState.trash.push(selectedCard);
            }
          });
          break;
        }

        case 'workshop': {
          // Gain a card costing up to 4
          if (selectedCards.length === 1 && selectedCards[0].cost <= 4) {
            const card = selectedCards[0];
            const pile = prevState.supply.get(card.id);
            if (pile && pile.length > 0) {
              newPlayer.discard.push(pile[0]);
              prevState.supply.set(card.id, pile.slice(1));
            }
          }
          break;
        }

        case 'remodel':
        case 'mine': {
          // Handle two-step effects in the UI
          break;
        }
      }

      const newPlayers = [...prevState.players];
      newPlayers[playerIndex] = newPlayer;

      return {
        ...prevState,
        players: newPlayers
      };
    });

    setPendingEffect(null);
  }, [pendingEffect, setGameState]);

  return {
    pendingEffect,
    handleCardEffect,
    resolveEffect
  };
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => 
    createInitialGameState()
  );

  const { message: toastMessage, showToast, hideToast } = useToast();

  const playCard = usePlayCard(setGameState);
  const buyCard = useBuyCard(setGameState);
  const endTurn = useEndTurn(setGameState, () => showToast('Reshuffling discard pile into deck...'));
  const cardEffect = useCardEffect(setGameState);

  return {
    gameState,
    playCard,
    buyCard,
    endTurn,
    cardEffect,
    toastMessage,
    hideToast
  };
}