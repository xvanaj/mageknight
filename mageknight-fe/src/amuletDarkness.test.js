import { createGame, reduceGame } from './gameEngine';

test('Amulet of Darkness expires at turn end and black Source mana becomes unavailable again', () => {
  let game = createGame();
  const index = game.decks.artifacts.findIndex(card => card.id === 'amulet-of-darkness');
  const amulet = game.decks.artifacts.splice(index, 1)[0];
  game.player.hand = [amulet];
  game = reduceGame(game, { type: 'PLAY_CARD', uid: amulet.uid, mode: 'basic', manaColors: ['black'] });
  expect(game.error).toBeNull();
  expect(game.bonuses.blackManaUsable).toBe(true);

  game = reduceGame(game, { type: 'END_TURN' });
  expect(game.error).toBeNull();
  expect(game.turn).toBe(2);
  expect(game.bonuses.blackManaUsable).toBe(false);
  expect(game.bonuses.movementRules).toEqual([]);
  expect(game.mana).toEqual([]);
  expect(game.player.discard.map(card => card.id)).toContain('amulet-of-darkness');

  game.source[0].color = 'black';
  game = reduceGame(game, { type: 'TAKE_SOURCE', id: game.source[0].id });
  expect(game.error).toMatch(/black mana cannot be used during the day/i);
  expect(game.mana).toEqual([]);
});
