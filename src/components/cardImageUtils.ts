import { CardType } from '../types/game';

export function getCardBackground(types: CardType[]): string {
  // Return background image URLs based on card type
  if (types.includes('treasure')) {
    if (types.includes('nature')) {
      return 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=400';
    }
    return 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&q=80&w=400';
  }
  if (types.includes('family')) {
    return 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&q=80&w=400';
  }
  if (types.includes('action')) {
    return 'https://images.unsplash.com/photo-1496715976403-7e36dc43f17b?auto=format&fit=crop&q=80&w=400';
  }
  return 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?auto=format&fit=crop&q=80&w=400';
}

export function getCardOverlayColor(types: CardType[]): string {
  if (types.includes('treasure')) return 'from-amber-900/90 to-amber-700/40';
  if (types.includes('family')) return 'from-emerald-900/90 to-emerald-700/40';
  if (types.includes('action')) return 'from-purple-900/90 to-purple-700/40';
  return 'from-gray-900/90 to-gray-700/40';
}