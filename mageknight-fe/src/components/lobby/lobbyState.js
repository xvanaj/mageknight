export const CHARACTERS = [
  { id: 'tovak', name: 'Tovak', color: 'blue', title: 'The Shield Bearer' },
  { id: 'arythea', name: 'Arythea', color: 'red', title: 'The Blood Cultist' },
  { id: 'goldyx', name: 'Goldyx', color: 'gold', title: 'The Draconum Mystic' },
  { id: 'norowas', name: 'Norowas', color: 'green', title: 'The Elven Commander' },
  { id: 'wolfhawk', name: 'Wolfhawk', color: 'white', title: 'The Lone Hunter' },
  { id: 'krang', name: 'Krang', color: 'orange', title: 'The Chaos Shaman' },
  { id: 'braevalar', name: 'Braevalar', color: 'teal', title: 'The Storm Druid' },
];

export const SCENARIOS = [
  { id: 'full-conquest', name: 'Full Conquest', detail: 'Six rounds; solo uses two cities, multiplayer uses one level-4 city per player.' },
  { id: 'blitz-conquest', name: 'Blitz Conquest', detail: 'Four rounds, level-3 cities, bonus Fame and Reputation, plus larger offers.' },
  { id: 'cooperative-conquest', name: 'Full Cooperation', detail: 'Solo Conquest for one, or the official cooperative setup for two or three players.' },
];

export const createLobby = (gameId, host) => ({
  id: gameId,
  scenario: SCENARIOS[0].id,
  status: 'lobby',
  players: [{ ...host, isHost: true, ready: false, character: null, connected: true }],
});

export function updateLobby(lobby, action) {
  if (!lobby || lobby.status !== 'lobby') return lobby;
  switch (action.type) {
    case 'JOIN': {
      const existing = lobby.players.find(player => player.id === action.player.id);
      if (existing) return { ...lobby, players: lobby.players.map(player => player.id === action.player.id ? { ...player, name: action.player.name, connected: true } : player) };
      if (lobby.players.length >= 4) return lobby;
      return { ...lobby, players: [...lobby.players, { ...action.player, isHost: false, ready: false, character: null, connected: true }] };
    }
    case 'LEAVE':
      return { ...lobby, players: lobby.players.filter(player => player.id !== action.playerId || player.isHost) };
    case 'DISCONNECT':
      return { ...lobby, players: lobby.players.map(player => player.id === action.playerId ? { ...player, connected: false, ready: false } : player) };
    case 'SELECT_CHARACTER': {
      if (lobby.players.some(player => player.id !== action.playerId && player.character === action.character)) return lobby;
      return { ...lobby, players: lobby.players.map(player => player.id === action.playerId ? { ...player, character: action.character, ready: false } : player) };
    }
    case 'SET_READY':
      return { ...lobby, players: lobby.players.map(player => player.id === action.playerId && player.character ? { ...player, ready: Boolean(action.ready) } : player) };
    case 'SET_SCENARIO':
      return SCENARIOS.some(item => item.id === action.scenario) ? { ...lobby, scenario: action.scenario, players: lobby.players.map(player => ({ ...player, ready: false })) } : lobby;
    case 'START':
      return canStartLobby(lobby) ? { ...lobby, status: 'playing', startedAt: Date.now() } : lobby;
    default:
      return lobby;
  }
}

export const canStartLobby = lobby => Boolean(lobby && lobby.players.length >= 1 && !(lobby.scenario==='cooperative-conquest'&&lobby.players.length>3) && lobby.players.every(player => player.connected && player.character && player.ready));

const GUEST_ACTIONS = new Set(['SELECT_CHARACTER', 'SET_READY', 'LEAVE']);

export function guestLobbyAction(action, playerId) {
  if (!action || !playerId || !GUEST_ACTIONS.has(action.type)) return null;
  return { ...action, playerId };
}

export function makeGameId() {
  const bytes = new Uint8Array(5);
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
  else for (let index = 0; index < bytes.length; index++) bytes[index] = Math.floor(Math.random() * 256);
  return Array.from(bytes, value => value.toString(36).padStart(2, '0')).join('').slice(0, 8).toUpperCase();
}
