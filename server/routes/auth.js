const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/database');
const { secret, expiry } = require('../config/auth');
const authenticate = require('../middleware/authenticate');
const { validatePassword } = require('../utils/passwordValidator');

const router = express.Router();

// ── Role → Permissions mapping ─────────────────────────────────────────────────
const ROLE_PERMISSIONS = {
  ADMIN:          ['*'],
  CRO:            ['MANAGE_RISKS', 'VIEW_RISKS', 'MANAGE_BIA', 'VIEW_BIA', 'MANAGE_SUMOOD', 'VIEW_SUMOOD', 'VIEW_REPORTS', 'EXPORT_REPORTS', 'VIEW_VENDORS', 'MANAGE_VENDORS', 'VIEW_INCIDENTS', 'MANAGE_INCIDENTS', 'VIEW_REGULATORY', 'MANAGE_REGULATORY'],
  CISO:           ['MANAGE_RISKS', 'VIEW_RISKS', 'APPROVE_BIA', 'MANAGE_BIA', 'VIEW_BIA', 'MANAGE_SUMOOD', 'VIEW_SUMOOD', 'VIEW_REPORTS', 'EXPORT_REPORTS', 'VIEW_VENDORS', 'MANAGE_VENDORS', 'VIEW_INCIDENTS', 'MANAGE_INCIDENTS', 'VIEW_REGULATORY', 'MANAGE_REGULATORY'],
  CEO:            ['APPROVE_BIA', 'VIEW_RISKS', 'VIEW_BIA', 'VIEW_SUMOOD', 'VIEW_REPORTS', 'EXPORT_REPORTS', 'VIEW_VENDORS', 'VIEW_INCIDENTS', 'VIEW_REGULATORY'],
  DEPT_HEAD:      ['MANAGE_RISKS', 'VIEW_RISKS', 'MANAGE_BIA', 'VIEW_BIA', 'MANAGE_SUMOOD', 'VIEW_SUMOOD', 'APPROVE_BIA', 'VIEW_VENDORS', 'VIEW_INCIDENTS', 'VIEW_REGULATORY'],
  BC_COORDINATOR: ['MANAGE_BIA', 'VIEW_BIA', 'APPROVE_BIA', 'VIEW_RISKS', 'VIEW_SUMOOD', 'VIEW_REPORTS', 'EXPORT_REPORTS', 'VIEW_VENDORS', 'VIEW_INCIDENTS', 'VIEW_REGULATORY'],
  ANALYST:        ['MANAGE_RISKS', 'VIEW_RISKS', 'VIEW_BIA', 'MANAGE_SUMOOD', 'VIEW_SUMOOD', 'VIEW_VENDORS', 'MANAGE_VENDORS', 'VIEW_INCIDENTS', 'MANAGE_INCIDENTS'],
  VIEWER:         ['VIEW_RISKS', 'VIEW_BIA', 'VIEW_SUMOOD'],
};

function getPermissions(role) {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.VIEWER;
}

/** Generate a short-lived temp token for MFA challenge (5 min TTL). */
function generateTempToken(userId) {
  return jwt.sign({ id: userId, type: 'mfa_challenge' }, secret, { expiresIn: '5m' });
}

/** Generate full JWT for an authenticated user. */
function generateFullToken(user) {
  const permissions = getPermissions(user.role);
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
      full_name: user.full_name_en,
      permissions,
    },
    secret,
    { expiresIn: expiry }
  );
}

/** Sanitize user object for response (no secrets). */
function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    full_name_ar: user.full_name_ar,
    full_name_en: user.full_name_en,
    role: user.role,
    department_id: user.department_id,
    mfa_enabled: user.mfa_enabled || false,
    permissions: getPermissions(user.role),
  };
}

