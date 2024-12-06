import React from 'react';
import '../../Header.css';

function Header({ player }) {
  const { character, name, fame, reputation, level, armor, cardsMax, maxUnits } = player;
  return (
    <header>
      <div className="player-info">
        <p>Character: {character}</p>
        <p>Name: {name}</p>
        <p>Position: ({player.position.q}, {player.position.r}, {player.position.s})</p>
        <p>Fame: {fame}</p>
        <p>Reputation: {reputation}</p>
        <p>Level: {level}</p>
        <p>Armor: {armor}</p>
        <p>Cards Max: {cardsMax}</p>
        <p>Max Units: {maxUnits}</p>
      </div>
    </header>
  );
}

export default Header;