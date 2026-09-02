import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('creates a multiplayer game lobby', () => {
  window.history.replaceState({}, '', '/');
  render(<App />);
  expect(screen.getByRole('heading', { name: /create a new game/i })).toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText(/enter your name/i), { target: { value: 'Chase' } });
  fireEvent.click(screen.getByRole('button', { name: /create game/i }));
  expect(screen.getByRole('heading', { name: /gather your mage knights/i })).toBeInTheDocument();
  expect(screen.getByText(/invite your party/i)).toBeInTheDocument();
});

test('a solo host can enter the first action phase without a blocking discard overlay', async () => {
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
  fireEvent.click(screen.getByRole('button', { name: /early bird/i }));
  await screen.findByRole('heading', { name: /action phase/i });

  await waitFor(() => expect(screen.getByTestId('game-shell')).not.toHaveClass('not-my-turn'));
  expect(screen.getByTestId('end-turn-choice')).not.toHaveClass('discard-choice');
  expect(screen.queryByText(/waiting for player/i)).not.toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /play sideways/i }).some(button => !button.disabled)).toBe(true);
});
