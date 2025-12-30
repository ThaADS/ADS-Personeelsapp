import { describe, it, expect } from 'vitest';
import { createTenantSlug } from '@/lib/tenant';

describe('createTenantSlug', () => {
  it('lowercases input and trims spaces', () => {
    expect(createTenantSlug('  ACME Corp  ')).toBe('acme-corp')
  })

  it('replaces spaces with hyphens', () => {
    expect(createTenantSlug('My Company Name')).toBe('my-company-name')
  })

  it('removes special characters', () => {
    expect(createTenantSlug('Café & Co.!')).toBe('caf-co')
  })

  it('collapses multiple hyphens and trims edges', () => {
    expect(createTenantSlug('--Hello---World--')).toBe('hello-world')
  })
})

