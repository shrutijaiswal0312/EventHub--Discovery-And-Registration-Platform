import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../components/pages/auth/LoginPage';
import { AuthProvider } from '../context/AuthContext';

describe('LoginPage Component', () => {
  it('renders login form inputs and demo account selectors', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Sign in to EventHub')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@domain.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Demo Participant/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Demo Organizer/i })).toBeInTheDocument();
  });

  it('populates demo credentials when demo buttons are clicked', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const demoParticipantBtn = screen.getByRole('button', { name: /Demo Participant/i });
    fireEvent.click(demoParticipantBtn);

    const emailInput = screen.getByPlaceholderText('you@domain.com');
    expect(emailInput.value).toBe('john@example.com');
  });
});
