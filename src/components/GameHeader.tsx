import { useEffect, useState } from 'react';
import { Swords, Coins, ShoppingCart, Users, Calendar, Sparkles, Hammer, Heart, Layers, Gauge } from 'lucide-react';
import { Player, Season, ActiveEffect } from '../types/game';
import { getSeasonEmoji, getMonthName } from '../Game';
import { getCurrentPopulation, calculateMaxPopulation } from '../Game';
import { DeckViewer } from './DeckViewer';
import { motion, AnimatePresence } from 'framer-motion';

interface GameHeaderProps {
  player: Player;
  turn: number;
  season: Season;
  month: number;
  actions: number;
  coins: number;
  buys: number;
  workload: number;
  happiness: number;
  activeEffects: ActiveEffect[];
  deck: CardType[];
  discard: CardType[];
  inPlay: CardType[];
  hand: CardType[];
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

function getWorkloadColor(workload: number, population: number): string {
  const ratio = workload / population;
  if (ratio > 2) return 'bg-red-50 text-black';
  if (ratio >= 1.8) return 'bg-yellow-50 text-black';
  return 'bg-green-50 text-black';
}

export function GameHeader({ 
  player, 
  turn,
  season,
  month,
  actions,
  coins,
  buys,
  workload,
  happiness,
  activeEffects,
  deck,
  discard,
  inPlay,
  hand,
  onEndTurn
}: GameHeaderProps) {
  const currentPopulation = getCurrentPopulation(player);
  const maxWorkload = currentPopulation * 2;
  const totalCards = deck.length + discard.length + inPlay.length + hand.length;

  return (
    <div className="bg-white p-3 rounded-lg shadow-md mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-emerald-500/80 px-2 py-1 rounded-md text-xs">
            <Users size={14} className="text-emerald-100" />
            <span className="font-semibold text-emerald-100">
              Population: <AnimatedValue value={getCurrentPopulation(player)} /> / {calculateMaxPopulation(player)}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-purple-500/80 px-2 py-1 rounded-md text-xs">
            <Gauge size={14} className="text-purple-100" />
            <span className="font-medium text-purple-100">
              Actions: <AnimatedValue value={actions} />
            </span>
          </div>
          <div className="flex items-center gap-1 bg-amber-500/80 px-2 py-1 rounded-md text-xs">
            <Coins size={14} className="text-amber-100" />
            <span className="font-medium text-amber-100">
              Coins: <AnimatedValue value={coins} />
            </span>
          </div>
          <div className="flex items-center gap-1 bg-green-500/80 px-2 py-1 rounded-md text-xs">
            <ShoppingCart size={14} className="text-green-100" />
            <span className="font-medium text-green-100">
              Buys: <AnimatedValue value={buys} />
            </span>
          </div>
          <div className="flex items-center gap-1 bg-gray-500/80 px-2 py-1 rounded-md text-xs">
            <Hammer size={14} className="text-gray-100" />
            <span className="font-medium text-gray-100">
              Workload: <AnimatedValue value={workload} /> / {maxWorkload}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {activeEffects.length > 0 && (
            <div className="flex gap-1">
              {activeEffects.map((effect) => (
                <div 
                  key={effect.id}
                  className="flex items-center gap-1 bg-purple-50 px-1.5 py-0.5 rounded text-xs font-medium text-purple-700"
                >
                  <Sparkles size={10} className="text-purple-500" />
                  {effect.sourceCard}
                </div>
              ))}
            </div>
          )}

          <DeckViewer
            deck={deck}
            discard={discard}
            inPlay={inPlay}
            hand={hand}
          >
            <button className="bg-white rounded-full p-2 hover:bg-gray-50 flex items-center gap-2">
              <Layers size={20} className="text-gray-500" />
              <span className="font-medium text-gray-600">Cards: {totalCards}</span>
            </button>
          </DeckViewer>

          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md text-xs"
            >
              <Calendar size={14} className="text-indigo-500" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${season}-${month}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="font-semibold text-indigo-700"
                >
                  {getSeasonEmoji(season)} {getMonthName(season, month)}
                </motion.span>
              </AnimatePresence>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gray-100 px-2 py-1 rounded-md text-xs"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={turn}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="font-semibold text-gray-700"
                >
                  Turn {turn}
                </motion.span>
              </AnimatePresence>
            </motion.div>

            <motion.button
              onClick={onEndTurn}
              whileHover={{ scale: 1.05, backgroundColor: '#2563eb' }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-1 bg-blue-500 text-white text-xs font-medium rounded-md
                transition-colors shadow-sm"
            >
              End Turn
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}