import React from 'react';

function Menu({ setCurrentView }) {
  return (
    <nav className="menu">
      <ul>
        <li><button onClick={() => setCurrentView('current-game')}>Current Game</button></li>
        <li><button onClick={() => setCurrentView('new-game')}>New Game</button></li>
        <li><button onClick={() => setCurrentView('load-game')}>Load Game</button></li>
        <li><button onClick={() => setCurrentView('about')}>About</button></li>
        <li><button onClick={() => setCurrentView('leaderboard')}>Leaderboard</button></li>
      </ul>
    </nav>
  );
}

export default Menu;