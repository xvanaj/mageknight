export const CHARACTERS = [
  { id: 'tovak', name: 'Tovak', color: 'blue', title: 'The Shield Bearer' },
  { id: 'arythea', name: 'Arythea', color: 'red', title: 'The Blood Cultist' },
  { id: 'goldyx', name: 'Goldyx', color: 'gold', title: 'The Draconum Mystic' },
  { id: 'norowas', name: 'Norowas', color: 'green', title: 'The Elven Commander' },
];

export const SCENARIOS = [
  { id: 'first-reconnaissance', name: 'First Reconnaissance', detail: 'Training mission: reveal the capital; cities cannot be entered or conquered. Spell and Advanced Action offers start hidden and appear when first needed.' },
  { id: 'full-conquest', name: 'Full Conquest', detail: 'Six-round competitive conquest for two to four players, with one level-4 city per player.' },
  { id: 'solo-conquest', name: 'Solo Conquest', detail: 'Six rounds for one player with a dummy timer and cities revealed at levels 5 and 8.' },
  { id: 'blitz-conquest', name: 'Blitz Conquest', detail: 'Four rounds, level-3 cities, bonus Fame and Reputation, plus larger offers.' },
  { id: 'cooperative-conquest', name: 'Full Cooperation', detail: 'Six-round cooperative conquest for two or three players with a dummy timer.' },
  { id: 'blitz-cooperation', name: 'Blitz Cooperation', detail: 'Four-round cooperative mission for two or three players with escalating cities and Blitz bonuses.' },
  { id: 'mines-liberation', name: 'Mines Liberation', detail: 'Four-round competitive mission: clear every mine and restore crystal production.' },
  { id: 'dungeon-lords', name: 'Dungeon Lords', detail: 'Five-round competitive mission with secret underground sites and tunnel travel.' },
  { id: 'druid-nights', name: 'Druid Nights', detail: 'Four-round competitive mission: claim magical glades and perform two night incantations.' },
  { id: 'conquer-and-hold', name: 'Conquer and Hold', detail: 'Control keeps and mage towers over six rounds for two players, or four rounds for two teams.' },
  { id: 'one-to-return', name: 'One to Return', detail: 'Four-round elimination mission: return to the closed portal when the second Night ends.' },
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
      if (!CHARACTERS.some(character => character.id === action.character)) return lobby;
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

export const canStartLobby = lobby => {
  if(!lobby||lobby.players.length<1)return false;
  const count=lobby.players.length;
  if(lobby.scenario==='full-conquest'&&(count<2||count>4))return false;
  if(lobby.scenario==='solo-conquest'&&count!==1)return false;
  if(lobby.scenario==='blitz-conquest'&&(count<2||count>4))return false;
  if(lobby.scenario==='cooperative-conquest'&&(count<2||count>3))return false;
  if(lobby.scenario==='blitz-cooperation'&&(count<2||count>3))return false;
  if(lobby.scenario==='mines-liberation'&&(count<2||count>4))return false;
  if(lobby.scenario==='dungeon-lords'&&(count<2||count>4))return false;
  if(lobby.scenario==='druid-nights'&&(count<2||count>4))return false;
  if(lobby.scenario==='conquer-and-hold'&&![2,4].includes(count))return false;
  if(lobby.scenario==='one-to-return'&&(count<2||count>4))return false;
  const baseCharacters=new Set(CHARACTERS.map(character=>character.id));
  return lobby.players.every(player=>player.connected&&baseCharacters.has(player.character)&&player.ready);
};

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
