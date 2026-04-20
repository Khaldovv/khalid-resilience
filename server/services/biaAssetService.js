const db = require('../config/database');

const ASSET_TYPES = ['IT_SYSTEM', 'APPLICATION', 'FACILITY', 'EQUIPMENT', 'PERSONNEL', 'VENDOR', 'DATA', 'DOCUMENT'];
const CRITICALITY_LEVELS = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
const CRITICALITY_LABELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

// ── Auto-generate asset code ────────────────────────────────────────────────
const TYPE_PREFIXES = {
  IT_SYSTEM: 'ITS', APPLICATION: 'APP', FACILITY: 'FAC', EQUIPMENT: 'EQP',
  PERSONNEL: 'PER', VENDOR: 'VEN', DATA: 'DAT', DOCUMENT: 'DOC',
};

async function generateAssetCode(assetType) {
  const prefix = TYPE_PREFIXES[assetType] || 'AST';
  const result = await db('bia_assets')
    .where('asset_code', 'like', `${prefix}-%`)
    .max('asset_code as maxCode')
    .first();
  const lastNum = result?.maxCode ? parseInt(result.maxCode.split('-')[1], 10) : 0;
  return `${prefix}-${String(lastNum + 1).padStart(4, '0')}`;
}

// ── CRUD ─────────────────────────────────────────────────────────────────────
async function listAssets(filters = {}) {
  const q = db('bia_assets').select('*').orderBy('created_at', 'desc');
  if (filters.asset_type) q.where('asset_type', filters.asset_type);
  if (filters.criticality) q.where('criticality', filters.criticality);
  if (filters.status) q.where('status', filters.status);
  if (filters.department) q.where('department', filters.department);
  if (filters.search) {
    q.where(function () {
      this.whereILike('name', `%${filters.search}%`)
        .orWhereILike('name_ar', `%${filters.search}%`)
        .orWhereILike('asset_code', `%${filters.search}%`);
    });
  }
  return q;
}

async function getAssetById(id) {
  const asset = await db('bia_assets').where('id', id).first();
  if (!asset) return null;
  const links = await db('bia_asset_process_links').where('asset_id', id);
  const deps = await db('bia_asset_dependencies')
    .where('source_asset_id', id)
    .orWhere('target_asset_id', id);
  return { ...asset, processLinks: links, dependencies: deps };
}

async function createAsset(data, userId) {
  const assetCode = await generateAssetCode(data.asset_type);
  const [asset] = await db('bia_assets')
    .insert({ ...data, asset_code: assetCode, created_by: userId, updated_by: userId })
    .returning('*');
  return asset;
}

async function updateAsset(id, data, userId) {
  const [asset] = await db('bia_assets')
    .where('id', id)
    .update({ ...data, updated_by: userId, updated_at: db.fn.now() })
    .returning('*');
  return asset;
}

async function deleteAsset(id) {
  return db('bia_assets').where('id', id).del();
}

// ── Process Linking ──────────────────────────────────────────────────────────
async function linkProcess(assetId, processId, data = {}) {
  const [link] = await db('bia_asset_process_links')
    .insert({ asset_id: assetId, process_id: processId, ...data })
    .onConflict(['asset_id', 'process_id']).merge()
    .returning('*');
  return link;
}

async function unlinkProcess(assetId, processId) {
  return db('bia_asset_process_links')
    .where({ asset_id: assetId, process_id: processId }).del();
}

// ── RTO Inheritance ──────────────────────────────────────────────────────────
async function computeInheritedRTO(assetId) {
  const links = await db('bia_asset_process_links')
    .join('bia_processes', 'bia_processes.id', 'bia_asset_process_links.process_id')
    .where('bia_asset_process_links.asset_id', assetId)
    .select('bia_processes.rto_hours');
  if (!links.length) return null;
  return Math.min(...links.map(l => l.rto_hours).filter(Boolean));
}

// ── SPOF Detection ───────────────────────────────────────────────────────────
async function detectSPOFs() {
  const spofs = await db('bia_asset_process_links')
    .where('is_alternative_available', false)
    .where('dependency_type', 'CRITICAL')
    .join('bia_assets', 'bia_assets.id', 'bia_asset_process_links.asset_id')
    .select('bia_assets.*', 'bia_asset_process_links.process_id');
  return spofs;
}

// ── Dashboard Stats ──────────────────────────────────────────────────────────
async function getDashboardStats() {
  const total = await db('bia_assets').count('id as count').first();
  const byType = await db('bia_assets').select('asset_type').count('id as count').groupBy('asset_type');
  const byCriticality = await db('bia_assets').select('criticality').count('id as count').groupBy('criticality');
  const byStatus = await db('bia_assets').select('status').count('id as count').groupBy('status');
  const spofs = await detectSPOFs();
  return {
    totalAssets: parseInt(total.count),
    byType: Object.fromEntries(byType.map(r => [r.asset_type, parseInt(r.count)])),
    byCriticality: Object.fromEntries(byCriticality.map(r => [r.criticality, parseInt(r.count)])),
    byStatus: Object.fromEntries(byStatus.map(r => [r.status, parseInt(r.count)])),
    spofCount: spofs.length,
  };
}

// ── Dependency Graph (adjacency list) ────────────────────────────────────────
async function getDependencyGraph() {
  const assets = await db('bia_assets').select('id', 'name', 'asset_type', 'criticality');
  const edges = await db('bia_asset_dependencies').select('*');
  return {
    nodes: assets.map(a => ({
      id: a.id, label: a.name, type: a.asset_type, criticality: a.criticality,
    })),
    edges: edges.map(e => ({
      source: e.source_asset_id, target: e.target_asset_id,
      relationship: e.relationship_type,
    })),
  };
}

module.exports = {
  listAssets, getAssetById, createAsset, updateAsset, deleteAsset,
  linkProcess, unlinkProcess, computeInheritedRTO, detectSPOFs,
  getDashboardStats, getDependencyGraph,
};
