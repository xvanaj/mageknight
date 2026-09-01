import React, { useState } from 'react';
import './App.css';
import LobbyScreen from './components/lobby/LobbyScreen';
import { makeGameId } from './components/lobby/lobbyState';

const readRoute = () => {
  const params = new URLSearchParams(window.location.search);
  return { gameId: params.get('game') || '', isHost: params.get('host') === '1' };
};

export default function App() {
  const [route, setRoute] = useState(readRoute);

  const create = name => {
    const gameId = makeGameId();
    const next = { gameId, isHost: true, hostName: name };
    window.history.pushState({}, '', `${window.location.pathname}?game=${gameId}&host=1`);
    setRoute(next);
  };
  const exit = () => {
    window.history.pushState({}, '', window.location.pathname);
    setRoute({ gameId: '', isHost: false });
  };

  return <LobbyScreen key={`${route.gameId}:${route.isHost}`} route={route} onCreate={create} onExit={exit}/>;
}
