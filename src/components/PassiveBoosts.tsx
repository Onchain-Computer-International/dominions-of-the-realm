import { Card } from '../types/game';
import { Gauge, Coins, Swords, ShoppingCart } from 'lucide-react';

interface PassiveBoostsProps {
  cards: Card[];
}

export function PassiveBoosts({ cards }: PassiveBoostsProps) {
  // Group cards by type for better organization
  const boosts = cards.reduce((acc, card) => {
    // Add efficiency bonus from mines
    if (card.productivityBonus) {
      acc.efficiency += card.productivityBonus;
    }

    // Add effect-based boosts
    if (card.effects) {
      card.effects.forEach(effect => {
        if (effect.type === 'duration' || effect.type === 'reaction') {
          if (effect.timing === 'startOfTurn') {
            if (effect.apply.toString().includes('actions')) acc.actions++;
            if (effect.apply.toString().includes('buys')) acc.buys++;
          }
          if (effect.timing === 'onCardPlay' && effect.apply.toString().includes('coins')) {
            acc.coins++;
          }
        }
      });
    }
    return acc;
  }, { efficiency: 0, actions: 0, buys: 0, coins: 0 });

  if (!Object.values(boosts).some(v => v > 0)) return null;

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-700">Passive Boosts</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {boosts.efficiency > 0 && (
          <div className="flex items-center gap-2 bg-white p-2 rounded shadow-sm">
            <Gauge size={16} className="text-purple-500" />
            <span className="text-sm">+{boosts.efficiency.toFixed(1)}x Efficiency</span>
          </div>
        )}
        {boosts.actions > 0 && (
          <div className="flex items-center gap-2 bg-white p-2 rounded shadow-sm">
            <Swords size={16} className="text-purple-500" />
            <span className="text-sm">+{boosts.actions} Action/turn</span>
          </div>
        )}
        {boosts.coins > 0 && (
          <div className="flex items-center gap-2 bg-white p-2 rounded shadow-sm">
            <Coins size={16} className="text-yellow-500" />
            <span className="text-sm">+{boosts.coins} Coin on treasure</span>
          </div>
        )}
        {boosts.buys > 0 && (
          <div className="flex items-center gap-2 bg-white p-2 rounded shadow-sm">
            <ShoppingCart size={16} className="text-green-500" />
            <span className="text-sm">+{boosts.buys} Buy/turn</span>
          </div>
        )}
      </div>
    </div>
  );
}