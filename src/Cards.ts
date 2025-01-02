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

// Add color property to Card type if not already present
interface CardColor {
  r: number;
  g: number;
  b: number;
}

// Add at the top of the file, before allCards
const cardColors: Record<string, CardColor> = {
  // Basic Mines
  copper: { r: 184, g: 115, b: 51 },  // Copper brown
  silver: { r: 192, g: 192, b: 192 }, // Silver gray
  gold: { r: 255, g: 215, b: 0 },     // Gold yellow
  
  // Nature/Terrain
  plains: { r: 120, g: 170, b: 60 },
  hills: { r: 110, g: 140, b: 70 },
  mountains: { r: 140, g: 140, b: 140 },
  desert: { r: 230, g: 210, b: 160 },
  rainforest: { r: 30, g: 90, b: 30 },
  swamp: { r: 70, g: 80, b: 50 },
  tundra: { r: 180, g: 180, b: 180 },
  
  // Forest types
  woods: { r: 40, g: 100, b: 40 },
  forest: { r: 34, g: 139, b: 34 },
  groves: { r: 0, g: 100, b: 0 },
  
  // Water types
  river: { r: 65, g: 105, b: 225 },    // Royal blue
  lake: { r: 30, g: 144, b: 255 },     // Dodger blue
  ocean: { r: 0, g: 119, b: 190 },     // Deep blue
};

