import { Player } from '../types/game';
import { shuffleArray } from './UtilityFunctions';

export function drawCards(player: Player, count: number): { reshuffled: boolean } {
    let reshuffled = false;

    for (let i = 0; i < count; i++) {
        // If deck is empty, shuffle discard into deck
        if (player.deck.length === 0) {
            if (player.discard.length === 0) {
                break; // No cards left to draw
            }
            player.deck = shuffleArray([...player.discard]);
            player.discard = [];
            reshuffled = true;
        }

        // Draw a card
        const drawnCard = player.deck.pop();
        if (drawnCard) {
            player.hand.push(drawnCard);
        }
    }

    return { reshuffled };
}