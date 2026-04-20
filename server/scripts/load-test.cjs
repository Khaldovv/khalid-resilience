#!/usr/bin/env node
/**
 * ============================================================================
 *  Phase 2: API Bombardment — Backend Load Testing
 * ============================================================================
 *  Simulates 500 concurrent users attacking resource-intensive endpoints
 *  for 2 minutes. Pure Node.js — no external tools needed.
 *
 *  Endpoints tested:
 *   - GET  /api/v1/risks          (paginated list — 20K rows)
 *   - GET  /api/v1/risks/matrix   (full matrix aggregation)
 *   - POST /api/v1/risks          (create new risk)
 *   - GET  /api/v1/bia/assessments (list assessments)
 *   - POST /api/v1/bia/processes  (create new BIA process)
 *   - GET  /api/v1/sumood/scores/:dept/:year (heavy computation)
 *   - GET  /api/v1/reports/risk-register/pdf  (CPU-bound PDF generation)
 *   - GET  /api/v1/reports/risk-register/excel (CPU-bound Excel generation)
 *
 *  Usage:  node scripts/load-test.cjs
 * ============================================================================
 */
require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');

const BASE = process.env.API_BASE || 'http://localhost:3001';
const DURATION_MS = 2 * 60 * 1000; // 2 minutes
const CONCURRENCY = 500;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-do-not-use-in-production';

// ── Generate a valid admin JWT ──────────────────────────────────────────────
function makeToken() {
  return jwt.sign({
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@grc.sa',
    role: 'ADMIN',
    department_id: 'f0e1d2c3-b4a5-6789-0123-456789abcdef',
    full_name: 'System Admin',
    permissions: ['*'],
  }, JWT_SECRET, { expiresIn: '1h' });
}

const TOKEN = makeToken();

// ── HTTP request helper ─────────────────────────────────────────────────────
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    };

    const start = process.hrtime.bigint();
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const elapsed = Number(process.hrtime.bigint() - start) / 1e6; // ms
        resolve({ status: res.statusCode, latency: elapsed, size: data.length });
      });
    });

    req.on('error', (e) => reject(e));
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ── Scenario definitions ────────────────────────────────────────────────────
let riskCounter = 90000;
const DEPARTMENTS = ['f0e1d2c3-b4a5-6789-0123-456789abcdef', 'a1b2c3d4-e5f6-7890-1234-567890abcdef'];
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }

const scenarios = [
  {
    name: 'GET /risks (paginated)',
    weight: 30,
    fn: () => request('GET', `/api/v1/risks?page=${rand(1, 800)}&per_page=25`),
  },
  {
    name: 'GET /risks/matrix',
    weight: 10,
    fn: () => request('GET', '/api/v1/risks/matrix'),
  },
  {
    name: 'POST /risks (create)',
    weight: 15,
    fn: () => {
      riskCounter++;
      return request('POST', '/api/v1/risks', {
        department_id: pick(DEPARTMENTS),
        risk_name: `Load-Test Risk ${riskCounter}`,
        description: 'Automated load test',
        risk_type: 'Cybersecurity',
        inherent_likelihood: rand(1, 5),
        inherent_impact: rand(1, 5),
        confidence_level: rand(1, 5),
        response_type: 'MITIGATE',
      });
    },
  },
  {
    name: 'GET /bia/assessments',
    weight: 15,
    fn: () => request('GET', '/api/v1/bia/assessments'),
  },
  {
    name: 'POST /bia/processes',
    weight: 10,
    fn: () => {
      const mtpd = rand(4, 168);
      return request('POST', '/api/v1/bia/processes', {
        assessment_id: `BIA-ASM-S${String(rand(1, 100)).padStart(3, '0')}`,
        process_name: `Load Test Process ${Date.now()}`,
        mtpd_hours: mtpd,
        rto_hours: +(mtpd * 0.7).toFixed(2),
        rpo_hours: +(mtpd * 0.3).toFixed(2),
      });
    },
  },
  {
    name: 'GET /sumood/scores (computation)',
    weight: 10,
    fn: () => request('GET', `/api/v1/sumood/scores/${pick(DEPARTMENTS)}/2026`),
  },
  {
    name: 'GET /reports/pdf (CPU-bound)',
    weight: 5,
    fn: () => request('GET', '/api/v1/reports/risk-register/pdf'),
  },
  {
    name: 'GET /reports/excel (CPU-bound)',
    weight: 5,
    fn: () => request('GET', '/api/v1/reports/risk-register/excel'),
  },
];

// ── Build weighted scenario selector ────────────────────────────────────────
const weightedScenarios = [];
scenarios.forEach(s => { for (let i = 0; i < s.weight; i++) weightedScenarios.push(s); });

// ── Metrics collector ───────────────────────────────────────────────────────
const metrics = {};
scenarios.forEach(s => {
  metrics[s.name] = { total: 0, success: 0, errors: 0, timeouts: 0, latencies: [] };
});

