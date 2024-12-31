import React from 'react';
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
      <h2 className="text-xl font-bold mb-4">Supply</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {supplyPiles.map(([id, pile]) => {
          const card = pile[0];
          const canBuy = playerBuys > 0 && playerCoins >= card.cost;
          
          return pile.length > 0 && (
            <CardComponent
              key={id}
              card={card}
              count={pile.length}
              onClick={() => onBuyCard(id)}
              disabled={!canBuy}
            />
          );
        })}
      </div>
    </div>
  );
}