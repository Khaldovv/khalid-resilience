const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { 
  getUserNotifications, getUnreadCount, markAsRead, markAllAsRead 
} = require('../services/notificationService');

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get current user's notifications
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: unreadOnly
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Notification list with unread count
 * /notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get unread notification count
 *     responses:
 *       200:
 *         description: Unread count
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark single notification as read
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Notification marked as read
 * /notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */

// GET /api/v1/notifications — Get current user's notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const { limit = 20, unreadOnly = false } = req.query;
    const notifications = await getUserNotifications(req.user.id, {
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true',
    });
    const unreadCount = await getUnreadCount(req.user.id);
    
    res.json({ data: notifications, unreadCount });
  } catch (err) {
    console.error('[Notifications GET /] Error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// GET /api/v1/notifications/unread-count — Get unread count only
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const count = await getUnreadCount(req.user.id);
    res.json({ unreadCount: count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get unread count.' });
  }
});

// PATCH /api/v1/notifications/:id/read — Mark single notification as read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    await markAsRead(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read.' });
  }
});

// PATCH /api/v1/notifications/read-all — Mark all as read
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    const updated = await markAllAsRead(req.user.id);
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read.' });
  }
});

module.exports = router;
