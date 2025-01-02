import { Card } from './types/game';
import { drawCards } from './utils/CardUtils';

const familyNames = [
  'Blackwood', 'Ironsmith', 'Thatcher', 'Fletcher', 'Cooper', 'Miller',
  'Baker', 'Fisher', 'Shepherd', 'Carpenter', 'Mason', 'Potter',
  'Weaver', 'Tanner', 'Smith', 'Wright', 'Taylor', 'Turner'
];

function generateFamilyName(): string {
  const nameIndex = Math.floor(Math.random() * familyNames.length);
  return familyNames[nameIndex];
}

const allCards: Card[] = [
  // Basic Mines
  {
    id: 'copper',
    name: 'Copper Mine',
    type: ['treasure'],
    cost: 0,
    coins: 1,
    workload: 3,
    lore: 'A modest copper vein requiring basic labor to extract.',
    description: 'Worth 1 coin. Workload: 3'
  },
  {
    id: 'silver',
    name: 'Silver Mine',
    type: ['treasure'],
    cost: 4,
    coins: 2,
    workload: 5,
    lore: 'Deep silver deposits that demand skilled miners.',
    description: 'Worth 2 coins. Workload: 5'
  },
  {
    id: 'gold',
    name: 'Gold Mine',
    type: ['treasure'],
    cost: 8,
    coins: 3,
    workload: 8,
    lore: 'Rich gold veins requiring expert extraction.',
    description: 'Worth 3 coins. Workload: 8'
  },

  // Nature Mines
  {
    id: 'woods',
    name: 'Woods',
    type: ['treasure'],
    cost: 3,
    coins: 2,
    workload: 4,
    lore: 'A peaceful woodland area rich with natural resources.',
    description: 'Worth 1 coin. Workload: 4'
  },
  {
    id: 'forest',
    name: 'Forest',
    type: ['treasure'],
    cost: 6,
    coins: 3,
    workload: 6,  // Added workload
    lore: 'Dense forest teeming with valuable resources.',
    description: 'Worth 3 coins.'
  },
  {
    id: 'groves',
    name: 'Sacred Groves',
    type: ['treasure'],
    cost: 9,
    coins: 4,
    workload: 8,  // Added workload
    lore: 'Ancient groves blessed with abundant natural wealth.',
    description: 'Worth 5 coins.'
  },

  // Lower Tier Family Cards
  {
    id: 'shack',
    name: 'Shack',
    familyName: generateFamilyName(),
    type: ['family'],
    cost: 6,
    starterHeadCount: 2,
    maxHeadCount: 6,
    born: 1,
    headcount: 2,
    lore: 'A humble family dwelling on the outskirts.',
    description: 'A simple dwelling for a small family.'
  },
  {
    id: 'hut',
    name: 'Hut',
    familyName: generateFamilyName(),
    type: ['family'],
    cost: 12,
    starterHeadCount: 3,
    maxHeadCount: 8,
    born: 1,
    headcount: 3,
    lore: 'A family of skilled artisans and craftsmen.',
    description: 'At the start of your turn, draw a card.',
    effects: [{
      type: 'duration',
      timing: 'startOfTurn',
      apply: (state, player) => {
        const playerIndex = state.players.findIndex(p => p.id === player.id);
        const updatedPlayer = { ...player };
        drawCards(updatedPlayer, 1);
        
        return {
          ...state,
          players: state.players.map((p, i) => 
            i === playerIndex ? updatedPlayer : p
          )
        };
      }
    }]
  },
  {
    id: 'cabin',
    name: 'Cabin',
    familyName: generateFamilyName(),
    type: ['family'],
    cost: 12,
    starterHeadCount: 4,
    maxHeadCount: 16,
    born: 2,
    headcount: 4,
    lore: 'A prosperous merchant family with connections.',
    description: 'When you gain a Family card, draw a card.',
    effects: [{
      type: 'reaction',
      timing: 'whenGained',
      condition: (state, trigger) => trigger?.card?.type.includes('family') || false,
      apply: (state, player) => ({
        ...state,
        players: state.players.map(p => 
          p.id === player.id 
            ? { ...p, cards: p.cards + 1 }
            : p
        )
      })
    }]
  },

  // Standard Tier Family Cards
  {
    id: 'estate',
    name: 'Estate',
    familyName: generateFamilyName(),
    type: ['family'],
    cost: 30,
    starterHeadCount: 4,
    maxHeadCount: 24,
    born: 2,
    headcount: 4,
    lore: 'A noble family with ancestral lands.',
    description: 'Worth 2 VP. When you play a Treasure, gain +1 coin.',
    effects: [{
      type: 'reaction',
      timing: 'onCardPlay',
      condition: (state, trigger) => trigger?.card?.type.includes('treasure') || false,
      apply: (state, player) => ({
        ...state,
        players: state.players.map(p => 
          p.id === player.id 
            ? { ...p, coins: p.coins + 1 }
            : p
        )
      })
    }]
  },
  {
    id: 'duchy',
    name: 'Duchy',
    familyName: generateFamilyName(),
    type: ['family'],
    cost: 80,
    starterHeadCount: 8,
    maxHeadCount: 48,
    born: 3,
    headcount: 8,
    lore: 'A powerful ducal family commanding respect.',
    description: 'Worth 4 VP. At the start of your turn, gain +1 Action.',
    effects: [{
      type: 'duration',
      timing: 'startOfTurn',
      apply: (state, player) => ({
        ...state,
        players: state.players.map(p =>
          p.id === player.id
            ? { ...p, actions: p.actions + 1 }
            : p
        )
      })
    }]
  },
  {
    id: 'province',
    name: 'Province',
    familyName: generateFamilyName(),
    type: ['family'],
    cost: 160,
    starterHeadCount: 16,
    maxHeadCount: 96,
    born: 4,
    headcount: 16,
    lore: 'A royal dynasty ruling vast territories.',
    description: 'Worth 8 VP. At the start of your turn, gain +1 Buy.',
    effects: [{
      type: 'duration',
      timing: 'startOfTurn',
      apply: (state, player) => ({
        ...state,
        players: state.players.map(p =>
          p.id === player.id
            ? { ...p, buys: p.buys + 1 }
            : p
        )
      })
    }]
  },

  // Curse Cards
  {
    id: 'curse',
    name: 'Curse',
    type: ['curse'],
    cost: 0,
    lore: 'A family fallen from grace.',
    description: 'Worth -1 VP. When you play an Action, lose 1 Action.',
    effects: [{
      type: 'reaction',
      timing: 'onCardPlay',
      condition: (state, trigger) => trigger?.card?.type.includes('action') || false,
      apply: (state, player) => ({
        ...state,
        players: state.players.map(p => 
          p.id === player.id 
            ? { ...p, actions: Math.max(0, p.actions - 1) }
            : p
        )
      })
    }]
  },
  {
    id: 'dragon_befriender',
    name: 'Dragon Befriender',
    type: ['curse'],
    cost: 0,
    lore: 'Making friends with dragons seemed like a good idea at the time.',
    description: 'Worth -2 VP. When you play a Treasure, lose 1 coin.',
    effects: [{
      type: 'reaction',
      timing: 'onCardPlay',
      condition: (state, trigger) => trigger?.card?.type.includes('treasure') || false,
      apply: (state, player) => ({
        ...state,
        players: state.players.map(p => 
          p.id === player.id 
            ? { ...p, coins: Math.max(0, p.coins - 1) }
            : p
        )
      })
    }]
  },

  // Kingdom Cards
  {
    id: 'village',
    name: 'Village',
    type: ['action'],
    cost: 24,
    actions: 2,
    cards: 1,
    lore: 'A bustling hamlet where workers gather.',
    description: '+2 Actions, +1 Card'
  },
  {
    id: 'smithy',
    name: 'Smithy',
    type: ['action'],
    cost: 16,
    cards: 3,
    lore: 'The rhythmic sound of hammers fills the air.',
    description: '+3 Cards'
  },
  {
    id: 'market',
    name: 'Market',
    type: ['action'],
    cost: 20,
    cards: 1,
    actions: 1,
    buys: 1,
    coins: 1,
    lore: 'A thriving marketplace where goods change hands.',
    description: '+1 Card, +1 Action, +1 Buy, +1 Coin'
  },
  {
    id: 'laboratory',
    name: 'Laboratory',
    type: ['action'],
    cost: 18,
    cards: 2,
    actions: 1,
    lore: 'Where alchemists unlock nature\'s secrets.',
    description: '+2 Cards, +1 Action'
  },
  {
    id: 'festival',
    name: 'Festival',
    type: ['action'],
    cost: 25,
    actions: 2,
    buys: 1,
    coins: 2,
    lore: 'A time of celebration and commerce.',
    description: '+2 Actions, +1 Buy, +2 Coins. Reset workload to 0.',
    effects: [{
      type: 'immediate',
      apply: (state, player) => ({
        ...state,
        workload: 0
      })
    }]
  },
  {
    id: 'workers',
    name: 'Workers',
    type: ['action'],
    cost: 2,
    coins: -2,
    lore: 'Hired hands eager to help with the heavy lifting.',
    description: 'Pay 2 coins. Remove 6 workload.',
    effects: [{
      type: 'immediate',
      apply: (state, player) => ({
        ...state,
        workload: Math.max(0, state.workload - 6),
      })
    }]
  },

  // Wealth Cards
  {
    id: 'merchant_guild',
    name: 'Guild Charter',
    type: ['wealth'],
    cost: 10,
    coins: 15,
    lore: 'A coveted membership in the local merchant guild.',
    description: 'Gain 15 coins. Remove this card from your deck.',
    effects: [{
      type: 'immediate',
      apply: (state, player) => {
        const playerIndex = state.players.findIndex(p => p.id === player.id);
        const updatedPlayer = {
          ...player,
          coins: player.coins + 15
        };
        
        return {
          ...state,
          players: state.players.map((p, i) => 
            i === playerIndex ? updatedPlayer : p
          )
        };
      }
    }]
  },
  {
    id: 'wool_trade',
    name: 'Wool Trade Route',
    type: ['wealth'],
    cost: 25,
    coins: 40,
    lore: 'Exclusive rights to trade wool with Flemish merchants.',
    description: 'Gain 40 coins. Remove this card from your deck.',
    effects: [{
      type: 'immediate',
      apply: (state, player) => {
        const playerIndex = state.players.findIndex(p => p.id === player.id);
        const updatedPlayer = {
          ...player,
          coins: player.coins + 40
        };
        
        return {
          ...state,
          players: state.players.map((p, i) => 
            i === playerIndex ? updatedPlayer : p
          )
        };
      }
    }]
  },
  {
    id: 'silk_road',
    name: 'Silk Road Caravan',
    type: ['wealth'],
    cost: 50,
    coins: 85,
    lore: 'A lucrative trade expedition along the Silk Road.',
    description: 'Gain 85 coins. Remove this card from your deck.',
    effects: [{
      type: 'immediate',
      apply: (state, player) => {
        const playerIndex = state.players.findIndex(p => p.id === player.id);
        const updatedPlayer = {
          ...player,
          coins: player.coins + 85
        };
        
        return {
          ...state,
          players: state.players.map((p, i) => 
            i === playerIndex ? updatedPlayer : p
          )
        };
      }
    }]
  },
  {
    id: 'forest_dragon',
    name: 'Forest Dragon',
    type: ['action'],
    cost: 100,
    coins: 20,
    lore: 'A legendary deed: vanquishing the dreaded Forest Dragon that terrorized the realm.',
    description: 'Gain 20 coins.',
    effects: [{
      type: 'immediate',
      apply: (state, player) => {
        const playerIndex = state.players.findIndex(p => p.id === player.id);
        const updatedPlayer = {
          ...player,
          coins: player.coins + 200
        };
        
        return {
          ...state,
          players: state.players.map((p, i) => 
            i === playerIndex ? updatedPlayer : p
          )
        };
      }
    }]
  }
];

export const baseCards = allCards;