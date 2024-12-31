import React from 'react';
import { Card as CardType } from '../types/game';
import { Coins, Gauge, Users } from 'lucide-react';
import { getCardBackground, getCardOverlayColor } from './cardImageUtils';
import { calculateProductivityRatio, formatProductivityRatio } from './cardUtils';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  count?: number;
  className?: string;
  disabled?: boolean;
}

export function Card({ card, onClick, count, className = '', disabled }: CardProps) {
  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'action': return 'bg-purple-100 text-purple-700';
      case 'treasure': return 'bg-amber-100 text-amber-700';
      case 'family': return 'bg-green-100 text-green-700';
      default: return 'bg-red-100 text-red-700';
    }
  };

  const showProductivityCost = card.type.includes('treasure') && card.productivityCost;
  const productivityRatio = showProductivityCost ? calculateProductivityRatio(card.coins || 0, card.productivityCost || 0) : 0;

  return (
    <div 
      onClick={disabled ? undefined : onClick}
      className={`relative bg-white rounded-lg shadow-lg border ${className} w-48 h-72 transform-gpu overflow-hidden ${
        onClick && !disabled ? 'cursor-pointer hover:border-blue-400 hover:shadow-xl transition-all' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${getCardBackground(card.type)}')` }}
      />
      
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b ${getCardOverlayColor(card.type)}`} />

      {/* Top Right Stats */}
      <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
        {/* Cost */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded">
          <Coins size={12} className="text-gray-300" />
          <span className="text-[10px] font-medium text-gray-200">{card.cost}</span>
        </div>

        {/* Population for family cards */}
        {card.type.includes('family') && card.headcount && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded">
            <Users size={12} className="text-gray-300" />
            <span className="text-[10px] font-medium text-gray-200">+{card.headcount}</span>
          </div>
        )}

        {/* Productivity stats for treasure cards */}
        {showProductivityCost && (
          <>
            <div className="px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] font-medium text-gray-200 whitespace-nowrap">
              {formatProductivityRatio(productivityRatio)}x
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded">
              <Gauge size={12} className="text-gray-300" />
              <span className="text-[10px] font-medium text-gray-200">{card.productivityCost}</span>
            </div>
          </>
        )}
      </div>

      {/* Card Content */}
      <div className="relative p-3 h-full flex flex-col">
        {/* Header */}
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
              className={`text-xs px-2 py-0.5 rounded ${getTypeStyle(type)}`}
            >
              {type}
            </span>
          ))}
        </div>

        {/* Description and Lore */}
        <div className="mt-auto space-y-2 bg-black/40 rounded p-2">
          <p className="text-sm leading-tight text-white/90">{card.description}</p>
          <p className="text-sm leading-tight italic text-white/70">{card.lore}</p>
        </div>

        {/* Supply Count */}
        {count !== undefined && (
          <div className="absolute bottom-2 right-2 text-sm font-medium text-white/90 bg-black/50 px-2 py-0.5 rounded">
            {count} left
          </div>
        )}
      </div>
    </div>
  );
}