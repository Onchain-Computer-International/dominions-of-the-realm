import { Card } from './types/game';

const familyNames = [
  'Blackwood', 'Ironsmith', 'Thatcher', 'Fletcher', 'Cooper', 'Miller',
  'Baker', 'Fisher', 'Shepherd', 'Carpenter', 'Mason', 'Potter',
  'Weaver', 'Tanner', 'Smith', 'Wright', 'Taylor', 'Turner'
];

function generateFamilyName(): string {
  const nameIndex = Math.floor(Math.random() * familyNames.length);
  return familyNames[nameIndex];
}

function getFamilyHeadcount(tier: 'shack' | 'hut' | 'cabin' | 'estate' | 'duchy' | 'province'): number {
  const headcounts = {
    shack: 2,
    hut: 4,
    cabin: 6,
    estate: 12,
    duchy: 32,
    province: 96
  };
  
  return headcounts[tier];
}

const treasureCards: Card[] = [
  // Basic Mines
  {
    id: 'copper',
    name: 'Copper Mine',
    type: ['treasure'],
    cost: 0,
    coins: 1,
    productivityCost: 2,
    lore: 'A modest copper vein requiring basic labor to extract.',
    description: 'Costs 2 productivity to play. Worth 1 coin.'
  },
  {
    id: 'silver',
    name: 'Silver Mine',
    type: ['treasure'],
    cost: 3,
    coins: 6,
    productivityCost: 3,
    lore: 'Deep silver deposits that demand skilled miners.',
    description: 'Costs 3 productivity to play. Worth 2 coins.'
  },
  {
    id: 'gold',
    name: 'Gold Mine',
    type: ['treasure'],
    cost: 6,
    coins: 12,
    productivityCost: 4,
    lore: 'Rich gold veins requiring expert extraction.',
    description: 'Costs 4 productivity to play. Worth 3 coins.'
  },

  // Nature Mines
  {
    id: 'woods',
    name: 'Woods',
    type: ['treasure'],
    cost: 2,
    coins: 1,
    productivityCost: 1,
    lore: 'A peaceful woodland area rich with natural resources.',
    description: 'Costs 1 productivity to play. Worth 1 coin.'
  },
  {
    id: 'forest',
    name: 'Forest',
    type: ['treasure'],
    cost: 4,
    coins: 3,
    productivityCost: 2,
    lore: 'Dense forest teeming with valuable resources.',
    description: 'Costs 2 productivity to play. Worth 3 coins.'
  },
  {
    id: 'groves',
    name: 'Sacred Groves',
    type: ['treasure'],
    cost: 6,
    coins: 5,
    productivityCost: 3,
    lore: 'Ancient groves blessed with abundant natural wealth.',
    description: 'Costs 3 productivity to play. Worth 5 coins.'
  }
];

const lowerTierFamilyCards: Card[] = [
  {
    id: 'shack',
    name: 'Shack',
    familyName: generateFamilyName(),
    type: ['family'],
    cost: 4,
    victoryPoints: 0,
    headcount: 2,
    lore: 'A humble family dwelling on the outskirts.',
    description: 'A simple dwelling for a small family.'
  },
  {
    id: 'hut',
    name: 'Hut',
    familyName: generateFamilyName(),
    type: ['family'],
    cost: 8,
    victoryPoints: 1,
    headcount: 4,
    lore: 'A family of skilled artisans and craftsmen.',
    description: 'At the start of your turn, you may discard a card for +1 Action.',
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
    id: 'cabin',
    name: 'Cabin',
    familyName: generateFamilyName(),
    type: ['family'],
    cost: 12,
    victoryPoints: 1,
    headcount: 6,
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
  }
];

const standardTierFamilyCards: Card[] = [
  {
    id: 'estate',
    name: 'Estate',
    familyName: generateFamilyName(),
    type: ['family'],
    cost: 24,
    victoryPoints: 1,
    headcount: 12,
    lore: 'A noble family with ancestral lands.',
    description: 'Worth 1 VP. When you play a Treasure, gain +1 coin.',
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
    cost: 64,
    victoryPoints: 3,
    headcount: 32,
    lore: 'A powerful ducal family commanding respect.',
    description: 'Worth 3 VP. At the start of your turn, gain +1 Action.',
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
    cost: 192,
    victoryPoints: 6,
    headcount: 96,
    lore: 'A royal dynasty ruling vast territories.',
    description: 'Worth 6 VP. At the start of your turn, gain +1 Buy.',
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
  }
];

const curseCards: Card[] = [
  {
    id: 'curse',
    name: 'Curse',
    type: ['curse'],
    cost: 0,
    victoryPoints: -1,
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
  }
];

