import { useGameState } from './Game';
import { PlayerHand } from './components/PlayerHand';
import { Supply } from './components/Supply';
import { GameHeader } from './components/GameHeader';
import { Toast } from './components/Toast';
import { GameBoard } from './Map/components/GameBoard';
import { useAtom } from 'jotai';
import { mapAtom } from './atoms';
import { generateMap } from './Map/mapGenerator';
import { useEffect } from 'react';
import { MusicPlayer } from './components/MusicPlayer';

export default function App() {
  const [territories, setTerritories] = useAtom(mapAtom);
  const { 
    gameState, 
    playCard, 
    buyCard, 
    endTurn, 
    toastMessage,
    hideToast,
    initializeGame
  } = useGameState();
  
  // Initialize map and game state
  useEffect(() => {
    if (territories.length === 0) {
      const newMap = generateMap(12); // or whatever size you want
      setTerritories(newMap);
      // Wait for next render when territories are set
      return;
    }
    
    // Initialize game state after map is set
    if (territories.length > 0) {
      initializeGame();
    }
  }, [territories, setTerritories, initializeGame]);

  const player = gameState.players[0];

  return (
    <div className="w-screen h-screen fixed top-0 left-0">
      <GameBoard />
      <div className="max-w-7xl mx-auto p-8 pb-40 z-10">
        <GameHeader 
          player={player}
          turn={gameState.turn}
          season={gameState.season}
          month={gameState.month}
          actions={player.actions}
          coins={player.coins}
          buys={player.buys}
          workload={gameState.workload}
          happiness={gameState.happiness}
          activeEffects={gameState.activeEffects}
          deck={player.deck}
          discard={player.discard}
          inPlay={player.inPlay}
          hand={player.hand}
          onEndTurn={endTurn}
        />

        <Supply
          supply={gameState.supply}
          onBuyCard={buyCard}
          playerCoins={player.coins}
          playerBuys={player.buys}
        />
      </div>

      <PlayerHand
        cards={player.hand}
        onPlayCard={playCard}
        actions={player.actions}
        player={player}
      />

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={hideToast}
        />
      )}

      <MusicPlayer />
    </div>
  );
}