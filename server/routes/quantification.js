const express = require('express');
const db = require('../config/database');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const auditLog = require('../middleware/auditLog');
const { runSimulation, runPortfolioSimulation } = require('../services/monteCarloService');

const router = express.Router();
router.use(authenticate);
router.use(auditLog);

/**
 * @swagger
 * /quantification:
 *   get:
 *     tags: [Quantification]
 *     summary: List all quantified risks with ALE/VaR values
 *     responses:
 *       200:
 *         description: Quantified risk list sorted by ALE descending
 * /quantification/simulate/{riskId}:
 *   post:
 *     tags: [Quantification]
 *     summary: Run Monte Carlo simulation for a single risk (10K iterations, PERT distribution)
 *     parameters:
 *       - in: path
 *         name: riskId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [min_impact_sar, most_likely_impact_sar, max_impact_sar, probability_pct]
 *             properties:
 *               min_impact_sar: { type: number, example: 100000 }
 *               most_likely_impact_sar: { type: number, example: 500000 }
 *               max_impact_sar: { type: number, example: 2000000 }
 *               probability_pct: { type: number, example: 40 }
 *     responses:
 *       201:
 *         description: Simulation results with statistics and histogram
 * /quantification/{riskId}:
 *   get:
 *     tags: [Quantification]
 *     summary: Get quantification results for a specific risk
 *     responses:
 *       200:
 *         description: Quantification record
 * /quantification/portfolio/{year}:
 *   post:
 *     tags: [Quantification]
 *     summary: Run portfolio-level Monte Carlo simulation
 *     responses:
 *       201:
 *         description: Portfolio VaR and ALE
 *   get:
 *     tags: [Quantification]
 *     summary: Get portfolio simulation results for fiscal year
 *     responses:
 *       200:
 *         description: Portfolio results
 */

// ── POST /simulate/:riskId — Run Monte Carlo for single risk ───────────────────

router.post('/simulate/:riskId', authorize('MANAGE_RISKS'), async (req, res, next) => {
  try {
    const { min_impact_sar, most_likely_impact_sar, max_impact_sar, probability_pct, notes } = req.body;

    if (!min_impact_sar || !most_likely_impact_sar || !max_impact_sar || !probability_pct) {
      return res.status(400).json({ error: 'min_impact_sar, most_likely_impact_sar, max_impact_sar, and probability_pct are required.' });
    }

    // Verify risk exists
    const risk = await db('risks').where({ id: req.params.riskId }).first();
    if (!risk) return res.status(404).json({ error: 'Risk not found.' });

    // Run simulation
    const results = runSimulation(
      Number(min_impact_sar),
      Number(most_likely_impact_sar),
      Number(max_impact_sar),
      Number(probability_pct),
      10000
    );

    // Upsert quantification record (delete old, insert new)
    await db('risk_quantification').where({ risk_id: req.params.riskId }).del();

    const [record] = await db('risk_quantification').insert({
      risk_id: req.params.riskId,
      min_impact_sar,
      most_likely_impact_sar,
      max_impact_sar,
      probability_pct,
      simulation_runs: results.simulation_runs,
      mean_loss_sar: results.mean_loss_sar,
      median_loss_sar: results.median_loss_sar,
      percentile_90_sar: results.percentile_90_sar,
      percentile_95_sar: results.percentile_95_sar,
      percentile_99_sar: results.percentile_99_sar,
      annualized_loss_expectancy_sar: results.annualized_loss_expectancy_sar,
      var_95_sar: results.var_95_sar,
      simulation_data: JSON.stringify(results.simulation_data),
      calculated_by: req.user.id,
      notes,
    }).returning('*');

    res.status(201).json(record);
  } catch (err) { next(err); }
});

// ── GET /:riskId — Get quantification results for a risk ───────────────────────

router.get('/:riskId', authorize('VIEW_RISKS'), async (req, res, next) => {
  try {
    const quant = await db('risk_quantification')
      .where({ risk_id: req.params.riskId })
      .orderBy('calculated_at', 'desc')
      .first();

    if (!quant) return res.status(404).json({ error: 'No quantification found for this risk.' });
    res.json(quant);
  } catch (err) { next(err); }
});

// ── GET / — List all quantified risks ──────────────────────────────────────────

router.get('/', authorize('VIEW_RISKS'), async (req, res, next) => {
  try {
    const quantified = await db('risk_quantification as rq')
      .leftJoin('risks as r', 'rq.risk_id', 'r.id')
      .select(
        'rq.*',
        'r.risk_name',
        'r.inherent_score',
        'r.inherent_level',
        'r.residual_score',
        'r.residual_level'
      )
      .orderBy('rq.annualized_loss_expectancy_sar', 'desc');

    res.json({ data: quantified });
  } catch (err) { next(err); }
});

// ── POST /portfolio/:year — Run portfolio simulation ───────────────────────────

router.post('/portfolio/:year', authorize('MANAGE_RISKS'), async (req, res, next) => {
  try {
    const year = parseInt(req.params.year);
    if (!year) return res.status(400).json({ error: 'Valid year is required.' });

    // Get all quantified risks
    const risks = await db('risk_quantification').select(
      'min_impact_sar', 'most_likely_impact_sar', 'max_impact_sar', 'probability_pct'
    );

    if (risks.length === 0) {
      return res.status(400).json({ error: 'No quantified risks found. Run individual simulations first.' });
    }

    const results = runPortfolioSimulation(risks, 10000);

    // Upsert portfolio record
    await db('risk_quantification_portfolio').where({ fiscal_year: year }).del();

    const [portfolio] = await db('risk_quantification_portfolio').insert({
      title: `Enterprise Risk Portfolio ${year}`,
      fiscal_year: year,
      total_ale_sar: results.total_ale_sar,
      portfolio_var_95_sar: results.portfolio_var_95_sar,
      portfolio_var_99_sar: results.portfolio_var_99_sar,
      risk_count: results.risk_count,
      simulation_data: JSON.stringify(results.simulation_data),
      generated_by: req.user.id,
    }).returning('*');

    res.status(201).json(portfolio);
  } catch (err) { next(err); }
});

// ── GET /portfolio/:year — Get portfolio results ───────────────────────────────

router.get('/portfolio/:year', authorize('VIEW_RISKS'), async (req, res, next) => {
  try {
    const portfolio = await db('risk_quantification_portfolio')
      .where({ fiscal_year: parseInt(req.params.year) })
      .orderBy('generated_at', 'desc')
      .first();

    if (!portfolio) return res.status(404).json({ error: 'No portfolio data found for this year.' });
    res.json(portfolio);
  } catch (err) { next(err); }
});

module.exports = router;
