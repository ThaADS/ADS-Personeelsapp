import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  checkDataRetention,
  dataRetentionPolicies,
  anonymizePersonalData,
} from '../compliance-service';

describe('Compliance Service', () => {
  describe('dataRetentionPolicies', () => {
    it('should have all required Dutch data retention policies', () => {
      expect(dataRetentionPolicies).toHaveLength(4);

      const policyTypes = dataRetentionPolicies.map((p) => p.dataType);
      expect(policyTypes).toContain('personeelsdossier');
      expect(policyTypes).toContain('salarisadministratie');
      expect(policyTypes).toContain('verzuimgegevens');
      expect(policyTypes).toContain('sollicitatiegegevens');
    });

    it('should have correct retention periods according to Dutch law', () => {
      const personeelsdossier = dataRetentionPolicies.find(
        (p) => p.dataType === 'personeelsdossier'
      );
      expect(personeelsdossier?.retentionPeriod).toBe(365 * 2); // 2 years

      const salarisadministratie = dataRetentionPolicies.find(
        (p) => p.dataType === 'salarisadministratie'
      );
      expect(salarisadministratie?.retentionPeriod).toBe(365 * 7); // 7 years

      const verzuimgegevens = dataRetentionPolicies.find(
        (p) => p.dataType === 'verzuimgegevens'
      );
      expect(verzuimgegevens?.retentionPeriod).toBe(365 * 2); // 2 years

      const sollicitatiegegevens = dataRetentionPolicies.find(
        (p) => p.dataType === 'sollicitatiegegevens'
      );
      expect(sollicitatiegegevens?.retentionPeriod).toBe(30); // 30 days
    });

    it('should have legal basis for each policy', () => {
      for (const policy of dataRetentionPolicies) {
        expect(policy.legalBasis).toBeDefined();
        expect(policy.legalBasis.length).toBeGreaterThan(0);
      }
    });
  });

  describe('checkDataRetention', () => {
    it('should return shouldDelete=false for recent data within retention period', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10); // 10 days ago

      const result = checkDataRetention('personeelsdossier', recentDate.toISOString());

      expect(result.shouldDelete).toBe(false);
      expect(result.daysRemaining).toBeGreaterThan(0);
      expect(result.policy).toBeDefined();
    });

    it('should return shouldDelete=true for data past retention period', () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 3); // 3 years ago

      const result = checkDataRetention('personeelsdossier', oldDate.toISOString());

      expect(result.shouldDelete).toBe(true);
      expect(result.daysRemaining).toBe(0);
    });

    it('should handle unknown data types gracefully', () => {
      const result = checkDataRetention('unknown_type', new Date().toISOString());

      expect(result.shouldDelete).toBe(false);
      expect(result.daysRemaining).toBe(-1);
      expect(result.policy).toBeUndefined();
    });

    it('should correctly calculate days remaining for sollicitatiegegevens', () => {
      const date = new Date();
      date.setDate(date.getDate() - 15); // 15 days ago

      const result = checkDataRetention('sollicitatiegegevens', date.toISOString());

      expect(result.shouldDelete).toBe(false);
      expect(result.daysRemaining).toBe(15); // 30 - 15 = 15 days remaining
    });

    it('should return shouldDelete=true for expired sollicitatiegegevens', () => {
      const date = new Date();
      date.setDate(date.getDate() - 35); // 35 days ago

      const result = checkDataRetention('sollicitatiegegevens', date.toISOString());

      expect(result.shouldDelete).toBe(true);
      expect(result.daysRemaining).toBe(0);
    });

    it('should handle edge case of exactly at retention period', () => {
      const date = new Date();
      date.setDate(date.getDate() - 30); // Exactly 30 days for sollicitatiegegevens

      const result = checkDataRetention('sollicitatiegegevens', date.toISOString());

      expect(result.shouldDelete).toBe(true);
    });
  });

  describe('anonymizePersonalData', () => {
    it('should anonymize email field correctly', () => {
      const data = { email: 'test@example.com', other: 'value' };
      const result = anonymizePersonalData(data);

      expect(result.email).toBe('geanonimiseerd@voorbeeld.nl');
      expect(result.other).toBe('value');
    });

    it('should anonymize phone field correctly', () => {
      const data = { phone: '0612345678' };
      const result = anonymizePersonalData(data);

      expect(result.phone).toBe('06-XXXXXXXX');
    });

    it('should anonymize bsn field correctly', () => {
      const data = { bsn: '123456789' };
      const result = anonymizePersonalData(data);

      expect(result.bsn).toBe('XXXXXXXXX');
    });

    it('should anonymize iban field correctly', () => {
      const data = { iban: 'NL91ABNA0417164300' };
      const result = anonymizePersonalData(data);

      expect(result.iban).toBe('NL00XXXX0000000000');
    });

    it('should anonymize name fields correctly', () => {
      const data = {
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
      };
      const result = anonymizePersonalData(data);

      expect(result.name).toBe('Geanonimiseerd');
      expect(result.firstName).toBe('Geanonimiseerd');
      expect(result.lastName).toBe('Geanonimiseerd');
    });

    it('should anonymize address fields correctly', () => {
      const data = {
        address: 'Main Street 123',
        postalCode: '1234 AB',
        city: 'Amsterdam',
      };
      const result = anonymizePersonalData(data);

      expect(result.address).toBe('Geanonimiseerd');
      expect(result.postalCode).toBe('Geanonimiseerd');
      expect(result.city).toBe('Geanonimiseerd');
    });

    it('should not modify fields not in the anonymization list', () => {
      const data = {
        id: '12345',
        status: 'active',
        department: 'IT',
      };
      const result = anonymizePersonalData(data);

      expect(result.id).toBe('12345');
      expect(result.status).toBe('active');
      expect(result.department).toBe('IT');
    });

    it('should handle empty object', () => {
      const data = {};
      const result = anonymizePersonalData(data);

      expect(result).toEqual({});
    });

    it('should handle mixed data types', () => {
      const data = {
        name: 'John',
        age: 30,
        isActive: true,
        email: 'john@example.com',
      };
      const result = anonymizePersonalData(data);

      expect(result.name).toBe('Geanonimiseerd');
      expect(result.age).toBe(30);
      expect(result.isActive).toBe(true);
      expect(result.email).toBe('geanonimiseerd@voorbeeld.nl');
    });

    it('should not mutate the original object', () => {
      const data = { name: 'John', email: 'john@example.com' };
      const original = { ...data };
      anonymizePersonalData(data);

      expect(data).toEqual(original);
    });
  });

  describe('API functions', () => {
    let mockFetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockFetch = vi.fn();
      global.fetch = mockFetch;
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    // Note: The API functions (recordConsent, fetchConsents, etc.) make actual fetch calls
    // Testing them properly requires mocking fetch or using MSW
    // These tests verify the functions exist and have the correct signature

    it('should have recordConsent function available', async () => {
      const { recordConsent } = await import('../compliance-service');
      expect(typeof recordConsent).toBe('function');
    });

    it('should have fetchConsents function available', async () => {
      const { fetchConsents } = await import('../compliance-service');
      expect(typeof fetchConsents).toBe('function');
    });

    it('should have submitDataAccessRequest function available', async () => {
      const { submitDataAccessRequest } = await import('../compliance-service');
      expect(typeof submitDataAccessRequest).toBe('function');
    });

    it('should have reportDataBreach function available', async () => {
      const { reportDataBreach } = await import('../compliance-service');
      expect(typeof reportDataBreach).toBe('function');
    });

    it('should have performLaborLawCheck function available', async () => {
      const { performLaborLawCheck } = await import('../compliance-service');
      expect(typeof performLaborLawCheck).toBe('function');
    });

    it('should have checkWorkingTimeCompliance function available', async () => {
      const { checkWorkingTimeCompliance } = await import('../compliance-service');
      expect(typeof checkWorkingTimeCompliance).toBe('function');
    });

    it('should have generatePrivacyStatement function available', async () => {
      const { generatePrivacyStatement } = await import('../compliance-service');
      expect(typeof generatePrivacyStatement).toBe('function');
    });
  });
});
