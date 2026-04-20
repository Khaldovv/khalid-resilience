import { useState } from 'react';
import { Shield, Smartphone, Key, Copy, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

const API_BASE = '/api/v1';

async function apiCall(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.error_en || 'Request failed');
  return data;
}

export default function MFASetup({ lang = 'ar', onBack }) {
  const isAr = lang === 'ar';
  const [step, setStep] = useState('idle'); // idle | setup | verify | done
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/auth/mfa/setup', { method: 'POST' });
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setStep('setup');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      setError(isAr ? 'أدخل الكود المكون من 6 أرقام' : 'Enter the 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiCall('/auth/mfa/verify', {
        method: 'POST',
        body: JSON.stringify({ token: verificationCode }),
      });
      setStep('done');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardStyle = {
    maxWidth: 520, margin: '0 auto', padding: 28, borderRadius: 20,
    background: 'linear-gradient(180deg, #0f172a, #020817)',
    border: '1px solid #1e293b',
    boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 40px rgba(6,182,212,0.06)',
    direction: isAr ? 'rtl' : 'ltr',
  };

  const btnPrimary = {
    padding: '12px 28px', borderRadius: 12, fontWeight: 700, fontSize: 14,
    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    border: '1px solid rgba(6,182,212,0.5)', color: '#020817',
    cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1,
    transition: 'all 0.2s', width: '100%',
    boxShadow: '0 4px 16px rgba(6,182,212,0.25)',
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px', borderRadius: 12, fontSize: 20,
    background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0',
    textAlign: 'center', letterSpacing: 8, fontFamily: 'monospace',
    outline: 'none', direction: 'ltr',
  };

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        {onBack && (
          <button onClick={onBack} style={{
            width: 36, height: 36, borderRadius: 10, border: '1px solid #334155',
            background: 'transparent', color: '#64748b', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ArrowLeft size={16} />
          </button>
        )}
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Shield size={22} style={{ color: '#06b6d4' }} />
        </div>
        <div>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: 0 }}>
            {isAr ? 'المصادقة الثنائية (MFA)' : 'Two-Factor Authentication (MFA)'}
          </h2>
          <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>
            {isAr ? 'حماية إضافية لحسابك وفق NCA ECC' : 'Extra protection per NCA ECC requirements'}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '10px 14px', borderRadius: 10, marginBottom: 16,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#ef4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Step: Idle */}
      {step === 'idle' && (
        <div>
          <div style={{
            padding: 20, borderRadius: 14, marginBottom: 20,
            background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Smartphone size={18} style={{ color: '#06b6d4' }} />
              <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>
                {isAr ? 'ما تحتاجه' : 'What you need'}
              </span>
            </div>
            <ul style={{ color: '#94a3b8', fontSize: 13, lineHeight: 2, margin: 0, paddingRight: isAr ? 20 : 0, paddingLeft: isAr ? 0 : 20 }}>
              <li>{isAr ? 'تطبيق Google Authenticator أو Microsoft Authenticator' : 'Google Authenticator or Microsoft Authenticator app'}</li>
              <li>{isAr ? 'هاتفك الذكي لمسح رمز QR' : 'Your smartphone to scan the QR code'}</li>
              <li>{isAr ? '30 ثانية من وقتك' : '30 seconds of your time'}</li>
            </ul>
          </div>
          <button onClick={startSetup} disabled={loading} style={btnPrimary}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Key size={16} />
              {loading
                ? (isAr ? 'جارٍ التجهيز...' : 'Setting up...')
                : (isAr ? 'بدء تفعيل MFA' : 'Start MFA Setup')
              }
            </span>
          </button>
        </div>
      )}

      {/* Step: Setup — QR Code */}
      {step === 'setup' && (
        <div>
          <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
            {isAr
              ? 'افتح تطبيق المصادقة على هاتفك وامسح رمز QR التالي:'
              : 'Open your authenticator app and scan this QR code:'}
          </p>

          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: 16,
            padding: 16, borderRadius: 14, background: 'white',
          }}>
            <img src={qrCode} alt="MFA QR Code" style={{ width: 200, height: 200 }} />
          </div>

          <details style={{ marginBottom: 20 }}>
            <summary style={{ color: '#64748b', fontSize: 12, cursor: 'pointer', marginBottom: 8 }}>
              {isAr ? 'لا تستطيع المسح؟ أدخل المفتاح يدوياً' : "Can't scan? Enter key manually"}
            </summary>
            <div style={{
              padding: '10px 14px', borderRadius: 8, background: '#0f172a',
              border: '1px solid #334155', fontFamily: 'monospace', fontSize: 13,
              color: '#22d3ee', wordBreak: 'break-all', direction: 'ltr',
            }}>
              {secret}
            </div>
          </details>

          <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 10 }}>
            {isAr ? 'أدخل الكود المكون من 6 أرقام من التطبيق:' : 'Enter the 6-digit code from the app:'}
          </p>

          <input
            type="text" maxLength={6} value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && verify()}
            placeholder="000000" style={inputStyle}
            autoFocus
          />

          <button onClick={verify} disabled={loading} style={{ ...btnPrimary, marginTop: 16 }}>
            {loading ? (isAr ? 'جارٍ التحقق...' : 'Verifying...') : (isAr ? 'تأكيد وتفعيل' : 'Verify & Enable')}
          </button>
        </div>
      )}

      {/* Step: Done — Backup Codes */}
      {step === 'done' && (
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
            padding: '14px 18px', borderRadius: 12,
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)',
          }}>
            <CheckCircle size={20} style={{ color: '#10b981' }} />
            <span style={{ color: '#10b981', fontSize: 15, fontWeight: 700 }}>
              {isAr ? 'تم تفعيل المصادقة الثنائية بنجاح!' : 'MFA Enabled Successfully!'}
            </span>
          </div>

          <div style={{
            padding: 18, borderRadius: 14, marginBottom: 16,
            background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#f59e0b', fontSize: 14, fontWeight: 700 }}>
                {isAr ? '⚠️ رموز الاحتياط — احفظها الآن!' : '⚠️ Backup Codes — Save them now!'}
              </span>
              <button onClick={copyBackupCodes} style={{
                padding: '6px 12px', borderRadius: 8, border: '1px solid #334155',
                background: copied ? 'rgba(16,185,129,0.1)' : 'transparent',
                color: copied ? '#10b981' : '#94a3b8', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {copied ? <><CheckCircle size={12} /> {isAr ? 'تم النسخ' : 'Copied'}</> : <><Copy size={12} /> {isAr ? 'نسخ' : 'Copy'}</>}
              </button>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 12, lineHeight: 1.6 }}>
              {isAr
                ? 'كل رمز يُستخدم مرة واحدة فقط. استخدمه عند فقدان الوصول لتطبيق المصادقة.'
                : 'Each code is single-use. Use when you lose access to your authenticator app.'}
            </p>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8,
              fontFamily: 'monospace', fontSize: 14, direction: 'ltr',
            }}>
              {backupCodes.map((code, i) => (
                <div key={i} style={{
                  padding: '8px 12px', borderRadius: 8, textAlign: 'center',
                  background: '#0f172a', border: '1px solid #1e293b', color: '#e2e8f0',
                }}>
                  {code}
                </div>
              ))}
            </div>
          </div>

          {onBack && (
            <button onClick={onBack} style={btnPrimary}>
              {isAr ? 'العودة للإعدادات' : 'Back to Settings'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
