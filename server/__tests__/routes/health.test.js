const request = require('supertest');

// Mock app for testing — only tests health routes since they don't need auth
const express = require('express');
const app = express();

// Load health routes
const healthRoutes = require('../../routes/health');
app.use('/api', healthRoutes);

describe('Health Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('version');
    });

    it('should return valid ISO timestamp', async () => {
      const res = await request(app).get('/api/health');
      const date = new Date(res.body.timestamp);
      expect(date.getTime()).not.toBeNaN();
    });
  });
});