const kingdomCards: Card[] = [
  // Action Cards
  {
    id: 'village',
    name: 'Village',
    type: ['action'],
    cost: 32,
    productivity: 10,
    actions: 2,
    cards: 1,
    lore: 'A bustling hamlet where workers gather.',
    description: '+10 Productivity, +2 Actions, +1 Card'
  },
  {
    id: 'smithy',
    name: 'Smithy',
    type: ['action'],
    cost: 8,
    cards: 3,
    lore: 'The rhythmic sound of hammers fills the air.',
    description: '+3 Cards'
  },
  {
    id: 'market',
    name: 'Market',
    type: ['action'],
    cost: 15,
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
    cost: 5,
    cards: 2,
    actions: 1,
    lore: 'Where alchemists unlock nature\'s secrets.',
    description: '+2 Cards, +1 Action'
  },
  {
    id: 'festival',
    name: 'Festival',
    type: ['action'],
    cost: 5,
    actions: 2,
    buys: 1,
    coins: 2,
    lore: 'A time of celebration and commerce.',
    description: '+2 Actions, +1 Buy, +2 Coins'
  },

  // Utility Cards
  {
    id: 'cellar',
    name: 'Cellar',
    type: ['action'],
    cost: 2,
    actions: 1,
    lore: 'A place to store and sort valuable goods.',
    description: '+1 Action. Discard any number of cards, then draw that many.',
    effects: [{
      type: 'immediate',
      apply: (state, player) => state // Handled by UI
    }]
  },
  {
    id: 'chapel',
    name: 'Chapel',
    type: ['action'],
    cost: 2,
    lore: 'A sacred place for contemplation and sacrifice.',
    description: 'Trash up to 4 cards from your hand.',
    effects: [{
      type: 'immediate',
      apply: (state, player) => state // Handled by UI
    }]
  },
  {
    id: 'workshop',
    name: 'Workshop',
    type: ['action'],
    cost: 3,
    lore: 'Where craftsmen create valuable goods.',
    description: 'Gain a card costing up to 4 coins.',
    effects: [{
      type: 'immediate',
      apply: (state, player) => state // Handled by UI
    }]
  },

  // Attack Cards
  {
    id: 'militia',
    name: 'Militia',
    type: ['action', 'attack'],
    cost: 4,
    coins: 2,
    lore: 'Armed forces that can disrupt enemy plans.',
    description: '+2 Coins. Each other player discards down to 3 cards in hand.',
    effects: [{
      type: 'immediate',
      apply: (state, player) => state // Handled by UI
    }]
  },

  // Reaction Cards
  {
    id: 'moat',
    name: 'Moat',
    type: ['action', 'reaction'],
    cost: 2,
    cards: 2,
    lore: 'A defensive barrier against hostile actions.',
    description: '+2 Cards. When another player plays an Attack card, you may reveal this from your hand to be unaffected by it.',
    effects: [{
      type: 'reaction',
      apply: (state, player) => state // Handled by UI
    }]
  },

  // Transformation Cards
  {
    id: 'remodel',
    name: 'Remodel',
    type: ['action'],
    cost: 4,
    lore: 'Transform existing resources into greater value.',
    description: 'Trash a card from your hand. Gain a card costing up to 2 more than it.',
    effects: [{
      type: 'immediate',
      apply: (state, player) => state // Handled by UI
    }]
  },
  {
    id: 'mine',
    name: 'Mine',
    type: ['action'],
    cost: 5,
    lore: 'Upgrade your mining operations.',
    description: 'You may trash a Treasure from your hand. Gain a Treasure to your hand costing up to 3 more than it.',
    effects: [{
      type: 'immediate',
      apply: (state, player) => state // Handled by UI
    }]
  }
];

// Card category exports
export const actionCards = kingdomCards.filter(card => 
  card.type.includes('action') && !card.type.includes('attack') && !card.type.includes('reaction')
);
export const utilityCards = kingdomCards.filter(card => 
  ['cellar', 'chapel', 'workshop'].includes(card.id)
);
export const attackCards = kingdomCards.filter(card => 
  card.type.includes('attack')
);
export const reactionCards = kingdomCards.filter(card => 
  card.type.includes('reaction')
);
export const transformationCards = kingdomCards.filter(card => 
  ['remodel', 'mine'].includes(card.id)
);

export const baseCards: Card[] = [
  ...treasureCards,
  ...lowerTierFamilyCards,
  ...standardTierFamilyCards,
  ...curseCards,
  ...kingdomCards
];