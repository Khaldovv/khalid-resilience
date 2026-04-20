import { describe, it, expect } from 'vitest';
import { getRiskLevel, getNextRiskId, getLabels } from '../../components/risk/AddRiskModal/riskFormUtils';

describe('getRiskLevel', () => {
  it.each([
    [1, 1, 1, 'Very Low'],
    [1, 4, 4, 'Very Low'],
    [1, 5, 5, 'Low'],
    [2, 3, 6, 'Low'],
    [2, 5, 10, 'Medium'],
    [3, 4, 12, 'Medium'],
    [3, 5, 15, 'High'],
    [4, 4, 16, 'High'],
    [4, 5, 20, 'Catastrophic'],
    [5, 5, 25, 'Catastrophic'],
  ])('likelihood=%i impact=%i → score=%i → %s', (l, i, expectedScore, expectedLabel) => {
    const result = getRiskLevel(l, i);
    expect(result.score).toBe(expectedScore);
    expect(result.label.en).toBe(expectedLabel);
  });

  it('should return bilingual labels', () => {
    const result = getRiskLevel(5, 5);
    expect(result.label.en).toBe('Catastrophic');
    expect(result.label.ar).toBe('كارثي');
  });

  it('should return color properties', () => {
    const result = getRiskLevel(3, 3);
    expect(result).toHaveProperty('color');
    expect(result).toHaveProperty('bg');
    expect(result).toHaveProperty('border');
    expect(result.color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('should handle minimum input (1×1)', () => {
    const result = getRiskLevel(1, 1);
    expect(result.score).toBe(1);
    expect(result.label.en).toBe('Very Low');
  });

  it('should enforce ISO 31000: residual ≤ inherent is possible', () => {
    const inherent = getRiskLevel(4, 4);
    const residual = getRiskLevel(2, 2);
    expect(residual.score).toBeLessThan(inherent.score);
  });
});

describe('getNextRiskId', () => {
  it('should return sequential IDs', () => {
    const id1 = getNextRiskId();
    const id2 = getNextRiskId();
    expect(id1).toMatch(/^RSK-\d+$/);
    expect(id2).toMatch(/^RSK-\d+$/);
    // Extract numbers and verify sequential
    const num1 = parseInt(id1.split('-')[1]);
    const num2 = parseInt(id2.split('-')[1]);
    expect(num2).toBe(num1 + 1);
  });
});

describe('getLabels', () => {
  it('should return Arabic labels when isAr=true', () => {
    const labels = getLabels(true);
    expect(labels.title).toBe('إضافة خطر جديد');
    expect(labels.save).toBe('حفظ الخطر');
    expect(labels.cancel).toBe('إلغاء');
  });

  it('should return English labels when isAr=false', () => {
    const labels = getLabels(false);
    expect(labels.title).toBe('Add New Risk');
    expect(labels.save).toBe('Save Risk');
    expect(labels.cancel).toBe('Cancel');
  });

  it('should have all expected keys', () => {
    const labels = getLabels(false);
    const requiredKeys = [
      'title', 'save', 'cancel', 'select', 'required', 'next', 'prev',
      'sec1', 'sec2', 'sec3', 'date', 'department', 'riskName', 'description',
      'riskType', 'likelihood', 'impact', 'riskLevel', 'owner', 'responseType',
    ];
    requiredKeys.forEach(key => {
      expect(labels).toHaveProperty(key);
      expect(labels[key]).toBeTruthy();
    });
  });
});
