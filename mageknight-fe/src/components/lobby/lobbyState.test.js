import { canStartLobby, createLobby, guestLobbyAction, SCENARIOS, updateLobby } from './lobbyState';

const host = { id: 'host', name: 'Host' };
const guest = { id: 'guest', name: 'Guest' };

test('a host can start a solo game after choosing a character and readying up', () => {
  let lobby = createLobby('ABCD1234', host);
  expect(canStartLobby(lobby)).toBe(false);
  lobby = updateLobby(lobby, { type: 'SELECT_CHARACTER', playerId: host.id, character: 'tovak' });
  lobby = updateLobby(lobby, { type: 'SET_READY', playerId: host.id, ready: true });
  expect(canStartLobby(lobby)).toBe(true);
  expect(updateLobby(lobby, { type: 'START' }).status).toBe('playing');
});

test.each([
  ['Full Conquest', 'full-conquest'],
  ['Blitz Conquest', 'blitz-conquest'],
  ['Full Cooperation', 'cooperative-conquest'],
])('%s permits one ready player', (_name, scenario) => {
  let lobby = createLobby('SOLO1234', host);
  lobby = updateLobby(lobby, { type: 'SET_SCENARIO', scenario });
  lobby = updateLobby(lobby, { type: 'SELECT_CHARACTER', playerId: host.id, character: 'tovak' });
  lobby = updateLobby(lobby, { type: 'SET_READY', playerId: host.id, ready: true });
  expect(canStartLobby(lobby)).toBe(true);
});

test.each([
  ['Full Conquest', 'full-conquest'],
  ['Blitz Conquest', 'blitz-conquest'],
  ['Full Cooperation', 'cooperative-conquest'],
])('%s permits one ready player', (_name, scenario) => {
  let lobby = createLobby('SOLO1234', host);
  lobby = updateLobby(lobby, { type: 'SET_SCENARIO', scenario });
  lobby = updateLobby(lobby, { type: 'SELECT_CHARACTER', playerId: host.id, character: 'tovak' });
  lobby = updateLobby(lobby, { type: 'SET_READY', playerId: host.id, ready: true });
  expect(canStartLobby(lobby)).toBe(true);
});

test.each(SCENARIOS.map(scenario => [scenario.name, scenario.id]))('%s permits one ready player', (_name, scenario) => {
  let lobby = createLobby('SOLO1234', host);
  lobby = updateLobby(lobby, { type: 'SET_SCENARIO', scenario });
  lobby = updateLobby(lobby, { type: 'SELECT_CHARACTER', playerId: host.id, character: 'tovak' });
  lobby = updateLobby(lobby, { type: 'SET_READY', playerId: host.id, ready: true });
  expect(canStartLobby(lobby)).toBe(true);
});

test('every connected player must choose a unique character and ready up', () => {
  let lobby = createLobby('ABCD1234', host);
  lobby = updateLobby(lobby, { type: 'JOIN', player: guest });
  lobby = updateLobby(lobby, { type: 'SELECT_CHARACTER', playerId: host.id, character: 'tovak' });
  lobby = updateLobby(lobby, { type: 'SELECT_CHARACTER', playerId: guest.id, character: 'arythea' });
  lobby = updateLobby(lobby, { type: 'SET_READY', playerId: host.id, ready: true });
  expect(canStartLobby(lobby)).toBe(false);
  lobby = updateLobby(lobby, { type: 'SET_READY', playerId: guest.id, ready: true });
  expect(canStartLobby(lobby)).toBe(true);
  expect(updateLobby(lobby, { type: 'START' }).status).toBe('playing');
});

test('a character already selected by another player cannot be claimed', () => {
  let lobby = createLobby('ABCD1234', host);
  lobby = updateLobby(lobby, { type: 'JOIN', player: guest });
  lobby = updateLobby(lobby, { type: 'SELECT_CHARACTER', playerId: host.id, character: 'tovak' });
  lobby = updateLobby(lobby, { type: 'SELECT_CHARACTER', playerId: guest.id, character: 'tovak' });
  expect(lobby.players.find(player => player.id === guest.id).character).toBeNull();
});

test('guest lobby actions are bound to the authenticated player', () => {
  expect(guestLobbyAction({ type: 'SET_READY', playerId: host.id, ready: true }, guest.id)).toEqual({ type: 'SET_READY', playerId: guest.id, ready: true });
  expect(guestLobbyAction({ type: 'SELECT_CHARACTER', playerId: host.id, character: 'arythea' }, guest.id)).toEqual({ type: 'SELECT_CHARACTER', playerId: guest.id, character: 'arythea' });
});

test('host-only and forged join actions are rejected for authenticated guests', () => {
  expect(guestLobbyAction({ type: 'START' }, guest.id)).toBeNull();
  expect(guestLobbyAction({ type: 'SET_SCENARIO', scenario: 'blitz-conquest' }, guest.id)).toBeNull();
  expect(guestLobbyAction({ type: 'JOIN', player: host }, guest.id)).toBeNull();
});

test('official Full Cooperation setup rejects a fourth actual player', () => {
  const players = Array.from({ length: 4 }, (_, index) => ({ id: `p${index}`, connected: true, character: `c${index}`, ready: true }));
  expect(canStartLobby({ scenario: 'cooperative-conquest', players })).toBe(false);
  expect(canStartLobby({ scenario: 'full-conquest', players })).toBe(true);
});
