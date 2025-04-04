import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';
import { vi } from 'vitest';

// Mocke LocaleSwitcherSelect
vi.mock('../LocaleSwitcherSelect', () => {
  return {
    default: () => <div>LocaleSwitcherMock</div>,
  };
});

test('renders header with "Content Elements"', () => {
  render(<Header />);
  expect(screen.getByText('Content Elements')).toBeInTheDocument();
});
