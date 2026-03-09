import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Dummy Setup Verification', () => {
  it('renders dummy element correctly', () => {
    render(<div data-testid="dummy">Setup OK</div>);
    expect(screen.getByTestId('dummy')).toBeInTheDocument();
  });
});
