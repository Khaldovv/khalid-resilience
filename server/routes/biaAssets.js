const express = require('express');
const svc = require('../services/biaAssetService');

const router = express.Router();

// ── List / Search assets ────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const assets = await svc.listAssets(req.query);
    res.json({ ok: true, data: assets });
  } catch (err) { next(err); }
});

// ── Dashboard stats ─────────────────────────────────────────────────────────
router.get('/dashboard', async (_req, res, next) => {
  try {
    const stats = await svc.getDashboardStats();
    res.json({ ok: true, data: stats });
  } catch (err) { next(err); }
});

// ── Dependency graph ────────────────────────────────────────────────────────
router.get('/graph', async (_req, res, next) => {
  try {
    const graph = await svc.getDependencyGraph();
    res.json({ ok: true, data: graph });
  } catch (err) { next(err); }
});

// ── SPOF detection ──────────────────────────────────────────────────────────
router.get('/spofs', async (_req, res, next) => {
  try {
    const spofs = await svc.detectSPOFs();
    res.json({ ok: true, data: spofs });
  } catch (err) { next(err); }
});

// ── Get single asset ────────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const asset = await svc.getAssetById(req.params.id);
    if (!asset) return res.status(404).json({ ok: false, error: 'Asset not found' });
    res.json({ ok: true, data: asset });
  } catch (err) { next(err); }
});

// ── Create asset ────────────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const asset = await svc.createAsset(req.body, req.user?.id);
    res.status(201).json({ ok: true, data: asset });
  } catch (err) { next(err); }
});

// ── Update asset ────────────────────────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const asset = await svc.updateAsset(req.params.id, req.body, req.user?.id);
    if (!asset) return res.status(404).json({ ok: false, error: 'Asset not found' });
    res.json({ ok: true, data: asset });
  } catch (err) { next(err); }
});

// ── Delete asset ────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    await svc.deleteAsset(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ── Link process to asset ───────────────────────────────────────────────────
router.post('/:id/processes', async (req, res, next) => {
  try {
    const link = await svc.linkProcess(req.params.id, req.body.process_id, req.body);
    res.status(201).json({ ok: true, data: link });
  } catch (err) { next(err); }
});

// ── Unlink process ──────────────────────────────────────────────────────────
router.delete('/:id/processes/:processId', async (req, res, next) => {
  try {
    await svc.unlinkProcess(req.params.id, req.params.processId);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
