import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from './App';
import { TACTICS } from './gameEngine';

// CRA mocks CSS imports in Jest; load the real stylesheet to catch blocking overlays.
beforeAll(() => {
  const style = document.createElement('style');
  style.textContent = require('fs').readFileSync(`${__dirname}/App.css`, 'utf8');
  document.head.appendChild(style);
});

test('creates a multiplayer game lobby', () => {
  window.history.replaceState({}, '', '/');
  render(<App />);
  expect(screen.getByRole('heading', { name: /create a new game/i })).toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText(/enter your name/i), { target: { value: 'Chase' } });
  fireEvent.click(screen.getByRole('button', { name: /create game/i }));
  expect(screen.getByRole('heading', { name: /gather your mage knights/i })).toBeInTheDocument();
  expect(screen.getByText(/invite your party/i)).toBeInTheDocument();
});

test.each(TACTICS.day)('a solo host can play and finish a turn after choosing $name', async tactic => {
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, '', '/');
  render(<App />);

  fireEvent.change(screen.getByPlaceholderText(/enter your name/i), { target: { value: 'Solo host' } });
  fireEvent.click(screen.getByRole('button', { name: /create game/i }));
  fireEvent.click(screen.getByRole('button', { name: /tovak/i }));
  fireEvent.click(screen.getByRole('button', { name: /i.m ready/i }));
  fireEvent.click(screen.getByRole('button', { name: /start game/i }));

  await screen.findByRole('heading', { name: /choose your tactic/i });
  fireEvent.click(screen.getByRole('button', { name: new RegExp(tactic.name, 'i') }));
  if(tactic.id==='rethink')fireEvent.click(await screen.findByRole('button',{name:/choose rethink/i}));
  if(tactic.id==='mana-steal')fireEvent.click((await screen.findAllByRole('button',{name:/reserve until used/i}))[0]);
  await screen.findByRole('heading', { name: /action phase/i });

  await waitFor(() => expect(screen.getByTestId('game-shell')).not.toHaveClass('not-my-turn'));
  expect(screen.getByTestId('end-turn-choice')).not.toHaveClass('discard-choice');
  expect(screen.queryByText(/waiting for player/i)).not.toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /play sideways/i }).some(button => !button.disabled)).toBe(true);
  const shell = screen.getByTestId('game-shell');
  shell.querySelectorAll('.actions .card-choice').forEach(panel => {
    expect(['absolute', 'fixed']).not.toContain(getComputedStyle(panel).position);
  });
  const hand = shell.querySelector('.hand-panel');
  const initialCount = hand.querySelectorAll('.deed').length;
  fireEvent.click(within(hand).getAllByRole('button', { name: /play sideways/i })[0]);
  fireEvent.click(within(hand).getByRole('button', { name: /^move$/i }));
  expect(hand.querySelectorAll('.deed')).toHaveLength(initialCount - 1);
  const endTurn = screen.getByRole('button', { name: /^end turn/i });
  expect(endTurn).toBeEnabled();
  fireEvent.click(endTurn);
  expect(shell.querySelector('.round-indicator')).toHaveTextContent('Turn 2');
  expect(shell).not.toHaveClass('not-my-turn');
});

test('discard choices cover only their own Deed card', () => {
  const panel = document.createElement('div');
  panel.innerHTML = '<div class="actions"><div class="card-choice discard-choice"></div></div><article class="deed"><div class="card-choice discard-choice"></div></article>';
  document.body.appendChild(panel);
  try {
    expect(getComputedStyle(panel.querySelector('.actions .discard-choice')).position).toBe('static');
    expect(getComputedStyle(panel.querySelector('.deed .discard-choice')).position).toBe('absolute');
  } finally {
    panel.remove();
  }
});
