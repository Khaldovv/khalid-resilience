const { validatePassword } = require('../../utils/passwordValidator');

describe('passwordValidator', () => {
  describe('validatePassword', () => {
    it('should accept strong passwords', () => {
      const result = validatePassword('MySecure@Pass123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject passwords shorter than 12 characters', () => {
      const result = validatePassword('Ab@1short');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('12'))).toBe(true);
    });

    it('should reject passwords without uppercase', () => {
      const result = validatePassword('mysecure@pass123');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('كبير') || e.includes('uppercase'))).toBe(true);
    });

    it('should reject passwords without lowercase', () => {
      const result = validatePassword('MYSECURE@PASS123');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('صغير') || e.includes('lowercase'))).toBe(true);
    });

    it('should reject passwords without numbers', () => {
      const result = validatePassword('MySecure@Password');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('رقم') || e.includes('number'))).toBe(true);
    });

    it('should reject passwords without special characters', () => {
      const result = validatePassword('MySecurePass123');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('رمز') || e.includes('special'))).toBe(true);
    });

    it('should collect all errors at once', () => {
      const result = validatePassword('abc');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should handle empty string', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
    });
  });
});
