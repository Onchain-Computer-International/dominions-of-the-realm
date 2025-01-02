import React from 'react';
import { useGameState } from './Game';
import { PlayerHand } from './components/PlayerHand';
import { Supply } from './components/Supply';
import { GameHeader } from './components/GameHeader';
import { Toast } from './components/Toast';

export default function App() {
  const { 
    gameState, 
    playCard, 
    buyCard, 
    endTurn, 
    toastMessage,
    hideToast
  } = useGameState();
  
  const player = gameState.players[0];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-8 pb-40">
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
    </div>
  );
}