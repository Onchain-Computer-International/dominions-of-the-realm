import { Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Season } from '../types/game';
import { getSeasonEmoji, getMonthName } from '../Game';

interface TurnControlsProps {
  turn: number;
  season: Season;
  month: number;
  onEndTurn: () => void;
}

export function TurnControls({ turn, season, month, onEndTurn }: TurnControlsProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 right-4 flex items-center gap-2 bg-white p-3 rounded-lg shadow-lg"
    >
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
    </motion.div>
  );
} 