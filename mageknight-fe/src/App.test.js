import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the playable conquest board', () => {
  render(<App />);
  expect(screen.getByText('Solo Conquest rules engine')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /mage knight map/i })).toBeInTheDocument();
  expect(screen.getByText(/current phase/i)).toBeInTheDocument();
});
