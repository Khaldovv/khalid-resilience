const express = require('express');
const db = require('../config/database');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const auditLog = require('../middleware/auditLog');

const router = express.Router();
router.use(authenticate);
router.use(auditLog);

const APPROVER_ROLES = ['DEPT_HEAD', 'BC_COORDINATOR', 'CISO', 'CEO'];
const SLA_HOURS = 120; // 5 days

// ── POST /workflow/submit/:assessmentId — Start approval pipeline ──────────────
router.post('/submit/:assessmentId', authorize('MANAGE_BIA'), async (req, res, next) => {
  try {
    const asm = await db('bia_assessments').where({ id: req.params.assessmentId }).first();
    if (!asm) return res.status(404).json({ error: 'Assessment not found.' });
    if (asm.status !== 'DRAFT') return res.status(400).json({ error: 'Only DRAFT assessments can be submitted.' });

    // Update status
    await db('bia_assessments').where({ id: asm.id }).update({ status: 'IN_REVIEW', updated_at: new Date() });

    // Create first workflow step
    const deadline = new Date(Date.now() + SLA_HOURS * 3600000);
    const [step] = await db('bia_workflow_steps').insert({
      assessment_id: asm.id, step_order: 1, approver_role: 'DEPT_HEAD',
      decision: 'PENDING', deadline, sla_hours: SLA_HOURS,
    }).returning('*');

    res.json({ message: 'Assessment submitted for approval.', step });
  } catch (err) { next(err); }
});

// ── POST /workflow/approve/:stepId — Approve a step ────────────────────────────
router.post('/approve/:stepId', authorize('APPROVE_BIA'), async (req, res, next) => {
  try {
    const step = await db('bia_workflow_steps').where({ id: req.params.stepId }).first();
    if (!step) return res.status(404).json({ error: 'Workflow step not found.' });
    if (step.decision !== 'PENDING') return res.status(400).json({ error: 'Step is not pending.' });

    // Mark approved
    await db('bia_workflow_steps').where({ id: step.id }).update({
      decision: 'APPROVED', decided_at: new Date(),
      approver_id: req.user.id, approver_name: req.user.full_name,
      comments: req.body.comments || 'Approved.',
    });

    // Advance to next role or finalize
    const nextIdx = APPROVER_ROLES.indexOf(step.approver_role) + 1;
    if (nextIdx < APPROVER_ROLES.length) {
      const deadline = new Date(Date.now() + SLA_HOURS * 3600000);
      const [nextStep] = await db('bia_workflow_steps').insert({
        assessment_id: step.assessment_id, step_order: step.step_order + 1,
        approver_role: APPROVER_ROLES[nextIdx], decision: 'PENDING',
        deadline, sla_hours: SLA_HOURS,
      }).returning('*');
      res.json({ message: `Approved. Next step: ${APPROVER_ROLES[nextIdx]}.`, next_step: nextStep });
    } else {
      // Final approval — update assessment status
      await db('bia_assessments').where({ id: step.assessment_id }).update({
        status: 'APPROVED', approved_by: req.user.id, approved_at: new Date(),
      });
      res.json({ message: 'Final approval granted. Assessment is now APPROVED.' });
    }
  } catch (err) { next(err); }
});

// ── POST /workflow/reject/:stepId — Reject a step ──────────────────────────────
router.post('/reject/:stepId', authorize('APPROVE_BIA'), async (req, res, next) => {
  try {
    const step = await db('bia_workflow_steps').where({ id: req.params.stepId }).first();
    if (!step) return res.status(404).json({ error: 'Workflow step not found.' });
    if (step.decision !== 'PENDING') return res.status(400).json({ error: 'Step is not pending.' });

    const { comments } = req.body;
    if (!comments || comments.trim().length === 0) {
      return res.status(400).json({ error: 'Comments are mandatory when rejecting.' });
    }

    await db('bia_workflow_steps').where({ id: step.id }).update({
      decision: 'REJECTED', decided_at: new Date(),
      approver_id: req.user.id, approver_name: req.user.full_name, comments,
    });

    // Revert assessment to DRAFT
    await db('bia_assessments').where({ id: step.assessment_id }).update({ status: 'DRAFT', updated_at: new Date() });

    res.json({ message: 'Step rejected. Assessment reverted to DRAFT.', comments });
  } catch (err) { next(err); }
});

// ── GET /workflow/:assessmentId — Get workflow steps ───────────────────────────
router.get('/:assessmentId', authorize('VIEW_BIA'), async (req, res, next) => {
  try {
    const steps = await db('bia_workflow_steps')
      .where({ assessment_id: req.params.assessmentId })
      .orderBy('step_order');
    res.json({ data: steps });
  } catch (err) { next(err); }
});

// ── POST /workflow/escalate — Auto-escalate overdue steps (called by cron) ─────
router.post('/escalate', authorize('MANAGE_BIA'), async (req, res, next) => {
  try {
    const now = new Date();
    const overdue = await db('bia_workflow_steps')
      .where('decision', 'PENDING')
      .where('deadline', '<', now);

    let escalated = 0;
    for (const step of overdue) {
      await db('bia_workflow_steps').where({ id: step.id }).update({
        decision: 'ESCALATED', decided_at: now,
        comments: `Auto-escalated: SLA of ${step.sla_hours}h exceeded.`,
      });

      // Create next step with escalation
      const nextIdx = APPROVER_ROLES.indexOf(step.approver_role) + 1;
      if (nextIdx < APPROVER_ROLES.length) {
        await db('bia_workflow_steps').insert({
          assessment_id: step.assessment_id, step_order: step.step_order + 1,
          approver_role: APPROVER_ROLES[nextIdx], decision: 'PENDING',
          deadline: new Date(Date.now() + SLA_HOURS * 3600000), sla_hours: SLA_HOURS,
        });
      }
      escalated++;
    }

    res.json({ message: `Escalation check complete. ${escalated} steps escalated.`, escalated });
  } catch (err) { next(err); }
});

module.exports = router;
