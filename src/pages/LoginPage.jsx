import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, Eye, EyeOff, ChevronRight, Zap, BarChart3, Bot, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { setToken } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { language, isRTL, t } = useApp();
  const { login } = useAuth();
  const isAr = language === 'ar';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/erm');
    } catch (err) {
      setError(err?.body?.error || err.message || (isAr ? 'فشل تسجيل الدخول' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/v1/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo login failed');

      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isDemo', 'true');
      window.location.href = '/erm';
    } catch (err) {
      setError(err.message);
    } finally {
      setDemoLoading(false);
    }
  };

  const features = [
    { icon: BarChart3, label: isAr ? 'إدارة المخاطر ISO 31000' : 'ISO 31000 Risk Management', color: '#06b6d4' },
    { icon: Zap,       label: isAr ? 'استمرارية الأعمال ISO 22301' : 'ISO 22301 Business Continuity', color: '#8b5cf6' },
    { icon: Bot,       label: isAr ? 'ذكاء اصطناعي متقدم' : 'Advanced AI Intelligence', color: '#f59e0b' },
    { icon: Globe,     label: isAr ? 'مؤشر صمود NDMO SUMOOD' : 'NDMO SUMOOD Resilience Index', color: '#10b981' },
  ];

  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'}
      style={{ background: 'linear-gradient(135deg, #020817, #0a1628, #0f172a)' }}>

      {/* Left/Right Panel — Features */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 py-12 relative overflow-hidden">
        {/* Ambient blobs */}
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.08), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 40px rgba(6,182,212,0.3)',
            }}>
              <Shield size={28} color="white" />
            </div>
            <div>
              <h1 style={{ color: 'white', fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Khalid Resilience</h1>
              <p style={{ color: '#06b6d4', fontSize: 10, fontWeight: 600, margin: 0, letterSpacing: 3, fontFamily: 'monospace', textTransform: 'uppercase' }}>
                Enterprise GRC Platform
              </p>
            </div>
          </div>

          <h2 style={{ color: '#e2e8f0', fontSize: 32, fontWeight: 700, lineHeight: 1.3, marginBottom: 16 }}>
            {isAr ? 'منصة الذكاء الاصطناعي\nلإدارة المخاطر والمرونة المؤسسية' : 'AI-Powered\nRisk & Resilience\nManagement Platform'}
          </h2>

          <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
            {isAr
              ? 'منصة متكاملة متوافقة مع المعايير السعودية والدولية — تحليل مخاطر ذكي، استمرارية أعمال، ومراقبة امتثال في الوقت الحقيقي.'
              : 'Comprehensive platform compliant with Saudi and international standards — AI risk analysis, business continuity, and real-time compliance monitoring.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: `${f.color}12`, border: `1px solid ${f.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <f.icon size={18} style={{ color: f.color }} />
                </div>
                <span style={{ color: '#cbd5e1', fontSize: 14, fontWeight: 500 }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right/Left Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:max-w-lg xl:max-w-xl"
        style={{ background: 'rgba(2,8,23,0.6)', borderLeft: isRTL ? 'none' : '1px solid #1e293b', borderRight: isRTL ? '1px solid #1e293b' : 'none' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px',
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 40px rgba(6,182,212,0.3)',
            }}>
              <Shield size={28} color="white" />
            </div>
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 800, margin: 0 }}>Khalid Resilience</h1>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>
              {isAr ? 'منصة الذكاء الاصطناعي لإدارة المخاطر' : 'AI-Powered Risk Management Platform'}
            </p>
          </div>

          <h2 className="hidden lg:block" style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
            {isAr ? 'مرحباً بك' : 'Welcome back'}
          </h2>
          <p className="hidden lg:block" style={{ color: '#64748b', fontSize: 13, marginBottom: 32 }}>
            {isAr ? 'سجل الدخول لحسابك أو جرب المنصة مباشرة' : 'Sign in to your account or try the platform instantly'}
          </p>

          {/* ── Demo Button — Hero CTA ── */}
          <button onClick={handleDemoLogin} disabled={demoLoading}
            style={{
              width: '100%', padding: '16px 24px', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              color: '#020817', fontWeight: 700, fontSize: 15, cursor: demoLoading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 4px 24px rgba(6,182,212,0.3), 0 0 60px rgba(6,182,212,0.08)',
              transition: 'all 0.3s', opacity: demoLoading ? 0.7 : 1,
              marginBottom: 12,
            }}>
            {demoLoading ? (
              <div style={{ width: 20, height: 20, border: '2px solid rgba(2,8,23,0.3)', borderTop: '2px solid #020817', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            ) : (
              <Sparkles size={20} />
            )}
            {isAr ? 'تجربة المنصة — دخول تجريبي فوري' : 'Try the Platform — Instant Demo Access'}
          </button>

          <p style={{ textAlign: 'center', color: '#475569', fontSize: 11, marginBottom: 28, lineHeight: 1.5 }}>
            {isAr
              ? 'دخول فوري بصلاحيات CISO — بيانات تجريبية واقعية — ذكاء اصطناعي مُفعّل'
              : 'Instant CISO access — Realistic demo data — AI enabled'}
          </p>

          {/* ── Divider ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: '#1e293b' }} />
            <span style={{ color: '#475569', fontSize: 11 }}>{isAr ? 'أو تسجيل دخول بحسابك' : 'or sign in with your account'}</span>
            <div style={{ flex: 1, height: 1, background: '#1e293b' }} />
          </div>

          {/* ── Login Form ── */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                {isAr ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="user@organization.sa" required
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 14,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid #1e293b',
                  color: '#e2e8f0', outline: 'none', transition: 'border 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#06b6d4'; }}
                onBlur={(e) => { e.target.style.borderColor = '#1e293b'; }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                {isAr ? 'كلمة المرور' : 'Password'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••" required
                  style={{
                    width: '100%', padding: '12px 16px', paddingLeft: isRTL ? 44 : 16, paddingRight: isRTL ? 16 : 44,
                    borderRadius: 12, fontSize: 14,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid #1e293b',
                    color: '#e2e8f0', outline: 'none', transition: 'border 0.2s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#06b6d4'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#1e293b'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                    [isRTL ? 'left' : 'right']: 14, background: 'none', border: 'none',
                    color: '#475569', cursor: 'pointer', padding: 0,
                  }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 16,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#ef4444', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '12px 24px', borderRadius: 12, border: '1px solid #1e293b',
                background: 'rgba(255,255,255,0.03)', color: '#e2e8f0', fontSize: 14,
                fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
                transition: 'all 0.2s', opacity: loading ? 0.6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              {loading
                ? (isAr ? 'جارٍ التحقق...' : 'Verifying...')
                : <>
                    {isAr ? 'تسجيل الدخول' : 'Sign In'}
                    <ChevronRight size={16} />
                  </>
              }
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {['ISO 31000', 'ISO 22301', 'NCA ECC', 'SAMA BCM', 'NDMO SUMOOD'].map((s) => (
                <span key={s} style={{
                  padding: '3px 8px', borderRadius: 6, fontSize: 9, fontWeight: 600,
                  background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)',
                  color: '#06b6d4', letterSpacing: 0.5,
                }}>{s}</span>
              ))}
            </div>
            <p style={{ color: '#334155', fontSize: 11 }}>
              © {new Date().getFullYear()} Khalid Resilience — Built for Saudi Vision 2030
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
