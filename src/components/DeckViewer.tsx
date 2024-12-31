import { useMemo, useState } from 'react';
import { Card as CardComponent } from './Card';
import { Card as CardType } from '../types/game';
import { Layers, Hand, Play, Trash, ChevronDown, ChevronUp } from 'lucide-react';

interface DeckViewerProps {
  deck: CardType[];
  discard: CardType[];
  inPlay: CardType[];
  hand: CardType[];
}

function FaceDownCard({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`relative bg-gray-800 rounded-lg shadow-lg border ${className} w-48 h-72 transform-gpu overflow-hidden`}
    >
      {/* Card Back Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900">
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-4 gap-4 p-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-full bg-white/20" />
            ))}
          </div>
        </div>
      </div>

      {/* Center Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Layers className="w-16 h-16 text-gray-600" />
      </div>
    </div>
  );
}

export function DeckViewer({ deck, discard, inPlay, hand }: DeckViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Use memoization to prevent unnecessary recalculations
  const sortedCards = useMemo(() => {
    // Create a map to track cards and their zones
    const cardTracker = new Map<string, { card: CardType; zone: 'hand' | 'play' | 'discard' | 'deck' }>();
    
    // Track cards in order of display priority
    deck.forEach((card, index) => {
      cardTracker.set(`deck-${card.id}-${index}`, { card, zone: 'deck' });
    });
    
    discard.forEach((card, index) => {
      cardTracker.set(`discard-${card.id}-${index}`, { card, zone: 'discard' });
    });
    
    inPlay.forEach((card, index) => {
      cardTracker.set(`play-${card.id}-${index}`, { card, zone: 'play' });
    });
    
    hand.forEach((card, index) => {
      cardTracker.set(`hand-${card.id}-${index}`, { card, zone: 'hand' });
    });

    // Sort cards by type priority
    return [...cardTracker.values()].sort((a, b) => {
      const getTypePriority = (card: CardType) => {
        if (card.type.includes('family')) return 1;
        if (card.type.includes('action')) return 2;
        if (card.type.includes('treasure')) return 3;
        if (card.type.includes('curse')) return 4;
        return 5;
      };

      const priorityA = getTypePriority(a.card);
      const priorityB = getTypePriority(b.card);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Secondary sort by cost
      return (a.card.cost || 0) - (b.card.cost || 0);
    });
  }, [deck, discard, inPlay, hand]);

  const getCardStyle = (zone: 'hand' | 'play' | 'discard' | 'deck') => {
    switch (zone) {
      case 'hand':
        return 'border-blue-500 border-2 ring-4 ring-blue-200 shadow-lg shadow-blue-100';
      case 'play':
        return 'border-green-400 ring-2 ring-green-100';
      case 'discard':
        return 'border-red-400 ring-2 ring-red-100';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <div className="p-4">
        <div 
          className="flex flex-wrap items-center gap-4 mb-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-gray-500" />
            <h3 className="font-medium">Deck Overview</h3>
            {isExpanded ? (
              <ChevronUp size={16} className="text-gray-500" />
            ) : (
              <ChevronDown size={16} className="text-gray-500" />
            )}
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Hand size={14} className="text-blue-500" />
              <span className="text-blue-600">In Hand ({hand.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <Layers size={14} className="text-gray-500" />
              <span className="text-gray-600">In Deck ({deck.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <Play size={14} className="text-green-500" />
              <span className="text-green-600">In Play ({inPlay.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <Trash size={14} className="text-red-500" />
              <span className="text-red-600">Discarded ({discard.length})</span>
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="flex flex-wrap gap-1 p-4">
            {sortedCards.map(({ card, zone }, index) => (
              <div 
                key={`${zone}-${card.id}-${index}`} 
                className="relative"
              >
                {zone === 'discard' ? (
                  <FaceDownCard className={getCardStyle(zone)} />
                ) : (
                  <CardComponent 
                    card={card}
                    className={getCardStyle(zone)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}