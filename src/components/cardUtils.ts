import { Player } from '../types/game';

// Calculate productivity ratio for treasure cards
export function calculateProductivityRatio(coins: number, productivityCost: number): number {
  if (!productivityCost) return 0;
  return coins / productivityCost;
}

// Format productivity ratio for display
export function formatProductivityRatio(ratio: number): string {
  return ratio.toFixed(2);
}

// Verify total card count hasn't changed
export function verifyCardCount(player: Player, operation: string): void {
  const total = player.deck.length + player.hand.length + 
                player.discard.length + player.inPlay.length;
                
  // For new players, they should have exactly 8 cards
  // (2 copper, 2 woods, 1 forest, 3 shacks)
  if (total !== 8 && 
      player.deck.length + player.hand.length === 8 && 
      player.discard.length === 0 && 
      player.inPlay.length === 0) {
    console.error(`Invalid starting deck! Expected 8 cards, found ${total}`);
    logCardCounts(player);
    throw new Error('Invalid starting deck');
  }
  
  // Log any mismatches
  if (operation === 'draw' && total !== 8) {
    console.error(`Card count mismatch after ${operation}! Total: ${total}`);
    logCardCounts(player);
    throw new Error('Card count mismatch');
  }
}

// Debug utility to log card counts
export function logCardCounts(player: Player): void {
  console.log('Card counts:', {
    deck: player.deck.length,
    hand: player.hand.length,
    discard: player.discard.length,
    inPlay: player.inPlay.length,
    total: player.deck.length + player.hand.length + 
           player.discard.length + player.inPlay.length
  });
}