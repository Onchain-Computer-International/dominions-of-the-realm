import { Player } from '../types/game';
import { shuffleArray } from './UtilityFunctions';

export function drawCards(player: Player, count: number): { reshuffled: boolean } {
    let reshuffled = false;
    let remainingToDraw = count;
    
    while (remainingToDraw > 0) {
        if (player.deck.length === 0 && player.discard.length > 0) {
            player.deck = shuffleArray([...player.discard]);
            player.discard = [];
            reshuffled = true;
        }
        
        if (player.deck.length === 0) break;
        
        const card = player.deck.pop();
        if (card) {
            player.hand.push({...card});
            remainingToDraw--;
        }
    }

    return { reshuffled };
}