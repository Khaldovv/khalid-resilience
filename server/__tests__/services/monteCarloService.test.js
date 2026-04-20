const { runSimulation, runPortfolioSimulation } = require('../../services/monteCarloService');

describe('Monte Carlo Service', () => {
  describe('runSimulation', () => {
    it('should produce valid statistics for a typical risk', () => {
      const result = runSimulation(100000, 500000, 1000000, 50, 5000);

      expect(result.simulation_runs).toBe(5000);
      expect(result.mean_loss_sar).toBeGreaterThan(0);
      expect(result.median_loss_sar).toBeGreaterThanOrEqual(0);
      expect(result.percentile_95_sar).toBeGreaterThan(result.median_loss_sar);
      expect(result.percentile_99_sar).toBeGreaterThanOrEqual(result.percentile_95_sar);
      expect(result.simulation_data).toHaveLength(20);
      expect(result.non_zero_count).toBeGreaterThan(0);
      expect(result.non_zero_count + result.zero_count).toBe(5000);
    });

    it('should handle 100% probability — all runs produce losses', () => {
      const result = runSimulation(1000, 5000, 10000, 100, 1000);

      expect(result.zero_count).toBe(0);
      expect(result.non_zero_count).toBe(1000);
      expect(result.mean_loss_sar).toBeGreaterThan(1000);
      expect(result.mean_loss_sar).toBeLessThan(10000);
    });

    it('should handle 0% probability — all zeros', () => {
      const result = runSimulation(1000, 5000, 10000, 0, 1000);

      expect(result.non_zero_count).toBe(0);
      expect(result.zero_count).toBe(1000);
      expect(result.mean_loss_sar).toBe(0);
    });

    it('should handle equal min/mode/max (fixed impact)', () => {
      const result = runSimulation(5000, 5000, 5000, 100, 500);

      expect(result.non_zero_count).toBe(500);
      // All values should be exactly 5000
      expect(result.mean_loss_sar).toBeCloseTo(5000, -1);
    });

    it('should produce histogram with 20 buckets', () => {
      const result = runSimulation(100000, 500000, 1000000, 80, 2000);

      expect(result.simulation_data).toHaveLength(20);
      const totalCount = result.simulation_data.reduce((s, b) => s + b.count, 0);
      expect(totalCount).toBe(2000);

      // Each bucket should have label property
      result.simulation_data.forEach(bucket => {
        expect(bucket).toHaveProperty('label');
        expect(bucket).toHaveProperty('count');
        expect(bucket).toHaveProperty('bucket');
        expect(bucket).toHaveProperty('bucket_max');
      });
    });

    it('should have ALE equal to mean', () => {
      const result = runSimulation(100000, 500000, 1000000, 50, 3000);
      expect(result.annualized_loss_expectancy_sar).toBe(result.mean_loss_sar);
    });

    it('should have VaR@95 equal to P95', () => {
      const result = runSimulation(100000, 500000, 1000000, 50, 3000);
      expect(result.var_95_sar).toBe(result.percentile_95_sar);
    });
  });

  describe('runPortfolioSimulation', () => {
    const sampleRisks = [
      { min_impact_sar: 50000, most_likely_impact_sar: 200000, max_impact_sar: 500000, probability_pct: 40 },
      { min_impact_sar: 10000, most_likely_impact_sar: 50000, max_impact_sar: 150000, probability_pct: 60 },
      { min_impact_sar: 100000, most_likely_impact_sar: 300000, max_impact_sar: 800000, probability_pct: 20 },
    ];

    it('should produce valid portfolio statistics', () => {
      const result = runPortfolioSimulation(sampleRisks, 2000);

      expect(result.risk_count).toBe(3);
      expect(result.total_ale_sar).toBeGreaterThan(0);
      expect(result.portfolio_var_95_sar).toBeGreaterThan(0);
      expect(result.portfolio_var_99_sar).toBeGreaterThanOrEqual(result.portfolio_var_95_sar);
      expect(result.simulation_data).toHaveLength(20);
    });

    it('should handle empty risk array', () => {
      const result = runPortfolioSimulation([], 1000);

      expect(result.risk_count).toBe(0);
      expect(result.total_ale_sar).toBe(0);
    });

    it('should produce higher ALE with more risks', () => {
      const oneRisk = runPortfolioSimulation([sampleRisks[0]], 3000);
      const threeRisks = runPortfolioSimulation(sampleRisks, 3000);

      // With more risks, total ALE should generally be higher
      expect(threeRisks.total_ale_sar).toBeGreaterThan(oneRisk.total_ale_sar);
    });
  });
});
