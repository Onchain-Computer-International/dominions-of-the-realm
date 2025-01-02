import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardComponent } from './Card';
import { Card as CardType } from '../types/game';

interface SupplyProps {
  supply: Map<string, CardType[]>;
  onBuyCard: (cardId: string) => void;
  playerCoins: number;
  playerBuys: number;
}

export function Supply({ supply, onBuyCard, playerCoins, playerBuys }: SupplyProps) {
  const supplyPiles = Array.from(supply.entries())
    .filter(([, pile]) => pile.length > 0)
    .sort(([, a], [, b]) => a[0].cost - b[0].cost);

  return (
    <div>
      <motion.div 
        layout="position"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <AnimatePresence>
          {supplyPiles.map(([id, pile]) => {
            const card = pile[0];
            const canBuy = playerBuys > 0 && playerCoins >= card.cost;
            
            return pile.length > 0 && (
              <motion.div
                key={id}
                layout="position"
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  layout: { duration: 0.3 },
                  opacity: { duration: 0.2 }
                }}
              >
                <CardComponent
                  card={card}
                  onClick={() => onBuyCard(id)}
                  disabled={!canBuy}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}