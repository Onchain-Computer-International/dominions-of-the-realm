import { Player } from '../types/game';
import { calculateUpkeep } from '../Game';
import { Coins } from 'lucide-react';

interface UpkeepDisplayProps {
  player: Player;
}

export function UpkeepDisplay({ player }: UpkeepDisplayProps) {
  const { base, total } = calculateUpkeep(player);
  
  return (
    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
      <Coins 
        size={16} 
        className={player.coins >= total ? "text-green-500" : "text-red-500"} 
      />
      <span className="text-sm">
        Monthly Upkeep: {total} coins ({base} × 0.5)
      </span>
    </div>
  );
}