import { describe, it, expect } from 'vitest';
import { translations } from '../../data/translations';

describe('translations', () => {
  it('should export an object with translations', () => {
    expect(typeof translations).toBe('object');
    expect(Object.keys(translations).length).toBeGreaterThan(300);
  });

  it('every key should have both ar and en values', () => {
    const keys = Object.keys(translations);
    const missingAr = [];
    const missingEn = [];
    
    keys.forEach(key => {
      if (!translations[key].ar) missingAr.push(key);
      if (!translations[key].en) missingEn.push(key);
    });
    
    expect(missingAr).toEqual([]);
    expect(missingEn).toEqual([]);
  });

  it('should have navigation keys', () => {
    expect(translations['nav.dashboard']).toBeDefined();
    expect(translations['nav.dashboard'].ar).toBe('لوحة التحكم');
    expect(translations['nav.dashboard'].en).toBe('Dashboard');
  });

  it('should have BCP module keys', () => {
    expect(translations['bcp.title']).toBeDefined();
    expect(translations['bcp.newPlan']).toBeDefined();
    expect(translations['bcp.generateDocx']).toBeDefined();
  });

  it('should have common keys', () => {
    expect(translations['common.save']).toBeDefined();
    expect(translations['common.cancel']).toBeDefined();
    expect(translations['common.delete']).toBeDefined();
  });

  it('should have notification keys', () => {
    expect(translations['notif.title']).toBeDefined();
    expect(translations['notif.riskEscalated']).toBeDefined();
  });

  it('should have no duplicate keys', () => {
    // If there were duplicates, later keys would overwrite earlier ones
    // and the count would be less than expected
    const keys = Object.keys(translations);
    const unique = new Set(keys);
    expect(keys.length).toBe(unique.size);
  });
});