const allCards: Card[] = [
  // Basic Mines
  {
    id: 'copper',
    name: 'Copper Mine',
    type: ['treasure'],
    cost: 0,
    coins: 1,
    workload: 3,
    rarity: 6,  // Copper is fairly common
    lore: 'A modest copper vein requiring basic labor to extract.',
    description: 'Worth 1 coin. Workload: 3',
    color: cardColors.copper
  },
  {
    id: 'silver',
    name: 'Silver Mine',
    type: ['treasure'],
    cost: 4,
    coins: 2,
    workload: 5,
    rarity: 8,  // Silver is moderately rare
    lore: 'Deep silver deposits that demand skilled miners.',
    description: 'Worth 2 coins. Workload: 5',
    color: cardColors.silver
  },
  {
    id: 'gold',
    name: 'Gold Mine',
    type: ['treasure'],
    cost: 8,
    coins: 3,
    workload: 8,
    rarity: 9,  // Gold is quite rare
    lore: 'Rich gold veins requiring expert extraction.',
    description: 'Worth 3 coins. Workload: 8',
    color: cardColors.gold
  },

  // Nature/Terrain Cards (after the basic mines, before family cards)
  {
    id: 'plains',
    name: 'Plains',
    type: ['treasure'],
    cost: 3,
    coins: 1,
    workload: 3,
    rarity: 1,  // Plains are very common
    lore: 'Rolling grasslands perfect for grazing and farming.',
    description: 'Worth 1 coin. Workload: 3',
    color: cardColors.plains
  },
  {
    id: 'hills',
    name: 'Hills',
    type: ['treasure'],
    cost: 5,
    coins: 2,
    workload: 4,
    rarity: 2,  // Hills are common
    lore: 'Gentle slopes rich with mineral deposits.',
    description: 'Worth 2 coins. Workload: 4',
    color: cardColors.hills
  },
  {
    id: 'mountains',
    name: 'Mountains',
    type: ['treasure'],
    cost: 7,
    coins: 3,
    workload: 6,
    rarity: 4,  // Mountains are moderately common
    lore: 'Towering peaks hiding valuable ore veins.',
    description: 'Worth 3 coins. Workload: 6',
    color: cardColors.mountains
  },
  {
    id: 'desert',
    name: 'Desert',
    type: ['treasure'],
    cost: 4,
    coins: 2,
    workload: 5,
    rarity: 6,  // Deserts are less common
    lore: 'Harsh sands concealing ancient treasures.',
    description: 'Worth 2 coins. Workload: 5',
    color: cardColors.desert
  },
  {
    id: 'rainforest',
    name: 'Rainforest',
    type: ['treasure'],
    cost: 8,
    coins: 4,
    workload: 7,
    rarity: 7,  // Rainforests are relatively rare
    lore: 'Dense jungle teeming with exotic resources.',
    description: 'Worth 4 coins. Workload: 7',
    color: cardColors.rainforest
  },
  {
    id: 'swamp',
    name: 'Swamp',
    type: ['treasure'],
    cost: 6,
    coins: 3,
    workload: 5,
    rarity: 6,  // Swamps are less common
    lore: 'Murky wetlands rich with rare herbs and resources.',
    description: 'Worth 3 coins. Workload: 5',
    color: cardColors.swamp
  },
  {
    id: 'tundra',
    name: 'Tundra',
    type: ['treasure'],
    cost: 5,
    coins: 2,
    workload: 6,
    rarity: 7,  // Tundra is relatively rare
    lore: 'Frozen wasteland hiding precious resources beneath the ice.',
    description: 'Worth 2 coins. Workload: 6',
    color: cardColors.tundra
  },

  // Nature Mines
  {
    id: 'woods',
    name: 'Woods',
    type: ['treasure'],
    cost: 3,
    coins: 2,
    workload: 4,
    rarity: 2,  // Woods are very common
    lore: 'A peaceful woodland area rich with natural resources.',
    description: 'Worth 1 coin. Workload: 4',
    color: cardColors.woods
  },
  {
    id: 'forest',
    name: 'Forest',
    type: ['treasure'],
    cost: 6,
    coins: 3,
    workload: 6,
    rarity: 3,  // Forests are moderately common
    lore: 'Dense forest teeming with valuable resources.',
    description: 'Worth 3 coins.',
    color: cardColors.forest
  },
  {
    id: 'groves',
    name: 'Sacred Groves',
    type: ['treasure'],
    cost: 9,
    coins: 4,
    workload: 8,
    rarity: 8,  // Sacred groves are quite rare
    lore: 'Ancient groves blessed with abundant natural wealth.',
    description: 'Worth 5 coins.',
    color: cardColors.groves
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
    description: 'A simple dwelling for a small family.',
    color: { r: 0, g: 0, b: 0 }
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
    }],
    color: { r: 0, g: 0, b: 0 }
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
    }],
    color: { r: 0, g: 0, b: 0 }
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
    }],
    color: { r: 0, g: 0, b: 0 }
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
    }],
    color: { r: 0, g: 0, b: 0 }
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
    }],
    color: { r: 0, g: 0, b: 0 }
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
    }],
    color: { r: 0, g: 0, b: 0 }
  },
  {
    id: 'dragon_befriender',
    name: 'Dragon Befriender',
    type: ['curse'],
    cost: 0,
    coins: 1,
    lore: 'Making friends with dragons seemed like a good idea at the time.',
    description: 'At the start of your turn, lose 1 population but gain 1 coin.',
    effects: [
      {
        type: 'duration',
        timing: 'startOfTurn',
        apply: (state, player) => {
          const playerIndex = state.players.findIndex(p => p.id === player.id);
          const updatedPlayer = { 
            ...player,
            coins: player.coins + 1,  // Add 1 coin
            population: Math.max(0, (player.population || 0) - 1)  // Decrease population by 1
          };

          return {
            ...state,
            players: state.players.map((p, i) => 
              i === playerIndex ? updatedPlayer : p
            )
          };
        }
      }
    ]
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
    description: '+2 Actions, +1 Card',
    color: { r: 0, g: 0, b: 0 }
  },
  {
    id: 'smithy',
    name: 'Smithy',
    type: ['action'],
    cost: 16,
    cards: 3,
    lore: 'The rhythmic sound of hammers fills the air.',
    description: '+3 Cards',
    color: { r: 0, g: 0, b: 0 }
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
    description: '+1 Card, +1 Action, +1 Buy, +1 Coin',
    color: { r: 0, g: 0, b: 0 }
  },
  {
    id: 'laboratory',
    name: 'Laboratory',
    type: ['action'],
    cost: 18,
    cards: 2,
    actions: 1,
    lore: 'Where alchemists unlock nature\'s secrets.',
    description: '+2 Cards, +1 Action',
    color: { r: 0, g: 0, b: 0 }
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
    }],
    color: { r: 0, g: 0, b: 0 }
  },
  {
    id: 'workers',
    name: 'Workers',
    type: ['action'],
    cost: 2,
    coins: -2,
    workload: -6,
    lore: 'Hired hands eager to help with the heavy lifting.',
    description: 'Pay 2 coins. Remove 6 workload.',
    color: { r: 0, g: 0, b: 0 }
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
  },

  // Water types
  {
    id: 'river',
    name: 'River',
    type: ['treasure'],
    cost: 4,
    coins: 2,
    workload: 4,
    rarity: 3,  // Rivers are fairly common
    lore: 'A flowing river teeming with fish and valuable minerals.',
    description: 'Worth 2 coins. Workload: 4',
    color: cardColors.river
  },
  {
    id: 'lake',
    name: 'Lake',
    type: ['treasure'],
    cost: 6,
    coins: 3,
    workload: 5,
    rarity: 5,  // Lakes are moderately common
    lore: 'A pristine lake holding countless treasures beneath its surface.',
    description: 'Worth 3 coins. Workload: 5',
    color: cardColors.lake
  },
  {
    id: 'ocean',
    name: 'Ocean',
    type: ['treasure'],
    cost: 8,
    coins: 4,
    workload: 7,
    rarity: 7,  // Oceans are rarer
    lore: 'Vast waters hiding untold riches in their depths.',
    description: 'Worth 4 coins. Workload: 7',
    color: cardColors.ocean
  }
];

export const baseCards = allCards;