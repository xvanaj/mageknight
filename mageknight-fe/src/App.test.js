import { fireEvent, render, screen } from '@testing-library/react';
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
