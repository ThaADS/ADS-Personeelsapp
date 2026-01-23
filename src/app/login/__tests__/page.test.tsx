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

    // Find inputs by placeholder (actual placeholders from login page)
    expect(screen.getByPlaceholderText('naam@bedrijf.nl')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /inloggen/i })).toBeInTheDocument();
  });
});
