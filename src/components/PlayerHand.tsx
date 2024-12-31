import React from 'react';
import { Card as CardComponent } from './Card';
import { Card as CardType } from '../types/game';

interface PlayerHandProps {
  cards: CardType[];
  onPlayCard: (index: number) => void;
  actions: number;
  productivityPoints: number;
}

export function PlayerHand({ cards, onPlayCard, actions, productivityPoints }: PlayerHandProps) {
  const canPlayCard = (card: CardType) => {
    // Family cards can never be played
    if (card.type.includes('family')) return false;
    
    // Check action requirements
    if (card.type.includes('action') && actions <= 0) return false;
    
    // Check productivity cost for treasure cards
    if (card.type.includes('treasure')) {
      const productivityCost = card.productivityCost || 0;
      if (productivityPoints < productivityCost) return false;
    }
    
    return true;
  };

  const getCardTransform = (index: number, totalCards: number) => {
    // Calculate rotation
    const totalSpread = Math.min(30, totalCards * 5);
    const degreesPerCard = totalSpread / (Math.max(totalCards - 1, 1));
    const startRotation = -(totalSpread / 2);
    const rotation = startRotation + (index * degreesPerCard);

    // Calculate horizontal position
    const cardWidth = 144; // Matches w-36 class
    const overlapFactor = 0.7;
    const effectiveCardWidth = cardWidth * overlapFactor;
    const totalWidth = effectiveCardWidth * (totalCards - 1) + cardWidth;
    const startX = -totalWidth / 2 + cardWidth / 2;
    const translateX = startX + (index * effectiveCardWidth);

    // Add a slight vertical offset based on distance from center
    const maxVerticalOffset = 10;
    const centerIndex = (totalCards - 1) / 2;
    const distanceFromCenter = Math.abs(index - centerIndex);
    const verticalOffset = (distanceFromCenter * maxVerticalOffset) / centerIndex;

    return `translateX(${translateX}px) translateY(${verticalOffset}px) rotate(${rotation}deg)`;
  };

  return (
    <>
      {/* Background gradient overlay */}
      <div className="fixed bottom-0 left-0 right-0 h-80 pointer-events-none bg-gradient-to-t from-gray-900/50 to-transparent" />
      
      {/* Cards container */}
      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 h-0">
        <div className="relative">
          {cards.map((card, index) => (
            <div
              key={index}
              className="absolute group"
              style={{
                transform: getCardTransform(index, cards.length),
                transformOrigin: 'bottom center',
                zIndex: index,
              }}
            >
              <div 
                className="transform transition-all duration-200 ease-out cursor-pointer hover:-translate-y-32 hover:z-50"
                onClick={() => canPlayCard(card) && onPlayCard(index)}
              >
                <CardComponent 
                  card={card} 
                  disabled={!canPlayCard(card)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}