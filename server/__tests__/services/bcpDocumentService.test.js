describe('BCP Document Service', () => {
  let generateBCPDocument;

  beforeAll(() => {
    generateBCPDocument = require('../../services/bcpDocumentService').generateBCPDocument;
  });

  it('should be a function', () => {
    expect(typeof generateBCPDocument).toBe('function');
  });

  it('should generate a buffer from minimal plan data', async () => {
    const minimalPlan = {
      id: 'BCP-2026-TEST',
      title_ar: 'خطة اختبارية',
      title_en: 'Test Plan',
      disruption_scenario: 'سيناريو اختباري',
      scope_type: 'DEPARTMENT',
      department_name_ar: 'تقنية المعلومات',
      classification: 'CONFIDENTIAL',
      status: 'DRAFT',
      version: '1.0',
      critical_processes: '[]',
      critical_assets: '[]',
      activation_criteria: '[]',
      crisis_management_team: '[]',
      recovery_teams: '[]',
      communication_plan: '{}',
      recovery_procedures: '[]',
      required_resources: '[]',
      testing_schedule: '[]',
      created_at: new Date().toISOString(),
      creator_name_ar: 'مختبر',
    };

    const buffer = await generateBCPDocument(minimalPlan);
    
    // Should return a Buffer
    expect(Buffer.isBuffer(buffer)).toBe(true);
    
    // DOCX files start with PK zip header
    expect(buffer[0]).toBe(0x50); // P
    expect(buffer[1]).toBe(0x4B); // K
    
    // Should have meaningful size (empty DOCX is ~10KB+)
    expect(buffer.length).toBeGreaterThan(5000);
  });

  it('should handle plan with processes and assets', async () => {
    const planWithData = {
      id: 'BCP-2026-002',
      title_ar: 'خطة مع بيانات',
      disruption_scenario: 'هجوم سيبراني',
      scope_type: 'ORGANIZATION',
      classification: 'CONFIDENTIAL',
      status: 'APPROVED',
      version: '2.0',
      critical_processes: JSON.stringify([
        { id: 'PRC-001', process_name: 'البريد الإلكتروني', rto_hours: 1, rpo_hours: 0.5, mtpd_hours: 2, priority: 'حرج' },
        { id: 'PRC-002', process_name: 'إدارة الهويات', rto_hours: 4, rpo_hours: 2, mtpd_hours: 8, priority: 'عالي' },
      ]),
      critical_assets: JSON.stringify([
        { asset_name: 'Exchange Server', asset_type: 'IT_SYSTEM', rto_hours: 1, alternative: 'Cloud Failover' },
      ]),
      activation_criteria: JSON.stringify([
        { type: 'cyber', description: 'هجوم فدية', threshold: '> 2 أنظمة' },
      ]),
      crisis_management_team: JSON.stringify([
        { role: 'قائد الأزمات', name: 'أحمد', phone: '+966XXXXXXX', responsibilities: 'القيادة' },
      ]),
      recovery_teams: '[]',
      communication_plan: '{}',
      recovery_procedures: JSON.stringify([
        { action: 'عزل الأنظمة', responsible: 'فريق IT', timeline: '30 دقيقة' },
      ]),
      required_resources: JSON.stringify([
        { type: 'أجهزة', description: 'خوادم احتياطية', quantity: '3' },
      ]),
      testing_schedule: JSON.stringify([
        { test_type: 'TABLETOP', frequency: 'ربع سنوي', last_tested: null, next_test: null },
      ]),
      created_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
      creator_name_ar: 'أحمد',
      approver_name_ar: 'خالد',
    };

    const buffer = await generateBCPDocument(planWithData);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(10000);
  });
});
