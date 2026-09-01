import { canStartLobby, createLobby, updateLobby } from './lobbyState';

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
