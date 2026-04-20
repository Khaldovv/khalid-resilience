const express = require('express');
const db = require('../config/database');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const auditLog = require('../middleware/auditLog');

const router = express.Router();
router.use(authenticate);
router.use(auditLog);

// ── GET /sumood/pillars — Full hierarchy ───────────────────────────────────────
router.get('/pillars', authorize('VIEW_SUMOOD'), async (req, res, next) => {
  try {
    const pillars = await db('sumood_pillars').orderBy('sort_order');
    const components = await db('sumood_components');
    const kpis = await db('sumood_kpis');

    const hierarchy = pillars.map(p => ({
      ...p,
      components: components.filter(c => c.pillar_id === p.id).map(c => ({
        ...c,
        kpis: kpis.filter(k => k.component_id === c.id),
      })),
    }));

    res.json({ data: hierarchy, total_kpis: kpis.length });
  } catch (err) { next(err); }
});

// ── GET /sumood/kpis/:componentId ──────────────────────────────────────────────
router.get('/kpis/:componentId', authorize('VIEW_SUMOOD'), async (req, res, next) => {
  try {
    const kpis = await db('sumood_kpis').where({ component_id: req.params.componentId });
    res.json({ data: kpis });
  } catch (err) { next(err); }
});

// ── POST /sumood/assess — Single KPI assessment ───────────────────────────────
router.post('/assess', authorize('MANAGE_SUMOOD'), async (req, res, next) => {
  try {
    const { kpi_id, department_id, fiscal_year, maturity_level, evidence_notes, attachments } = req.body;

    if (!kpi_id || !department_id || !fiscal_year || !maturity_level) {
      return res.status(400).json({ error: 'kpi_id, department_id, fiscal_year, and maturity_level are required.' });
    }
    if (maturity_level < 1 || maturity_level > 7) {
      return res.status(400).json({ error: 'maturity_level must be between 1 and 7.' });
    }

    // Upsert
    const existing = await db('sumood_assessments').where({ kpi_id, department_id, fiscal_year }).first();
    if (existing) {
      await db('sumood_assessments').where({ id: existing.id }).update({
        maturity_level, evidence_notes, attachments: JSON.stringify(attachments || []),
        assessed_by: req.user.id, updated_at: new Date(),
      });
      const updated = await db('sumood_assessments').where({ id: existing.id }).first();
      return res.json(updated);
    }

    const [row] = await db('sumood_assessments').insert({
      kpi_id, department_id, fiscal_year, maturity_level,
      evidence_notes, attachments: JSON.stringify(attachments || []),
      assessed_by: req.user.id,
    }).returning('*');

    res.status(201).json(row);
  } catch (err) { next(err); }
});

// ── POST /sumood/assess/batch — Batch assessment (hardened: strict reject) ─────
router.post('/assess/batch', authorize('MANAGE_SUMOOD'), async (req, res, next) => {
  try {
    const { entries } = req.body;
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'entries must be a non-empty array.' });
    }
    if (entries.length > 500) {
      return res.status(400).json({ error: 'Batch size cannot exceed 500 entries.' });
    }

    // Validate ALL entries first — reject entire batch if any are invalid
    const errors = [];
    for (let idx = 0; idx < entries.length; idx++) {
      const e = entries[idx];
      if (!e.kpi_id) errors.push(`Entry ${idx}: missing kpi_id.`);
      if (!e.department_id) errors.push(`Entry ${idx}: missing department_id.`);
      if (!e.fiscal_year) errors.push(`Entry ${idx}: missing fiscal_year.`);
      const ml = parseInt(e.maturity_level);
      if (!Number.isInteger(ml) || ml < 1 || ml > 7) {
        errors.push(`Entry ${idx}: maturity_level must be integer 1–7, got ${e.maturity_level}.`);
      }
    }
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Batch validation failed. Fix ALL errors and resubmit.', details: errors });
    }

    let processed = 0;
    for (const e of entries) {
      const ml = parseInt(e.maturity_level);
      const existing = await db('sumood_assessments').where({ kpi_id: e.kpi_id, department_id: e.department_id, fiscal_year: e.fiscal_year }).first();
      if (existing) {
        await db('sumood_assessments').where({ id: existing.id }).update({ maturity_level: ml, evidence_notes: e.evidence_notes || '', assessed_by: req.user.id, updated_at: new Date() });
      } else {
        await db('sumood_assessments').insert({ kpi_id: e.kpi_id, department_id: e.department_id, fiscal_year: e.fiscal_year, maturity_level: ml, evidence_notes: e.evidence_notes || '', assessed_by: req.user.id });
      }
      processed++;
    }

    res.json({ message: `Batch assessment complete. ${processed} KPIs processed.`, processed });
  } catch (err) { next(err); }
});

