const db = require('../config/database');
const logger = require('../config/logger');

// ─── Notification Types ──────────────────────────────────────────────────────
const NOTIFICATION_TYPES = {
  RISK_ESCALATED: 'RISK_ESCALATED',
  INCIDENT_P1: 'INCIDENT_P1',
  DEADLINE_APPROACHING: 'DEADLINE_APPROACHING',
  BCP_ACTIVATED: 'BCP_ACTIVATED',
  APPROVAL_REQUIRED: 'APPROVAL_REQUIRED',
  BIA_UPDATED: 'BIA_UPDATED',
  AI_COST_THRESHOLD: 'AI_COST_THRESHOLD',
  SYSTEM_ALERT: 'SYSTEM_ALERT',
};

// ─── Create Notification ─────────────────────────────────────────────────────
async function notify(userId, options) {
  try {
    const [notification] = await db('notifications').insert({
      user_id: userId,
      type: options.type,
      title: options.title,
      message: options.message || '',
      link: options.link || null,
      metadata: JSON.stringify(options.metadata || {}),
    }).returning('*');
    
    logger.info('Notification created', { 
      notificationId: notification.id, 
      userId, 
      type: options.type 
    });
    
    return notification;
  } catch (err) {
    logger.error('Failed to create notification', { error: err.message, userId, options });
    return null;
  }
}

// ─── Notify Multiple Users ───────────────────────────────────────────────────
async function notifyMany(userIds, options) {
  const results = await Promise.allSettled(
    userIds.map(uid => notify(uid, options))
  );
  return results.filter(r => r.status === 'fulfilled').map(r => r.value);
}

// ─── Notify Users by Role ────────────────────────────────────────────────────
async function notifyByRole(role, options) {
  try {
    const users = await db('users').where('role', role).select('id');
    return notifyMany(users.map(u => u.id), options);
  } catch (err) {
    logger.error('Failed to notify by role', { error: err.message, role });
    return [];
  }
}

// ─── Get User Notifications ──────────────────────────────────────────────────
async function getUserNotifications(userId, { limit = 20, unreadOnly = false } = {}) {
  let query = db('notifications')
    .where('user_id', userId)
    .orderBy('created_at', 'desc')
    .limit(limit);
  
  if (unreadOnly) query = query.where('is_read', false);
  
  return query;
}

// ─── Get Unread Count ────────────────────────────────────────────────────────
async function getUnreadCount(userId) {
  const [{ count }] = await db('notifications')
    .where({ user_id: userId, is_read: false })
    .count('id as count');
  return parseInt(count);
}

// ─── Mark as Read ────────────────────────────────────────────────────────────
async function markAsRead(notificationId, userId) {
  return db('notifications')
    .where({ id: notificationId, user_id: userId })
    .update({ is_read: true, read_at: db.fn.now() });
}

// ─── Mark All as Read ────────────────────────────────────────────────────────
async function markAllAsRead(userId) {
  return db('notifications')
    .where({ user_id: userId, is_read: false })
    .update({ is_read: true, read_at: db.fn.now() });
}

// ─── Trigger Helpers (used by other services) ────────────────────────────────

async function onRiskEscalated(risk) {
  return notifyByRole('CRO', {
    type: NOTIFICATION_TYPES.RISK_ESCALATED,
    title: `تم تصعيد خطر: ${risk.risk_name}`,
    message: `مستوى الخطورة: ${risk.severity_level}`,
    link: `/erm#risks/${risk.id}`,
    metadata: { riskId: risk.id, severity: risk.severity_level },
  });
}

async function onIncidentP1(incident) {
  return notifyByRole('CISO', {
    type: NOTIFICATION_TYPES.INCIDENT_P1,
    title: `حادث أولوية عالية: ${incident.title}`,
    message: `النوع: ${incident.type} — الأثر: ${incident.impact_level}`,
    link: `/incidents/${incident.id}`,
    metadata: { incidentId: incident.id, priority: incident.priority },
  });
}

async function onBCPActivated(plan, activatedBy) {
  return notifyByRole('CEO', {
    type: NOTIFICATION_TYPES.BCP_ACTIVATED,
    title: `تم تفعيل خطة BCP: ${plan.id}`,
    message: `السيناريو: ${plan.disruption_scenario}`,
    link: `/erm#bia`,
    metadata: { bcpId: plan.id, activatedBy },
  });
}

async function onApprovalRequired(entityType, entityId, title, approverRole) {
  return notifyByRole(approverRole, {
    type: NOTIFICATION_TYPES.APPROVAL_REQUIRED,
    title: `مطلوب اعتماد: ${title}`,
    message: `يتطلب ${entityType} اعتمادك`,
    link: entityType === 'BCP' ? `/erm#bia` : `/erm#${entityType.toLowerCase()}`,
    metadata: { entityType, entityId },
  });
}

module.exports = {
  NOTIFICATION_TYPES,
  notify,
  notifyMany,
  notifyByRole,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  onRiskEscalated,
  onIncidentP1,
  onBCPActivated,
  onApprovalRequired,
};
