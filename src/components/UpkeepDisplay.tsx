import React from 'react';
import { Player } from '../types/game';
import { calculateMonthlyUpkeep } from '../Game';
import { Coins } from 'lucide-react';

interface UpkeepDisplayProps {
  player: Player;
}

export function UpkeepDisplay({ player }: UpkeepDisplayProps) {
  const { baseUpkeep, modifiedUpkeep } = calculateMonthlyUpkeep(player);
  
  return (
    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
      <Coins 
        size={16} 
        className={player.coins >= modifiedUpkeep ? "text-green-500" : "text-red-500"} 
      />
      <span className="text-sm">
        Monthly Upkeep: {modifiedUpkeep} coins ({baseUpkeep} × 0.5)
      </span>
    </div>
  );
}