// ── GET /sumood/scores/:dept/:year — Computed scores ──────────────────────────
router.get('/scores/:dept/:year', authorize('VIEW_SUMOOD'), async (req, res, next) => {
  try {
    const { dept, year } = req.params;
    const pillars = await db('sumood_pillars').orderBy('sort_order');
    const components = await db('sumood_components');
    const kpis = await db('sumood_kpis').where('is_applicable', true);
    const assessments = await db('sumood_assessments').where({ department_id: dept, fiscal_year: parseInt(year) });

    const assessMap = {};
    assessments.forEach(a => { assessMap[a.kpi_id] = a; });

    // Calculate component scores (weighted average)
    const compScores = {};
    components.forEach(comp => {
      const compKpis = kpis.filter(k => k.component_id === comp.id);
      let totalWeighted = 0, totalWeight = 0;
      compKpis.forEach(kpi => {
        const asm = assessMap[kpi.id];
        if (asm) {
          totalWeighted += asm.maturity_level * parseFloat(kpi.weight);
          totalWeight += parseFloat(kpi.weight);
        }
      });
      compScores[comp.id] = totalWeight > 0 ? +(totalWeighted / totalWeight).toFixed(2) : 0;
    });

    // Pillar scores (average of component scores)
    const pillarResults = pillars.map(p => {
      const pComps = components.filter(c => c.pillar_id === p.id);
      const scores = pComps.map(c => compScores[c.id]).filter(s => s > 0);
      const pillarScore = scores.length ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0;
      return {
        pillar: p,
        score: pillarScore,
        components: pComps.map(c => ({ component: c, score: compScores[c.id] })),
      };
    });

    // Org score
    const validPillarScores = pillarResults.map(p => p.score).filter(s => s > 0);
    const orgScore = validPillarScores.length ? +(validPillarScores.reduce((a, b) => a + b, 0) / validPillarScores.length).toFixed(2) : 0;

    res.json({ org_score: orgScore, pillars: pillarResults });
  } catch (err) { next(err); }
});

// ── GET /sumood/gap-analysis/:dept/:year ───────────────────────────────────────
router.get('/gap-analysis/:dept/:year', authorize('VIEW_SUMOOD'), async (req, res, next) => {
  try {
    const { dept, year } = req.params;
    const targetLevel = parseInt(req.query.target) || 5;

    const pillars = await db('sumood_pillars').orderBy('sort_order');
    const components = await db('sumood_components');
    const kpis = await db('sumood_kpis').where('is_applicable', true);
    const assessments = await db('sumood_assessments').where({ department_id: dept, fiscal_year: parseInt(year) });

    const assessMap = {};
    assessments.forEach(a => { assessMap[a.kpi_id] = a; });

    const compScores = {};
    components.forEach(comp => {
      const compKpis = kpis.filter(k => k.component_id === comp.id);
      let totalWeighted = 0, totalWeight = 0;
      compKpis.forEach(kpi => {
        const asm = assessMap[kpi.id];
        if (asm) { totalWeighted += asm.maturity_level * parseFloat(kpi.weight); totalWeight += parseFloat(kpi.weight); }
      });
      compScores[comp.id] = totalWeight > 0 ? +(totalWeighted / totalWeight).toFixed(2) : 0;
    });

    const results = pillars.map(pillar => ({
      pillar,
      components: components.filter(c => c.pillar_id === pillar.id).map(comp => {
        const score = compScores[comp.id];
        const gap = Math.max(0, +(targetLevel - score).toFixed(2));
        let priority = 'low';
        if (gap >= 3) priority = 'critical';
        else if (gap >= 2) priority = 'high';
        else if (gap >= 1) priority = 'medium';

        let recommendation = '';
        if (gap >= 3) recommendation = `يتطلب تدخل عاجل — الفجوة ${gap} مستوى. يوصى ببناء برنامج تأسيسي شامل.`;
        else if (gap >= 2) recommendation = `فجوة كبيرة (${gap} مستوى). يوصى بتطوير خطة تحسين مرحلية.`;
        else if (gap >= 1) recommendation = `فجوة متوسطة (${gap} مستوى). يوصى بتعزيز الممارسات الحالية.`;
        else recommendation = 'المستوى يلبي أو يتجاوز المستهدف. يوصى بالحفاظ والتحسين المستمر.';

        return { component: comp, current_score: score, target_level: targetLevel, gap, priority, recommendation };
      }),
    }));

    res.json({ target_level: targetLevel, data: results });
  } catch (err) { next(err); }
});

module.exports = router;
