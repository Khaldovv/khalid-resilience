/**
 * Monte Carlo Risk Quantification Service
 * Uses PERT (Beta) distribution for financial impact simulation.
 */

/**
 * Generate a PERT-distributed random value.
 * PERT uses a modified Beta distribution with shape parameter λ=4.
 * @param {number} min - Best case
 * @param {number} mode - Most likely case
 * @param {number} max - Worst case
 * @returns {number} Random value from PERT distribution
 */
function pertRandom(min, mode, max) {
  if (min >= max) return mode;
  const lambda = 4;
  const mu = (min + lambda * mode + max) / (lambda + 2);

  // Calculate alpha and beta for the Beta distribution
  const alpha = ((mu - min) * (2 * mode - min - max)) / ((mode - mu) * (max - min)) || 2;
  const beta = (alpha * (max - mu)) / (mu - min) || 2;

  // Ensure positive shape parameters
  const a = Math.max(0.5, alpha);
  const b = Math.max(0.5, beta);

  // Generate Beta-distributed random using Joehnk's method for small params
  // or the ratio-of-uniforms for larger params
  const betaRand = betaDistribution(a, b);

  // Scale to [min, max]
  return min + betaRand * (max - min);
}

/**
 * Generate a Beta-distributed random variable using the gamma method.
 */
function betaDistribution(alpha, beta) {
  const x = gammaRandom(alpha);
  const y = gammaRandom(beta);
  return x / (x + y);
}

/**
 * Generate Gamma-distributed random variable using Marsaglia and Tsang's method.
 */
function gammaRandom(shape) {
  if (shape < 1) {
    // Boost for shape < 1
    return gammaRandom(shape + 1) * Math.pow(Math.random(), 1 / shape);
  }

  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);

  while (true) {
    let x, v;
    do {
      x = normalRandom();
      v = 1 + c * x;
    } while (v <= 0);

    v = v * v * v;
    const u = Math.random();

    if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

/**
 * Box-Muller transform for normal distribution.
 */
function normalRandom() {
  let u, v, s;
  do {
    u = Math.random() * 2 - 1;
    v = Math.random() * 2 - 1;
    s = u * u + v * v;
  } while (s >= 1 || s === 0);
  return u * Math.sqrt(-2 * Math.log(s) / s);
}

/**
 * Run Monte Carlo simulation for a single risk.
 * @param {number} minImpact - Best case financial impact (SAR)
 * @param {number} mostLikely - Most likely financial impact (SAR)
 * @param {number} maxImpact - Worst case financial impact (SAR)
 * @param {number} probabilityPct - Probability of occurrence (0-100)
 * @param {number} runs - Number of simulation iterations
 * @returns {Object} Simulation results with statistics and histogram
 */
function runSimulation(minImpact, mostLikely, maxImpact, probabilityPct, runs = 10000) {
  const probability = probabilityPct / 100;
  const results = [];

  for (let i = 0; i < runs; i++) {
    // Simulate whether the event occurs
    if (Math.random() < probability) {
      const loss = pertRandom(minImpact, mostLikely, maxImpact);
      results.push(loss);
    } else {
      results.push(0);
    }
  }

  // Sort for percentile calculations
  results.sort((a, b) => a - b);

  // Filter only non-zero losses for conditional statistics
  const nonZeroLosses = results.filter(v => v > 0);

  // Calculate statistics
  const mean = results.reduce((s, v) => s + v, 0) / results.length;
  const median = results[Math.floor(results.length / 2)];
  const p90 = results[Math.floor(results.length * 0.90)];
  const p95 = results[Math.floor(results.length * 0.95)];
  const p99 = results[Math.floor(results.length * 0.99)];
  const ale = mean; // ALE ≈ mean annual loss (already factors in probability)
  const var95 = p95;

  // Generate histogram (20 buckets of non-zero values)
  const maxVal = results[results.length - 1] || 1;
  const bucketCount = 20;
  const bucketSize = maxVal / bucketCount;
  const histogram = [];

  for (let b = 0; b < bucketCount; b++) {
    const bucketMin = b * bucketSize;
    const bucketMax = (b + 1) * bucketSize;
    const count = results.filter(v => v >= bucketMin && (b === bucketCount - 1 ? v <= bucketMax : v < bucketMax)).length;
    histogram.push({
      bucket: Math.round(bucketMin),
      bucket_max: Math.round(bucketMax),
      label: `${formatSAR(bucketMin)} - ${formatSAR(bucketMax)}`,
      count,
    });
  }

  return {
    simulation_runs: runs,
    mean_loss_sar: round2(mean),
    median_loss_sar: round2(median),
    percentile_90_sar: round2(p90),
    percentile_95_sar: round2(p95),
    percentile_99_sar: round2(p99),
    annualized_loss_expectancy_sar: round2(ale),
    var_95_sar: round2(var95),
    simulation_data: histogram,
    non_zero_count: nonZeroLosses.length,
    zero_count: runs - nonZeroLosses.length,
  };
}

/**
 * Run portfolio-level Monte Carlo simulation.
 * For each run, independently simulate all risks and sum losses.
 * @param {Array} quantifiedRisks - Array of {min_impact_sar, most_likely_impact_sar, max_impact_sar, probability_pct}
 * @param {number} runs - Number of simulation iterations
 * @returns {Object} Portfolio-level statistics
 */
function runPortfolioSimulation(quantifiedRisks, runs = 10000) {
  const portfolioResults = [];

  for (let i = 0; i < runs; i++) {
    let totalLoss = 0;
    for (const risk of quantifiedRisks) {
      const probability = (risk.probability_pct || 0) / 100;
      if (Math.random() < probability) {
        totalLoss += pertRandom(
          Number(risk.min_impact_sar),
          Number(risk.most_likely_impact_sar),
          Number(risk.max_impact_sar)
        );
      }
    }
    portfolioResults.push(totalLoss);
  }

  portfolioResults.sort((a, b) => a - b);

  const totalAle = portfolioResults.reduce((s, v) => s + v, 0) / portfolioResults.length;
  const p95 = portfolioResults[Math.floor(portfolioResults.length * 0.95)];
  const p99 = portfolioResults[Math.floor(portfolioResults.length * 0.99)];

  // Histogram
  const maxVal = portfolioResults[portfolioResults.length - 1] || 1;
  const bucketCount = 20;
  const bucketSize = maxVal / bucketCount;
  const histogram = [];

  for (let b = 0; b < bucketCount; b++) {
    const bucketMin = b * bucketSize;
    const bucketMax = (b + 1) * bucketSize;
    const count = portfolioResults.filter(v => v >= bucketMin && (b === bucketCount - 1 ? v <= bucketMax : v < bucketMax)).length;
    histogram.push({
      bucket: Math.round(bucketMin),
      bucket_max: Math.round(bucketMax),
      label: `${formatSAR(bucketMin)} - ${formatSAR(bucketMax)}`,
      count,
    });
  }

  return {
    total_ale_sar: round2(totalAle),
    portfolio_var_95_sar: round2(p95),
    portfolio_var_99_sar: round2(p99),
    risk_count: quantifiedRisks.length,
    simulation_data: histogram,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function round2(n) { return Math.round(n * 100) / 100; }

function formatSAR(val) {
  if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `${(val / 1e3).toFixed(0)}K`;
  return val.toFixed(0);
}

module.exports = { runSimulation, runPortfolioSimulation };
