/**
 * Password Policy Enforcement — NCA ECC compliant.
 * Rules: ≥12 characters, uppercase, lowercase, digit, special character.
 */

const RULES = [
  { test: (p) => p.length >= 12, msg_ar: 'يجب 12 حرف على الأقل', msg_en: 'Minimum 12 characters required' },
  { test: (p) => /[A-Z]/.test(p), msg_ar: 'يجب حرف كبير واحد على الأقل', msg_en: 'At least one uppercase letter required' },
  { test: (p) => /[a-z]/.test(p), msg_ar: 'يجب حرف صغير واحد على الأقل', msg_en: 'At least one lowercase letter required' },
  { test: (p) => /[0-9]/.test(p), msg_ar: 'يجب رقم واحد على الأقل', msg_en: 'At least one digit required' },
  { test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p), msg_ar: 'يجب رمز خاص واحد على الأقل', msg_en: 'At least one special character required' },
];

/**
 * Validate a password against security policy.
 * @param {string} password
 * @returns {{ valid: boolean, errors: string[], errors_en: string[] }}
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['كلمة المرور مطلوبة'], errors_en: ['Password is required'] };
  }

  const errors = [];
  const errors_en = [];

  for (const rule of RULES) {
    if (!rule.test(password)) {
      errors.push(rule.msg_ar);
      errors_en.push(rule.msg_en);
    }
  }

  return { valid: errors.length === 0, errors, errors_en };
}

module.exports = { validatePassword };