// ── Account Lockout Middleware ──────────────────────────────────────────────────
async function checkAccountLockout(req, res, next) {
  if (!req.body.email) return next();

  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const failedAttempts = await db('failed_logins')
      .where('email', req.body.email)
      .where('created_at', '>', oneHourAgo)
      .count('id as c')
      .first();

    if (parseInt(failedAttempts?.c || 0) >= 10) {
      return res.status(429).json({
        error: 'الحساب مقفل لمدة ساعة بسبب محاولات متعددة فاشلة',
        error_en: 'Account locked for 1 hour due to multiple failed attempts',
      });
    }
  } catch {
    // Table may not exist yet — allow through
  }
  next();
}

/** Log a failed login attempt. */
async function logFailedAttempt(email, ip) {
  try {
    await db('failed_logins').insert({
      email,
      ip_address: ip,
    });
  } catch {
    // Table may not exist yet — silently continue
  }
}

// ── POST /api/v1/auth/login ────────────────────────────────────────────────────
/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Authenticate user and return JWT
 *     description: "Supports optional MFA. If MFA is enabled, first call returns requiresMfa with a temporary token. Second call with mfa_token returns full JWT."
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "admin@grc.sa" }
 *               password: { type: string, example: "Admin@2026" }
 *               mfa_token: { type: string, description: "6-digit TOTP code (required if MFA enabled)" }
 *     responses:
 *       200:
 *         description: Login successful or MFA challenge
 *       401:
 *         description: Invalid credentials or MFA code
 *       429:
 *         description: Account locked or rate limited
 */
