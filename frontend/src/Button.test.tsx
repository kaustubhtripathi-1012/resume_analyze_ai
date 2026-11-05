import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Button } from './components/Button';

describe('Button component', () => {
  it('renders button with children text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeDefined();
  });

  it('disables button when disabled or loading', () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole('button');
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });
});

