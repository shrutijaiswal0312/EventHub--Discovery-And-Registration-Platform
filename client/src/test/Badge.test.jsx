import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../components/common/Badge';

describe('Badge Component', () => {
  it('renders badge children correctly', () => {
    render(<Badge variant="primary">Technology</Badge>);
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('applies correct variant styling class', () => {
    const { container } = render(<Badge variant="success">Confirmed</Badge>);
    expect(container.firstChild).toHaveClass('text-emerald-700');
  });
});
