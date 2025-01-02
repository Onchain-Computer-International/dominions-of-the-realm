import React from 'react';
import { GameBoard } from './components/GameBoard';

function App() {
  return (
    <div className="w-screen h-screen fixed top-0 left-0">
      <GameBoard />
    </div>
  );
}

export default App;