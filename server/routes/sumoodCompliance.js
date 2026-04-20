const express = require('express');
const router = express.Router();
const db = require('../config/database');
const upload = require('../middleware/upload');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const crypto = require('crypto');
const fs = require('fs');

router.use(authenticate);

// Upload document
router.post('/documents/upload', authorize('MANAGE_SUMOOD'), upload.single('document'), async (req, res) => {
  try {
    const { department_id, fiscal_year } = req.body;
    if (!req.file) return res.status(400).json({ error: 'لم يتم رفع ملف' });

    const fileBuffer = fs.readFileSync(req.file.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const existing = await db('sumood_documents').where('file_hash', hash).first();
    if (existing) {
      fs.unlinkSync(req.file.path);
      return res.status(409).json({ error: 'هذا المستند مرفوع مسبقاً', existingDocumentId: existing.id });
    }

    const [doc] = await db('sumood_documents').insert({
      department_id, fiscal_year: parseInt(fiscal_year),
      file_name: req.file.originalname, file_type: req.file.mimetype,
      file_size_bytes: req.file.size, storage_path: req.file.path,
      file_hash: hash, status: 'UPLOADED', uploaded_by: req.user.id,
    }).returning('*');

    const { analyzeDocument } = require('../services/sumoodComplianceService');
    analyzeDocument(doc.id).catch(err => console.error('Analysis failed:', err));

    res.status(201).json({ ...doc, message: 'تم رفع المستند بنجاح. جاري التحليل...' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// List documents
router.get('/documents', authorize('VIEW_SUMOOD'), async (req, res, next) => {
  try {
    const docs = await db('sumood_documents').orderBy('created_at', 'desc');
    res.json(docs);
  } catch (err) { next(err); }
});

// Get document detail
router.get('/documents/:id', authorize('VIEW_SUMOOD'), async (req, res, next) => {
  try {
    const doc = await db('sumood_documents').where('id', req.params.id).first();
    if (!doc) return res.status(404).json({ error: 'المستند غير موجود' });
    const summary = await db('sumood_analysis_summaries').where('document_id', doc.id).first();
    const mappings = await db('sumood_document_kpi_mappings')
      .join('sumood_kpis', 'sumood_document_kpi_mappings.kpi_id', 'sumood_kpis.id')
      .where('document_id', doc.id)
      .select('sumood_document_kpi_mappings.*', 'sumood_kpis.kpi_code', 'sumood_kpis.kpi_text_ar');
    res.json({ document: doc, summary, mappings });
  } catch (err) { next(err); }
});

// Re-analyze
router.post('/documents/:id/reanalyze', authorize('MANAGE_SUMOOD'), async (req, res) => {
  await db('sumood_document_kpi_mappings').where('document_id', req.params.id).delete();
  await db('sumood_analysis_summaries').where('document_id', req.params.id).delete();
  const { analyzeDocument } = require('../services/sumoodComplianceService');
  analyzeDocument(req.params.id).catch(err => console.error('Reanalysis failed:', err));
  res.json({ message: 'جاري إعادة التحليل...' });
});

// Delete document
router.delete('/documents/:id', authorize('MANAGE_SUMOOD'), async (req, res) => {
  const doc = await db('sumood_documents').where('id', req.params.id).first();
  if (!doc) return res.status(404).json({ error: 'المستند غير موجود' });
  try { fs.unlinkSync(doc.storage_path); } catch (e) { /* ignore */ }
  await db('sumood_documents').where('id', req.params.id).delete();
  res.json({ message: 'تم حذف المستند' });
});

module.exports = router;
