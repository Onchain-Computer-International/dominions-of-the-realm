import { Season } from '../types/game';

export const SEASON_DATA = {
  spring: { 
    modifier: 1.2, 
    description: 'The mild weather boosts productivity by 20%',
    emoji: '🌸',
    months: ['Early Spring', 'Mid Spring', 'Late Spring']
  },
  summer: { 
    modifier: 1.0, 
    description: 'Long days maintain normal productivity',
    emoji: '☀️',
    months: ['Early Summer', 'Mid Summer', 'Late Summer']
  },
  autumn: { 
    modifier: 1.1, 
    description: 'The harvest season increases productivity by 10%',
    emoji: '🍂',
    months: ['Early Autumn', 'Mid Autumn', 'Late Autumn']
  },
  winter: { 
    modifier: 0.8, 
    description: 'Harsh conditions reduce productivity by 20%',
    emoji: '❄️',
    months: ['Early Winter', 'Mid Winter', 'Late Winter']
  }
} as const; 