// ── Worker function ─────────────────────────────────────────────────────────
async function worker(id) {
  const endTime = Date.now() + DURATION_MS;
  while (Date.now() < endTime) {
    const scenario = weightedScenarios[rand(0, weightedScenarios.length - 1)];
    const m = metrics[scenario.name];
    m.total++;
    try {
      const result = await scenario.fn();
      m.latencies.push(result.latency);
      if (result.status >= 200 && result.status < 400) m.success++;
      else m.errors++;
    } catch (e) {
      if (e.message === 'Timeout') m.timeouts++;
      else m.errors++;
    }
  }
}

// ── Percentile calculator ───────────────────────────────────────────────────
function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil(sorted.length * p / 100) - 1;
  return sorted[Math.max(0, idx)];
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`
╔══════════════════════════════════════════════════════╗
║  🔥 Phase 2: API Bombardment — Backend Load Test    ║
╠══════════════════════════════════════════════════════╣
║  Concurrency:  ${String(CONCURRENCY).padEnd(5)} workers                      ║
║  Duration:     ${String(DURATION_MS / 1000).padEnd(5)} seconds                      ║
║  Target:       ${BASE.padEnd(35)}║
║  Scenarios:    ${String(scenarios.length).padEnd(5)} endpoints                      ║
╚══════════════════════════════════════════════════════╝
`);

  // Verify server
  try {
    const health = await request('GET', '/api/v1/health');
    if (health.status !== 200) throw new Error(`Status ${health.status}`);
    console.log('✅ Server health check passed.\n');
  } catch (e) {
    console.error('❌ Server not reachable:', e.message);
    console.error('   Start the server with: cd server && node server.js');
    process.exit(1);
  }

  // Start progress tracker
  const startTime = Date.now();
  const progressInterval = setInterval(() => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    const totalReqs = Object.values(metrics).reduce((a, m) => a + m.total, 0);
    const rps = (totalReqs / Math.max(1, elapsed)).toFixed(1);
    process.stdout.write(`\r  ⏱️  ${elapsed}s elapsed | ${totalReqs} requests | ${rps} RPS`);
  }, 2000);

  // Launch workers
  console.log(`🚀 Launching ${CONCURRENCY} concurrent workers...\n`);
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker(i));
  }
  await Promise.all(workers);
  clearInterval(progressInterval);

  // ── Generate Report ───────────────────────────────────────────────────────
  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const totalReqs = Object.values(metrics).reduce((a, m) => a + m.total, 0);
  const totalErrors = Object.values(metrics).reduce((a, m) => a + m.errors, 0);
  const totalTimeouts = Object.values(metrics).reduce((a, m) => a + m.timeouts, 0);

  console.log(`\n\n${'═'.repeat(72)}`);
  console.log(`  📊 LOAD TEST RESULTS — ${totalElapsed}s`);
  console.log(`${'═'.repeat(72)}\n`);
  console.log(`  Total Requests:  ${totalReqs}`);
  console.log(`  Total Errors:    ${totalErrors} (${(totalErrors / totalReqs * 100).toFixed(2)}%)`);
  console.log(`  Total Timeouts:  ${totalTimeouts}`);
  console.log(`  Avg RPS:         ${(totalReqs / totalElapsed).toFixed(1)}\n`);

  console.log(`  ${'Endpoint'.padEnd(40)} ${'Total'.padEnd(8)} ${'OK'.padEnd(8)} ${'Err'.padEnd(6)} ${'P50'.padEnd(10)} ${'P95'.padEnd(10)} ${'P99'.padEnd(10)}`);
  console.log(`  ${'─'.repeat(92)}`);

  for (const [name, m] of Object.entries(metrics)) {
    const sorted = m.latencies.slice().sort((a, b) => a - b);
    const p50 = percentile(sorted, 50).toFixed(1);
    const p95 = percentile(sorted, 95).toFixed(1);
    const p99 = percentile(sorted, 99).toFixed(1);
    console.log(`  ${name.padEnd(40)} ${String(m.total).padEnd(8)} ${String(m.success).padEnd(8)} ${String(m.errors).padEnd(6)} ${(p50 + 'ms').padEnd(10)} ${(p95 + 'ms').padEnd(10)} ${(p99 + 'ms').padEnd(10)}`);
  }

  // Output JSON for report generation
  const reportData = {
    timestamp: new Date().toISOString(),
    duration_seconds: parseFloat(totalElapsed),
    concurrency: CONCURRENCY,
    total_requests: totalReqs,
    total_errors: totalErrors,
    total_timeouts: totalTimeouts,
    avg_rps: parseFloat((totalReqs / totalElapsed).toFixed(1)),
    scenarios: {},
  };
  for (const [name, m] of Object.entries(metrics)) {
    const sorted = m.latencies.slice().sort((a, b) => a - b);
    reportData.scenarios[name] = {
      total: m.total, success: m.success, errors: m.errors, timeouts: m.timeouts,
      p50: percentile(sorted, 50).toFixed(1),
      p95: percentile(sorted, 95).toFixed(1),
      p99: percentile(sorted, 99).toFixed(1),
      min: sorted.length ? sorted[0].toFixed(1) : '0',
      max: sorted.length ? sorted[sorted.length - 1].toFixed(1) : '0',
    };
  }

  const fs = require('fs');
  fs.writeFileSync('./scripts/load-test-results.json', JSON.stringify(reportData, null, 2));
  console.log(`\n  📄 Results saved to scripts/load-test-results.json\n`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
