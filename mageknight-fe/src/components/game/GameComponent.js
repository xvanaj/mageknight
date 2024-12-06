import React, { useEffect, useState } from 'react';
import Header from './Header';
import HexGridComponent from './HexGridComponent';
import ActionCardOffer from './ActionCardOffer';
import SpellOffer from './SpellOffer';
import PlayerCards from './PlayerCards';
import UnitsOffer from './UnitsOffer';
import ManaDiceComponent from './ManaDiceComponent';

function GameComponent() {
  const [board, setBoard] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/board')
      .then(response => response.json())
      .then(data => setBoard(data))
      .catch(error => console.error('Error fetching board data:', error));
  }, []);

  if (!board) {
    return <div>Loading...</div>;
  }

  const player = board.players[0]; // Assuming you want to display the first player's info

  return (
    <div className="game-component">
      <Header player={player} />
      <div className="main-content">
        <ActionCardOffer actionCards={board.advancedActionOffer} />
        <HexGridComponent hexes={Object.values(board.hexes)} players = {board.players}/>
        <SpellOffer spells={board.spellOffer} />
      </div>
      <ManaDiceComponent manaDices={board.manaDices} />
      <UnitsOffer unitCards={board.unitOffer} />
      <PlayerCards playerCards={board.players.flatMap(player => player.hand)} />
    </div>
  );
}

export default GameComponent;