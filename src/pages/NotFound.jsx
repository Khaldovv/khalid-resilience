import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { language, isRTL } = useApp();
  const isAr = language === 'ar';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #020817, #0a1628)', direction: isRTL ? 'rtl' : 'ltr',
    }}>
      <div style={{ position: 'absolute', top: '30%', left: '40%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.05), transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24, margin: '0 auto 24px',
          background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Shield size={36} style={{ color: '#06b6d4', opacity: 0.5 }} />
        </div>

        <div style={{ color: '#06b6d4', fontSize: 72, fontWeight: 800, letterSpacing: -2, marginBottom: 8, fontFamily: 'monospace' }}>
          404
        </div>

        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          {isAr ? 'الصفحة غير موجودة' : 'Page Not Found'}
        </h1>

        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.6 }}>
          {isAr
            ? 'الصفحة التي تبحث عنها غير متاحة أو تم نقلها. تأكد من صحة الرابط.'
            : 'The page you are looking for does not exist or has been moved. Please check the URL.'}
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => navigate(-1)}
            style={{
              padding: '12px 24px', borderRadius: 12, border: '1px solid #1e293b',
              background: 'rgba(255,255,255,0.03)', color: '#94a3b8', fontSize: 14,
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s',
            }}>
            <ArrowLeft size={16} />
            {isAr ? 'رجوع' : 'Go Back'}
          </button>

          <button onClick={() => navigate('/erm')}
            style={{
              padding: '12px 24px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              color: '#020817', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 20px rgba(6,182,212,0.3)',
              transition: 'all 0.2s',
            }}>
            <Home size={16} />
            {isAr ? 'الصفحة الرئيسية' : 'Go Home'}
          </button>
        </div>
      </div>
    </div>
  );
}
