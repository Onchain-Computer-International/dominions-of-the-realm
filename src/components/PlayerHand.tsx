import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Card as CardComponent } from './Card';
import { Card as CardType } from '../types/game';
import { Player } from '../types/game';
import { getCurrentPopulation, calculateMaxPopulation } from '../Game';

interface PlayerHandProps {
  cards: CardType[];
  onPlayCard: (uid: string) => void;
  actions: number;
  player: Player;
}

export function PlayerHand({ cards, onPlayCard, actions, player }: PlayerHandProps) {
  const [playingCards, setPlayingCards] = useState<Set<string>>(new Set());
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());

  console.log('PlayerHand render:', {
    cards,
    actions,
    playingCards,
    playerPopulation: getCurrentPopulation(player),
    maxPopulation: calculateMaxPopulation(player)
  });

  const canPlayCard = (card: CardType) => {
    const currentPopulation = getCurrentPopulation(player);
    const maxPopulation = calculateMaxPopulation(player);
    const canPlay = (
      !(card.type.includes('action') && actions <= 0) &&
      !(card.type.includes('family') && 
        (currentPopulation + (card.born || 0)) > maxPopulation)
    );

    console.log('🃏', card.name, canPlay ? '✅' : '❌', {
      pop: `${currentPopulation}/${maxPopulation}`,
      actions
    });

    return canPlay;
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
    
    // Calculate the total width and center offset
    let translateX;
    if (totalCards === 1) {
      translateX = 0; // Single card is centered
    } else {
      // For multiple cards, calculate position relative to center
      const centerOffset = ((totalCards - 1) * effectiveCardWidth) / 2;
      translateX = (index * effectiveCardWidth) - centerOffset;
    }

    // Add a slight vertical offset based on distance from center
    const maxVerticalOffset = 10;
    const centerIndex = (totalCards - 1) / 2;
    const distanceFromCenter = Math.abs(index - centerIndex);
    const verticalOffset = (distanceFromCenter * maxVerticalOffset) / centerIndex;

    return {
      translateX,
      translateY: verticalOffset,
      rotate: rotation
    };
  };

  const handlePlayCard = (card: CardType) => {
    if (!canPlayCard(card) || playingCards.has(card.uid)) return;
    
    setPlayingCards(prev => new Set([...prev, card.uid]));
    
    // Delay the actual card play until animation completes
    setTimeout(() => {
      onPlayCard(card.uid);
      setPlayingCards(prev => {
        const next = new Set(prev);
        next.delete(card.uid);
        return next;
      });
    }, 600);
  };

  useEffect(() => {
    setCompletedCards(new Set());
  }, [cards]);

  return (
    <>
      {/* Background gradient overlay */}
      <div className="fixed bottom-0 left-0 right-0 h-80 pointer-events-none bg-gradient-to-t from-gray-900/50 to-transparent" />
      
      {/* Cards container */}
      <div className="fixed bottom-32 left-0 right-0 mx-auto w-full">
        <div className="relative flex justify-center">
          <AnimatePresence mode="sync">
            {cards.map((card, index) => {
              const transform = getCardTransform(index, cards.length);
              const isPlaying = playingCards.has(card.uid);
              
              return (
                <motion.div
                  key={`${card.uid}`}
                  layout
                  initial={{ 
                    scale: 0.5, 
                    opacity: 0,
                    y: -100,
                    rotate: Math.random() * 180 - 90,
                  }}
                  animate={{ 
                    scale: isPlaying ? 0.8 : 1, 
                    opacity: 1,
                    y: isPlaying ? -200 : 0,
                    x: isPlaying ? 0 : transform.translateX,
                    rotate: isPlaying ? 0 : transform.rotate,
                  }}
                  exit={{ 
                    scale: 0.5, 
                    opacity: 0,
                    y: -100,
                    transition: {
                      duration: 0.2
                    }
                  }}
                  transition={{ 
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    mass: 0.8,
                    layout: true
                  }}
                  className={`absolute group ${isPlaying ? 'pointer-events-none' : ''}`}
                  style={{
                    transformOrigin: 'bottom center',
                    zIndex: isPlaying ? 100 : index,
                    perspective: '1000px',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <motion.div 
                    className="transform cursor-pointer"
                    whileHover={!isPlaying ? {
                      y: -128,
                      z: 50,
                      transition: {
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }
                    } : undefined}
                    onClick={() => handlePlayCard(card)}
                    animate={{
                      rotateX: isPlaying ? 45 : 0,
                      scale: isPlaying ? 1.2 : 1,
                      y: isPlaying ? -200 : 0,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }
                    }}
                  >
                    <CardComponent 
                      card={card} 
                      disabled={!canPlayCard(card)}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}