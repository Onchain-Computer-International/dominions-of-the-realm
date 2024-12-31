import React, { useEffect, useState } from 'react';
import { Book, Trophy, Swords, Coins, ShoppingCart, Users, Gauge, Calendar, Scale } from 'lucide-react';
import { Player, Season } from '../types/game';
import { calculateTotalFamilyMembers, getSeasonEmoji, getMonthName } from '../Game';
import { calculateEfficiencyMultiplier } from './productivityUtils';
import { getSeasonalDescription, calculateMonthlyUpkeep } from '../Game';

interface GameHeaderProps {
  player: Player;
  turn: number;
  season: Season;
  month: number;
  actions: number;
  coins: number;
  buys: number;
  onEndTurn: () => void;
}

type AnimatedValueProps = {
  value: number;
  className?: string;
};

function AnimatedValue({ value, className = "" }: AnimatedValueProps) {
  const [animations, setAnimations] = useState<{value: number, timestamp: number}[]>([]);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (prevValue !== value) {
      const difference = value - prevValue;
      if (difference !== 0) {
        // Add new animation to the queue
        setAnimations(current => [...current, {
          value: difference,
          timestamp: Date.now()
        }]);
        setPrevValue(value);
      }
    }
  }, [value, prevValue]);

  // Cleanup old animations
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setAnimations(current => 
        current.filter(anim => now - anim.timestamp < 2500)
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`relative ${className}`}>
      {value}
      {animations.map((anim, index) => (
        <span
          key={anim.timestamp}
          className={`absolute -top-4 left-full ml-1 text-xs font-bold animate-fadeOut
            ${anim.value > 0 ? 'text-green-500' : 'text-red-500'}`}
          style={{
            zIndex: 10 + index,
            left: `${100 + (index * 20)}%`
          }}
        >
          {anim.value > 0 ? '+' : ''}{anim.value}
        </span>
      ))}
    </span>
  );
}

export function GameHeader({ 
  player, 
  turn,
  season,
  month,
  actions,
  coins,
  buys,
  onEndTurn 
}: GameHeaderProps) {
  const totalPopulation = calculateTotalFamilyMembers(player);
  const efficiency = calculateEfficiencyMultiplier(player, season);
  const { modifiedUpkeep } = calculateMonthlyUpkeep(player);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      {/* Top Section: Time and Population */}
      <div className="flex justify-between items-center mb-4">
        {/* Left Side */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-md">
            <Calendar size={16} className="text-indigo-500" />
            <span className="text-sm font-semibold text-indigo-700">
              {getSeasonEmoji(season)} {getMonthName(season, month)}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-md">
            <Users size={16} className="text-blue-500" />
            <span className="text-sm font-semibold text-blue-700">
              Population: <AnimatedValue value={totalPopulation} />
            </span>
          </div>
        </div>

        {/* Right Side - Turn Counter */}
        <div className="bg-gray-100 px-3 py-1.5 rounded-md">
          <span className="text-sm font-semibold text-gray-700">Turn {turn}</span>
        </div>
      </div>

      {/* Middle Section: Efficiency Metrics */}
      <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <Gauge size={16} className="text-purple-500" />
          <span className="text-sm font-medium">
            Efficiency: <AnimatedValue value={Number(efficiency.toFixed(1))} />x
            <span className="text-xs text-gray-500 ml-2">
              ({getSeasonalDescription(season)})
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Scale size={16} className="text-orange-500" />
          <span className="text-sm font-medium">Expectations: 0.5x</span>
        </div>
      </div>

      {/* Bottom Section: Resources and Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        {/* Resource Counters */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-md">
            <Swords size={16} className="text-purple-500" />
            <span className="text-sm font-medium">
              Actions: <AnimatedValue value={actions} />
            </span>
          </div>
          <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-md">
            <Coins size={16} className="text-yellow-500" />
            <span className="text-sm font-medium">
              Coins: <AnimatedValue value={coins} />
              <span className="text-red-500 ml-1">
                (-<AnimatedValue value={modifiedUpkeep} />)
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-md">
            <ShoppingCart size={16} className="text-green-500" />
            <span className="text-sm font-medium">
              Buys: <AnimatedValue value={buys} />
            </span>
          </div>
        </div>

        {/* End Turn Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Gauge size={16} className="text-purple-500" />
            <span className="text-sm font-medium">
              Productivity: <AnimatedValue value={player.productivityPoints} />
            </span>
          </div>
          <button
            onClick={onEndTurn}
            className="px-6 py-2 bg-blue-500 text-white font-medium rounded-md
              hover:bg-blue-600 transition-colors shadow-sm
              active:transform active:scale-95"
          >
            End Turn
          </button>
        </div>
      </div>
    </div>
  );
}