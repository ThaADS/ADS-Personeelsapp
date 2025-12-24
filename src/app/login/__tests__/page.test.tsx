import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from '@/app/login/page';

// Mock the useRouter hook
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

describe('LoginPage', () => {
  it('renders the login form', () => {
    render(<LoginPage />);

    // Find inputs by placeholder since labels are sr-only
    expect(screen.getByPlaceholderText(/e-mailadres/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/wachtwoord/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /inloggen/i })).toBeInTheDocument();
  });
});
