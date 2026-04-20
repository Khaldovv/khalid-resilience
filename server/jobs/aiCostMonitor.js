/**
 * AI Cost Monitor — daily spend check with alert threshold.
 * Should be scheduled via cron or node-cron to run daily at midnight.
 */
const db = require('../config/database');

async function checkDailyCost() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const result = await db('ai_usage_logs')
      .where('created_at', '>=', today)
      .sum('estimated_cost_usd as total')
      .first();

    const dailyCostUSD = parseFloat(result?.total || 0);
    const dailyCostSAR = dailyCostUSD * 3.75;
    const monthlyProjection = dailyCostSAR * 30;

    if (monthlyProjection > 400) {
      console.warn(
        `⚠️  AI Cost Alert: Daily spend ${dailyCostSAR.toFixed(2)} SAR → ` +
        `Projected monthly cost is ${monthlyProjection.toFixed(2)} SAR (threshold: 400 SAR)`
      );
      // TODO: Insert into notifications table or send email to admin
    }

    return { dailyCostUSD, dailyCostSAR, monthlyProjection };
  } catch {
    // Table may not exist yet
    return { dailyCostUSD: 0, dailyCostSAR: 0, monthlyProjection: 0 };
  }
}

module.exports = { checkDailyCost };
