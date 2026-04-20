const express = require('express');
const db = require('../config/database');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(authenticate);

// ── GET /reports/risk-register/pdf ─────────────────────────────────────────────
router.get('/risk-register/pdf', authorize('VIEW_REPORTS', 'EXPORT_REPORTS'), async (req, res, next) => {
  try {
    const PDFDocument = require('pdfkit');
    const risks = await db('risks').where('is_archived', false).orderBy('inherent_score', 'desc');

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="risk_register.pdf"');
    doc.pipe(res);

    // Title
    doc.fontSize(18).font('Helvetica-Bold').text('Enterprise Risk Register', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica').fillColor('#666').text(`Generated: ${new Date().toISOString().slice(0, 10)}  |  Total Risks: ${risks.length}`, { align: 'center' });
    doc.moveDown(1);

    // Table
    const headers = ['ID', 'Risk Name', 'Type', 'Likelihood', 'Impact', 'Score', 'Level', 'Confidence', 'Status'];
    const colWidths = [60, 160, 70, 60, 50, 40, 65, 60, 75];
    let y = doc.y;
    let x = 40;

    // Header row
    doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold');
    headers.forEach((h, i) => { doc.text(h, x, y, { width: colWidths[i], align: 'left' }); x += colWidths[i]; });
    y += 18;
    doc.moveTo(40, y).lineTo(760, y).stroke('#cbd5e1');
    y += 5;

    // Data rows
    doc.font('Helvetica').fontSize(7).fillColor('#1e293b');
    for (const r of risks) {
      if (y > 530) { doc.addPage(); y = 40; }
      x = 40;
      const cells = [r.id, r.risk_name?.slice(0, 35), r.risk_type, String(r.inherent_likelihood), String(r.inherent_impact), String(r.inherent_score), r.inherent_level, String(r.confidence_level), r.lifecycle_status];
      cells.forEach((c, i) => { doc.text(c || '—', x, y, { width: colWidths[i], align: 'left' }); x += colWidths[i]; });
      y += 14;
    }

    doc.end();
  } catch (err) { next(err); }
});

// ── GET /reports/risk-register/excel ───────────────────────────────────────────
router.get('/risk-register/excel', authorize('VIEW_REPORTS', 'EXPORT_REPORTS'), async (req, res, next) => {
  try {
    const ExcelJS = require('exceljs');
    const risks = await db('risks').where('is_archived', false).orderBy('inherent_score', 'desc');

    const wb = new ExcelJS.Workbook();
    wb.creator = 'GRC Platform';
    wb.created = new Date();

    const ws = wb.addWorksheet('Risk Register', { views: [{ rightToLeft: false }] });

    // Header
    ws.columns = [
      { header: 'ID', key: 'id', width: 12 },
      { header: 'Risk Name', key: 'risk_name', width: 35 },
      { header: 'Description', key: 'description', width: 45 },
      { header: 'Type', key: 'risk_type', width: 15 },
      { header: 'Likelihood', key: 'inherent_likelihood', width: 12 },
      { header: 'Impact', key: 'inherent_impact', width: 10 },
      { header: 'Score', key: 'inherent_score', width: 8 },
      { header: 'Level', key: 'inherent_level', width: 14 },
      { header: 'Confidence', key: 'confidence_level', width: 12 },
      { header: 'Response', key: 'response_type', width: 12 },
      { header: 'Status', key: 'lifecycle_status', width: 15 },
    ];

    // Style header
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };

    // Data
    risks.forEach(r => ws.addRow(r));

    // Conditional formatting for score colors
    ws.eachRow((row, rowNum) => {
      if (rowNum === 1) return;
      const score = row.getCell(7).value;
      let color = 'FF22C55E'; // Green
      if (score >= 20) color = 'FF7F1D1D';
      else if (score >= 15) color = 'FFEF4444';
      else if (score >= 10) color = 'FFF97316';
      else if (score >= 5) color = 'FFEAB308';
      row.getCell(7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
      row.getCell(7).font = { color: { argb: 'FFFFFFFF' }, bold: true };
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="risk_register.xlsx"');
    await wb.xlsx.write(res);
    res.end();
  } catch (err) { next(err); }
});

// ── GET /reports/bia-consolidated/pdf ──────────────────────────────────────────
router.get('/bia-consolidated/pdf', authorize('VIEW_REPORTS', 'EXPORT_REPORTS'), async (req, res, next) => {
  try {
    const PDFDocument = require('pdfkit');
    const year = parseInt(req.query.year) || 2026;
    const approved = await db('bia_assessments').where({ status: 'APPROVED', fiscal_year: year });
    const approvedIds = approved.map(a => a.id);
    const processes = await db('bia_processes').whereIn('assessment_id', approvedIds).orderBy('rto_hours');

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="bia_report_${year}.pdf"`);
    doc.pipe(res);

    doc.fontSize(18).font('Helvetica-Bold').text(`Business Impact Analysis — Consolidated Report FY${year}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(11).font('Helvetica').text(`Total Processes: ${processes.length}  |  Departments: ${approvedIds.length}`);
    doc.moveDown(1.5);

    // Recovery priority table
    doc.fontSize(12).font('Helvetica-Bold').text('Recovery Priority Order (by RTO ascending)');
    doc.moveDown(0.5);

    let y = doc.y;
    const cols = ['#', 'Process', 'Criticality', 'MTPD (h)', 'RTO (h)', 'RPO (h)', 'MBCO (%)'];
    const cw = [30, 200, 70, 60, 55, 55, 55];
    let x = 40;
    doc.fontSize(8).font('Helvetica-Bold');
    cols.forEach((c, i) => { doc.text(c, x, y, { width: cw[i] }); x += cw[i]; });
    y += 16;

    doc.font('Helvetica').fontSize(7);
    processes.forEach((p, idx) => {
      if (y > 750) { doc.addPage(); y = 40; }
      x = 40;
      const cells = [String(idx + 1), p.process_name?.slice(0, 40), p.criticality_level, String(p.mtpd_hours), String(p.rto_hours), String(p.rpo_hours), String(p.mbco_percent)];
      cells.forEach((c, i) => { doc.text(c, x, y, { width: cw[i] }); x += cw[i]; });
      y += 13;
    });

    doc.end();
  } catch (err) { next(err); }
});

// ── GET /reports/sumood-dashboard/pdf ──────────────────────────────────────────
router.get('/sumood-dashboard/pdf', authorize('VIEW_REPORTS', 'EXPORT_REPORTS'), async (req, res, next) => {
  try {
    const PDFDocument = require('pdfkit');
    const dept = req.query.dept || 'IT';
    const year = parseInt(req.query.year) || 2026;

    const pillars = await db('sumood_pillars').orderBy('sort_order');
    const components = await db('sumood_components');
    const kpis = await db('sumood_kpis').where('is_applicable', true);
    const assessments = await db('sumood_assessments').where({ department_id: dept, fiscal_year: year });

    const assessMap = {};
    assessments.forEach(a => { assessMap[a.kpi_id] = a; });

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="sumood_report_${dept}_${year}.pdf"`);
    doc.pipe(res);

    doc.fontSize(18).font('Helvetica-Bold').text(`National Resilience Index (Sumood) — ${dept} FY${year}`, { align: 'center' });
    doc.moveDown(1.5);

    pillars.forEach(p => {
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#0F172A').text(`${p.name_en} (${p.name_ar})`);
      doc.moveDown(0.3);

      const pComps = components.filter(c => c.pillar_id === p.id);
      pComps.forEach(comp => {
        const compKpis = kpis.filter(k => k.component_id === comp.id);
        let total = 0, count = 0;
        compKpis.forEach(k => { const a = assessMap[k.id]; if (a) { total += a.maturity_level; count++; } });
        const avg = count > 0 ? (total / count).toFixed(2) : '—';
        doc.fontSize(9).font('Helvetica').fillColor('#334155').text(`  ${comp.code}: ${comp.name_en} — Score: ${avg}/7`);
      });
      doc.moveDown(0.8);
    });

    doc.end();
  } catch (err) { next(err); }
});

module.exports = router;
