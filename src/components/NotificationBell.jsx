import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, X, AlertTriangle, Shield, FileText, Users } from 'lucide-react';

const API_BASE = '/api/v1';

const TYPE_ICONS = {
  RISK_ESCALATED: AlertTriangle,
  INCIDENT_P1: AlertTriangle,
  BCP_ACTIVATED: Shield,
  APPROVAL_REQUIRED: FileText,
  SYSTEM: Users,
};

const TYPE_COLORS = {
  RISK_ESCALATED: '#ef4444',
  INCIDENT_P1: '#f97316',
  BCP_ACTIVATED: '#eab308',
  APPROVAL_REQUIRED: '#06b6d4',
  SYSTEM: '#8b5cf6',
};

export default function NotificationBell({ lang = 'ar' }) {
  const isAr = lang === 'ar';
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/notifications?limit=15`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || data || []);
        setUnreadCount(Array.isArray(data.notifications || data)
          ? (data.notifications || data).filter(n => !n.is_read).length
          : 0
        );
      }
    } catch {
      // API may not be available — use fallback empty
    }
  };

  // Poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silently fail */ }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* silently fail */ }
    setLoading(false);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return isAr ? 'الآن' : 'Just now';
    if (mins < 60) return isAr ? `منذ ${mins} دقيقة` : `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return isAr ? `منذ ${hours} ساعة` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return isAr ? `منذ ${days} يوم` : `${days}d ago`;
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative', width: 38, height: 38, borderRadius: 10,
          border: '1px solid #334155', background: open ? 'rgba(6,182,212,0.1)' : 'transparent',
          color: open ? '#22d3ee' : '#64748b', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6,182,212,0.08)'; e.currentTarget.style.color = '#22d3ee'; }}
        onMouseLeave={(e) => { if (!open) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; } }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: unreadCount > 9 ? 22 : 18, height: 18, borderRadius: 9,
            background: '#ef4444', color: 'white', fontSize: 10, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #0f172a',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 46, [isAr ? 'left' : 'right']: 0,
          width: 360, maxHeight: 460, borderRadius: 16, overflow: 'hidden',
          background: 'linear-gradient(180deg, #0f172a, #020817)',
          border: '1px solid #1e293b',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(6,182,212,0.06)',
          zIndex: 9999, animation: 'fadeIn 0.2s ease',
          direction: isAr ? 'rtl' : 'ltr',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid #1e293b',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(6,182,212,0.04)',
          }}>
            <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>
              {isAr ? 'الإشعارات' : 'Notifications'}
              {unreadCount > 0 && (
                <span style={{
                  marginRight: isAr ? 8 : 0, marginLeft: isAr ? 0 : 8,
                  padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                }}>
                  {unreadCount}
                </span>
              )}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} disabled={loading} title={isAr ? 'قراءة الكل' : 'Mark all read'}
                  style={{
                    width: 30, height: 30, borderRadius: 8, border: '1px solid #334155',
                    background: 'transparent', color: '#06b6d4', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  <CheckCheck size={14} />
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{
                width: 30, height: 30, borderRadius: 8, border: '1px solid #334155',
                background: 'transparent', color: '#64748b', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: 40, textAlign: 'center', color: '#475569', fontSize: 13,
              }}>
                <Bell size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                <div>{isAr ? 'لا توجد إشعارات' : 'No notifications'}</div>
              </div>
            ) : (
              notifications.map((notif) => {
                const Icon = TYPE_ICONS[notif.type] || Bell;
                const color = TYPE_COLORS[notif.type] || '#64748b';
                return (
                  <div key={notif.id} onClick={() => !notif.is_read && markAsRead(notif.id)}
                    style={{
                      padding: '12px 18px', borderBottom: '1px solid #0f172a',
                      display: 'flex', gap: 12,
                      background: notif.is_read ? 'transparent' : 'rgba(6,182,212,0.03)',
                      cursor: notif.is_read ? 'default' : 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6,182,212,0.06)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = notif.is_read ? 'transparent' : 'rgba(6,182,212,0.03)'; }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: `${color}15`, border: `1px solid ${color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: notif.is_read ? 500 : 700,
                        color: notif.is_read ? '#94a3b8' : '#e2e8f0',
                        marginBottom: 3,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {notif.title}
                      </div>
                      {notif.message && (
                        <div style={{
                          fontSize: 11, color: '#64748b', lineHeight: 1.5,
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        }}>
                          {notif.message}
                        </div>
                      )}
                      <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>
                        {formatTime(notif.created_at)}
                      </div>
                    </div>
                    {!notif.is_read && (
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: '#06b6d4', flexShrink: 0, alignSelf: 'center',
                      }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