router.post('/login', checkAccountLockout, async (req, res, next) => {
  try {
    const { email, password, mfa_token } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await db('users').where({ email, is_active: true }).first();
    if (!user) {
      await logFailedAttempt(email, req.ip);
      return res.status(401).json({ error: 'بيانات غير صحيحة', error_en: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      await logFailedAttempt(email, req.ip);
      return res.status(401).json({ error: 'بيانات غير صحيحة', error_en: 'Invalid credentials.' });
    }

    // ── MFA Check ─────────────────────────────────────────────────────────────
    if (user.mfa_enabled) {
      if (!mfa_token) {
        // Step 1: Password correct, but MFA required — return temp token
        return res.json({
          requiresMfa: true,
          tempToken: generateTempToken(user.id),
          message: 'أدخل رمز المصادقة الثنائية',
          message_en: 'Enter your MFA verification code',
        });
      }

      // Step 2: Verify MFA token
      const speakeasy = require('speakeasy');
      const verified = speakeasy.totp.verify({
        secret: user.mfa_secret,
        encoding: 'base32',
        token: mfa_token,
        window: 2,
      });

      if (!verified) {
        // Check backup codes
        const backupCodes = user.mfa_backup_codes || [];
        const backupIndex = backupCodes.indexOf(mfa_token.toUpperCase());
        if (backupIndex === -1) {
          await logFailedAttempt(email, req.ip);
          return res.status(401).json({
            error: 'رمز MFA غير صحيح',
            error_en: 'Invalid MFA code',
          });
        }
        // Consume backup code (one-time use)
        backupCodes.splice(backupIndex, 1);
        await db('users').where('id', user.id).update({ mfa_backup_codes: backupCodes });
      }
    }

    // ── Issue Full JWT ────────────────────────────────────────────────────────
    const token = generateFullToken(user);

    // Log successful login to audit
    await db('audit_log').insert({
      user_id: user.id,
      action: 'AUTH_LOGIN',
      entity_type: 'auth',
      entity_id: user.id,
      details: JSON.stringify({ email: user.email, role: user.role, mfa: user.mfa_enabled || false }),
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/v1/auth/mfa/setup ────────────────────────────────────────────────
/**
 * @swagger
 * /auth/mfa/setup:
 *   post:
 *     tags: [Authentication]
 *     summary: Generate MFA secret and QR code
 *     description: Generates a TOTP secret, QR code for authenticator apps, and 10 single-use backup codes
 *     responses:
 *       200:
 *         description: QR code and backup codes returned
 */
router.post('/mfa/setup', authenticate, async (req, res, next) => {
  try {
    const speakeasy = require('speakeasy');
    const QRCode = require('qrcode');

    const user = await db('users').where('id', req.user.id).first();
    if (user.mfa_enabled) {
      return res.status(400).json({
        error: 'المصادقة الثنائية مفعلة بالفعل',
        error_en: 'MFA is already enabled',
      });
    }

    const mfaSecret = speakeasy.generateSecret({
      name: `JAHIZIA (${user.email})`,
      issuer: 'JAHIZIA GRC',
    });

    // Save secret (not yet enabled)
    await db('users').where('id', req.user.id).update({
      mfa_secret: mfaSecret.base32,
    });

    const qrCode = await QRCode.toDataURL(mfaSecret.otpauth_url);

    // Generate 10 backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    await db('users').where('id', req.user.id).update({
      mfa_backup_codes: backupCodes,
    });

    res.json({
      qrCode,
      secret: mfaSecret.base32,
      backupCodes,
      message: 'امسح رمز QR بتطبيق Google Authenticator أو أي تطبيق TOTP',
      message_en: 'Scan the QR code with Google Authenticator or any TOTP app',
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/v1/auth/mfa/verify ───────────────────────────────────────────────
/**
 * @swagger
 * /auth/mfa/verify:
 *   post:
 *     tags: [Authentication]
 *     summary: Verify MFA code and enable MFA
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string, description: "6-digit TOTP code from authenticator app" }
 *     responses:
 *       200:
 *         description: MFA enabled successfully
 *       400:
 *         description: Invalid code
 */
router.post('/mfa/verify', authenticate, async (req, res, next) => {
  try {
    const speakeasy = require('speakeasy');
    const user = await db('users').where('id', req.user.id).first();

    if (!user.mfa_secret) {
      return res.status(400).json({
        error: 'لم يتم إعداد MFA. ابدأ بطلب /mfa/setup أولاً',
        error_en: 'MFA not set up. Call /mfa/setup first.',
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token: req.body.token,
      window: 2,
    });

    if (!verified) {
      return res.status(400).json({
        error: 'رمز غير صحيح. تأكد من الوقت الصحيح على جهازك.',
        error_en: 'Invalid code. Ensure your device time is correct.',
      });
    }

    await db('users').where('id', req.user.id).update({
      mfa_enabled: true,
      mfa_enabled_at: new Date(),
    });

    // Audit log
    await db('audit_log').insert({
      user_id: req.user.id,
      action: 'MFA_ENABLED',
      entity_type: 'user',
      entity_id: req.user.id,
      details: JSON.stringify({ email: user.email }),
      ip_address: req.ip,
    });

    res.json({
      success: true,
      message: 'تم تفعيل المصادقة الثنائية بنجاح',
      message_en: 'MFA enabled successfully',
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/v1/auth/mfa/disable ──────────────────────────────────────────────
/**
 * @swagger
 * /auth/mfa/disable:
 *   post:
 *     tags: [Authentication]
 *     summary: Disable MFA (requires current password)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: MFA disabled
 */
router.post('/mfa/disable', authenticate, async (req, res, next) => {
  try {
    const user = await db('users').where('id', req.user.id).first();
    if (!user.mfa_enabled) {
      return res.status(400).json({ error: 'MFA ليست مفعلة', error_en: 'MFA is not enabled' });
    }

    const valid = await bcrypt.compare(req.body.password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'كلمة مرور غير صحيحة', error_en: 'Invalid password' });
    }

    await db('users').where('id', req.user.id).update({
      mfa_enabled: false,
      mfa_secret: null,
      mfa_backup_codes: null,
      mfa_enabled_at: null,
    });

    await db('audit_log').insert({
      user_id: req.user.id,
      action: 'MFA_DISABLED',
      entity_type: 'user',
      entity_id: req.user.id,
      details: JSON.stringify({ email: user.email }),
      ip_address: req.ip,
    });

    res.json({ success: true, message: 'تم تعطيل MFA', message_en: 'MFA disabled' });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/v1/auth/refresh ──────────────────────────────────────────────────
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh JWT token
 *     responses:
 *       200:
 *         description: New token issued
 */
router.post('/refresh', authenticate, async (req, res, next) => {
  try {
    const user = await db('users').where({ id: req.user.id, is_active: true }).first();
    if (!user) return res.status(401).json({ error: 'User not found or inactive.' });

    const token = generateFullToken(user);
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/v1/auth/me ────────────────────────────────────────────────────────
/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user profile
 *     responses:
 *       200:
 *         description: Current user info
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await db('users')
      .select('id', 'email', 'full_name_ar', 'full_name_en', 'role', 'department_id', 'is_active', 'mfa_enabled', 'created_at')
      .where({ id: req.user.id })
      .first();

    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({ ...user, permissions: getPermissions(user.role) });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/v1/auth/change-password ──────────────────────────────────────────
/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Change password with policy enforcement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [current_password, new_password]
 *             properties:
 *               current_password: { type: string }
 *               new_password: { type: string }
 *     responses:
 *       200:
 *         description: Password changed
 *       400:
 *         description: Password does not meet policy
 */
router.post('/change-password', authenticate, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'كلمة المرور الحالية والجديدة مطلوبتان' });
    }

    const user = await db('users').where('id', req.user.id).first();
    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'كلمة المرور الحالية غير صحيحة', error_en: 'Current password is incorrect' });
    }

    // Enforce password policy
    const validation = validatePassword(new_password);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'كلمة المرور الجديدة لا تستوفي المتطلبات',
        error_en: 'New password does not meet policy requirements',
        details: validation.errors,
        details_en: validation.errors_en,
      });
    }

    const hash = await bcrypt.hash(new_password, 12);
    await db('users').where('id', req.user.id).update({ password_hash: hash });

    await db('audit_log').insert({
      user_id: req.user.id,
      action: 'PASSWORD_CHANGED',
      entity_type: 'user',
      entity_id: req.user.id,
      ip_address: req.ip,
    });

    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح', message_en: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/v1/auth/demo-login ───────────────────────────────────────────────
/**
 * @swagger
 * /auth/demo-login:
 *   post:
 *     tags: [Authentication]
 *     summary: One-click demo login (no credentials required)
 *     security: []
 *     responses:
 *       200:
 *         description: Demo JWT and user info
 */
router.post('/demo-login', async (req, res, next) => {
  try {
    let demoUser = await db('users').where('email', 'demo@khalidresilience.com').first();

    if (!demoUser) {
      // Auto-create demo user if missing
      const hashedPassword = await bcrypt.hash('DemoUser2026!', 12);
      // Look up first department UUID (departments use UUID primary keys)
      const firstDept = await db('departments').select('id').first();
      [demoUser] = await db('users').insert({
        email: 'demo@khalidresilience.com',
        password_hash: hashedPassword,
        full_name_ar: 'مستخدم تجريبي',
        full_name_en: 'Demo User',
        role: 'CISO',
        department_id: firstDept ? firstDept.id : null,
        is_active: true,
      }).returning('*');
    }

    const permissions = getPermissions('CISO');
    const token = jwt.sign(
      {
        id: demoUser.id,
        email: demoUser.email,
        role: demoUser.role,
        department_id: demoUser.department_id,
        full_name: demoUser.full_name_en,
        permissions,
        isDemo: true,
      },
      secret,
      { expiresIn: '24h' }
    );

    // Audit
    try {
      await db('audit_log').insert({
        user_id: demoUser.id,
        action: 'DEMO_LOGIN',
        entity_type: 'auth',
        entity_id: demoUser.id,
        details: JSON.stringify({ source: 'demo-button' }),
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });
    } catch { /* audit table may not exist */ }

    res.json({
      token,
      user: {
        ...sanitizeUser(demoUser),
        isDemo: true,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

