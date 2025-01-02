import { Card as CardType } from '../types/game';
import { Coins, Gauge, Users, Hammer, ShoppingCart, Layers } from 'lucide-react';
import { Player } from '../types/game';

// Combine utility functions into a CardUtils object
export const CardUtils = {
  verifyCardCount: (player: Player, operation: string): void => {
    const total = player.deck.length + player.hand.length + 
                 player.discard.length + player.inPlay.length;
    
    const isNewPlayer = total === 8 && 
                       player.discard.length === 0 && 
                       player.inPlay.length === 0;

    if (isNewPlayer || operation === 'draw') {
      if (total !== 8) {
        console.error(`Card count mismatch! Expected 8, found ${total}`);
        CardUtils.logCardCounts(player);
        throw new Error('Card count mismatch');
      }
    }
  },

  logCardCounts: (player: Player): void => {
    console.log('Card counts:', {
      deck: player.deck.length,
      hand: player.hand.length,
      discard: player.discard.length,
      inPlay: player.inPlay.length,
      total: player.deck.length + player.hand.length + 
             player.discard.length + player.inPlay.length
    });
  },

  getCardBackground: (types: CardType[], cardId: string): string => 
    `/images/cards/${cardId}.png`,

  getCardOverlayColor: (types: CardType[]): string => {
    const typeColorMap = {
      treasure: 'from-amber-900/50 to-amber-700/20',
      family: 'from-emerald-900/50 to-emerald-700/20',
      action: 'from-purple-900/50 to-purple-700/20'
    };
    return types.reduce((color, type) => typeColorMap[type] || color, 'from-gray-900/50 to-gray-700/20');
  },

  getTypeStyle: (type: string): string => {
    const styles = {
      action: 'bg-purple-100 text-purple-700',
      treasure: 'bg-amber-100 text-amber-700',
      family: 'bg-green-100 text-green-700',
      wealth: 'bg-purple-100 text-purple-700'
    };
    return styles[type] || 'bg-red-100 text-red-700';
  }
};

interface CardProps {
  card: CardType;
  onClick?: () => void;
  count?: number;
  className?: string;
  disabled?: boolean;
}

export function Card({ card, onClick, count, className = '', disabled }: CardProps) {
  return (
    <div 
      onClick={disabled ? undefined : onClick}
      className={`relative bg-white rounded-lg shadow-lg border ${className} w-48 h-72 transform-gpu overflow-hidden ${
        onClick && !disabled ? 'cursor-pointer hover:border-blue-400 hover:shadow-xl transition-all' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={CardUtils.getCardBackground(card.type, card.id)}
          alt={card.name}
          className="w-full h-auto"
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b ${CardUtils.getCardOverlayColor(card.type)}`} />

      {/* Top Right Stats */}
      <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
        {/* Cost */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded">
          <Coins size={12} className="text-gray-300" />
          <span className="text-[10px] font-medium text-gray-200">{card.cost}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="relative h-full flex flex-col">
        {/* Header and Types in the image area - now with explicit height */}
        <div className="p-3 h-[190px]">
          <div>
            <h3 className="font-bold text-base text-white truncate">{card.name}</h3>
            {card.familyName && (
              <p className="text-sm text-white/80 -mt-0.5">The {card.familyName} Family</p>
            )}
          </div>

          {/* Card Types */}
          <div className="flex flex-wrap gap-1 mt-2">
            {card.type.map(type => (
              <span 
                key={type} 
                className={`text-xs px-2 py-0.5 rounded ${CardUtils.getTypeStyle(type)}`}
              >
                {type}
              </span>
            ))}
          </div>

          {/* Modifiers Section */}
          {(card.type.includes('treasure') || card.type.includes('wealth') || card.type.includes('action')) && (
            <div className="flex flex-col gap-1 mt-1">
              {card.coins && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/80 rounded w-fit">
                  <Coins size={12} className="text-amber-100" />
                  <span className="text-xs font-medium text-amber-100">{card.coins >= 0 ? '+' : ''}{card.coins}</span>
                </div>
              )}
              {card.workload && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-500/80 rounded w-fit">
                  <Hammer size={12} className="text-gray-100" />
                  <span className="text-xs font-medium text-gray-100">{card.workload >= 0 ? '+' : ''}{card.workload}</span>
                </div>
              )}
              {card.actions && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/80 rounded w-fit">
                  <Gauge size={12} className="text-purple-100" />
                  <span className="text-xs font-medium text-purple-100">{card.actions >= 0 ? '+' : ''}{card.actions}</span>
                </div>
              )}
              {card.cards && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/80 rounded w-fit">
                  <Layers size={12} className="text-blue-100" />
                  <span className="text-xs font-medium text-blue-100">{card.cards >= 0 ? '+' : ''}{card.cards}</span>
                </div>
              )}
              {card.buys && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/80 rounded w-fit">
                  <ShoppingCart size={12} className="text-green-100" />
                  <span className="text-xs font-medium text-green-100">{card.buys >= 0 ? '+' : ''}{card.buys}</span>
                </div>
              )}
            </div>
          )}

          {/* Population for Family Cards */}
          {card.type.includes('family') && card.headcount && (
            <div className="flex items-center gap-1 mt-1 px-2 py-0.5 bg-emerald-500/80 rounded w-fit">
              <Users size={12} className="text-emerald-100" />
              <span className="text-xs font-medium text-emerald-100">+{card.born}</span>
            </div>
          )}
        </div>

        {/* Description and Lore - now with explicit height */}
        <div className="h-[96px] w-full bg-black/40 p-3 space-y-2 overflow-y-auto">
          <p className="text-xs leading-tight text-white/90">{card.description}</p>
          <p className="text-xs leading-tight italic text-white/70">{card.lore}</p>

          {count !== undefined && (
            <div className="absolute bottom-2 right-2 text-sm font-medium text-white/90 bg-black/50 px-2 py-0.5 rounded">
              {count} left
            </div>
          )}
        </div>
      </div>
    </div>
  );
}