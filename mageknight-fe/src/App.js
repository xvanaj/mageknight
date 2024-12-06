import React, { useState } from 'react';
import './App.css';
import Menu from './components/Menu';
import GameComponent from './components/game/GameComponent';
import Leaderboard from './components/leaderboard/Leaderboard';
import About from './components/About';

function App() {
  const [currentView, setCurrentView] = useState('current-game');

  const renderView = () => {
    switch (currentView) {
      case 'current-game':
        return <GameComponent />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'about':
        return <About />;
      default:
        return <GameComponent />;
    }
  };

  return (
    <div className="App">
      <Menu setCurrentView={setCurrentView} />
      {renderView()}
    </div>
  );
}

export default App;