import { describe, it, expect } from 'vitest';
import {
  validateCreateEmployee,
  validateUpdateEmployee,
} from '../employee-schemas';

describe('Employee Validation Schemas', () => {
  describe('validateCreateEmployee', () => {
    const validEmployee = {
      email: 'test@example.com',
      name: 'John Doe',
      password: 'SecurePass123!',
    };

    it('should validate a minimal valid employee', () => {
      const result = validateCreateEmployee(validEmployee);
      expect(result.success).toBe(true);
    });

    it('should validate a complete employee', () => {
      const result = validateCreateEmployee({
        ...validEmployee,
        phone: '0612345678',
        department: 'IT',
        position: 'Developer',
        employeeId: 'EMP001',
        startDate: '2024-01-15',
        contractType: 'FULLTIME',
        hoursPerWeek: 40,
        dateOfBirth: '1990-05-20',
        gender: 'MALE',
        nationality: 'Dutch',
        maritalStatus: 'SINGLE',
        address: 'Main Street 1',
        city: 'Amsterdam',
        postalCode: '1234 AB',
        bsnNumber: '123456782', // Valid BSN (passes 11-proof)
        bankAccountNumber: 'NL91ABNA0417164300',
        bankAccountName: 'J. Doe',
      });
      expect(result.success).toBe(true);
    });

    describe('email validation', () => {
      it('should reject invalid email format', () => {
        const result = validateCreateEmployee({
          ...validEmployee,
          email: 'invalid-email',
        });
        expect(result.success).toBe(false);
      });

      it('should reject missing email', () => {
        const { email, ...noEmail } = validEmployee;
        const result = validateCreateEmployee(noEmail);
        expect(result.success).toBe(false);
      });
    });

    describe('password validation', () => {
      it('should reject password without uppercase', () => {
        const result = validateCreateEmployee({
          ...validEmployee,
          password: 'securepass123!',
        });
        expect(result.success).toBe(false);
      });

      it('should reject password without lowercase', () => {
        const result = validateCreateEmployee({
          ...validEmployee,
          password: 'SECUREPASS123!',
        });
        expect(result.success).toBe(false);
      });

      it('should reject password without number', () => {
        const result = validateCreateEmployee({
          ...validEmployee,
          password: 'SecurePassWord!',
        });
        expect(result.success).toBe(false);
      });

      it('should reject password too short', () => {
        const result = validateCreateEmployee({
          ...validEmployee,
          password: 'Pass1!',
        });
        expect(result.success).toBe(false);
      });
    });

    describe('Dutch phone number validation', () => {
      it('should accept valid mobile number', () => {
        const result = validateCreateEmployee({
          ...validEmployee,
          phone: '0612345678',
        });
        expect(result.success).toBe(true);
      });

      it('should accept valid mobile with country code', () => {
        const result = validateCreateEmployee({
          ...validEmployee,
          phone: '+31612345678',
        });
        expect(result.success).toBe(true);
      });

      it('should reject invalid phone format', () => {
        const result = validateCreateEmployee({
          ...validEmployee,
          phone: '123456',
        });
        expect(result.success).toBe(false);
      });
    });

    describe('Dutch postal code validation', () => {
      it('should accept valid postal code with space', () => {
        const result = validateCreateEmployee({
          ...validEmployee,
          postalCode: '1234 AB',
        });
        expect(result.success).toBe(true);
      });

      it('should accept valid postal code without space', () => {
        const result = validateCreateEmployee({
          ...validEmployee,
          postalCode: '1234AB',
        });
        expect(result.success).toBe(true);
      });

      it('should reject invalid postal code', () => {
        const result = validateCreateEmployee({
          ...validEmployee,
          postalCode: '0234 AB',
        });
        expect(result.success).toBe(false);
      });
    });

    describe('BSN validation', () => {
      it('should accept valid BSN (passes 11-proof)', () => {
        // 123456782 passes the 11-proof: 1*9 + 2*8 + 3*7 + 4*6 + 5*5 + 6*4 + 7*3 + 8*2 + 2*-1 = 110 (divisible by 11)
        const result = validateCreateEmployee({
          ...validEmployee,
          bsnNumber: '123456782',
        });
        expect(result.success).toBe(true);
      });

      it('should reject BSN that fails 11-proof', () => {
        const result = validateCreateEmployee({
          ...validEmployee,
          bsnNumber: '123456789',
        });
        expect(result.success).toBe(false);
      });

      it('should reject BSN with wrong length', () => {
        const result = validateCreateEmployee({
          ...validEmployee,
          bsnNumber: '12345678',
        });
        expect(result.success).toBe(false);
      });
    });

    describe('IBAN validation', () => {
      it('should accept valid Dutch IBAN', () => {
        const result = validateCreateEmployee({
          ...validEmployee,
          bankAccountNumber: 'NL91ABNA0417164300',
        });
        expect(result.success).toBe(true);
      });

      it('should reject invalid IBAN format', () => {
        const result = validateCreateEmployee({
          ...validEmployee,
          bankAccountNumber: 'invalid-iban',
        });
        expect(result.success).toBe(false);
      });
    });

    describe('contract type validation', () => {
      it('should accept valid contract types', () => {
        const types = ['FULLTIME', 'PARTTIME', 'FLEX', 'TEMPORARY', 'INTERN'];
        for (const type of types) {
          const result = validateCreateEmployee({
            ...validEmployee,
            contractType: type,
          });
          expect(result.success).toBe(true);
        }
      });

      it('should reject invalid contract type', () => {
        const result = validateCreateEmployee({
          ...validEmployee,
          contractType: 'INVALID',
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('validateUpdateEmployee', () => {
    it('should allow partial updates', () => {
      const result = validateUpdateEmployee({
        name: 'Updated Name',
      });
      expect(result.success).toBe(true);
    });

    it('should validate phone when provided', () => {
      const validResult = validateUpdateEmployee({
        phone: '0612345678',
      });
      expect(validResult.success).toBe(true);

      const invalidResult = validateUpdateEmployee({
        phone: 'invalid',
      });
      expect(invalidResult.success).toBe(false);
    });

    it('should validate BSN when provided', () => {
      const validResult = validateUpdateEmployee({
        bsnNumber: '123456782',
      });
      expect(validResult.success).toBe(true);

      const invalidResult = validateUpdateEmployee({
        bsnNumber: '123456789',
      });
      expect(invalidResult.success).toBe(false);
    });
  });
});
