/**
 * BCP DOCX Generator — Client-Side ISO 22301 Compliant Arabic Document
 * Generates professional Word documents directly in the browser.
 * Uses the `docx` npm package (already in frontend dependencies).
 */
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageBreak, LevelFormat, PageNumber
} from 'docx';

// ─── Styling Constants ────────────────────────────────────────────────────────
const NAVY = '1B3A5C';
const BLUE = '2E75B6';
const CYAN = '0891B2';
const WHITE = 'FFFFFF';
const LIGHT_BG = 'F0F4F8';
const RED = 'DC2626';

const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const headerShading = { fill: NAVY, type: ShadingType.CLEAR };
const altShading = { fill: LIGHT_BG, type: ShadingType.CLEAR };

const PAGE_WIDTH = 11906;
const MARGIN = 1440;
const CONTENT_WIDTH = PAGE_WIDTH - (2 * MARGIN);

// ─── Helper Functions ─────────────────────────────────────────────────────────
const parse = (field) => {
  try {
    if (!field) return [];
    if (typeof field === 'object') return field;
    return JSON.parse(field);
  } catch { return []; }
};

const formatDate = (date) => {
  if (!date) return '—';
  try { return new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return String(date); }
};

const translateStatus = (s) => ({
  'DRAFT': 'مسودة', 'UNDER_REVIEW': 'قيد المراجعة', 'APPROVED': 'معتمدة',
  'ACTIVE': 'مُفعّلة', 'EXPIRED': 'منتهية', 'ARCHIVED': 'مؤرشفة'
}[s] || s || '—');

const translateAssetType = (t) => ({
  'IT_SYSTEM': 'نظام تقني', 'APPLICATION': 'تطبيق', 'FACILITY': 'مرفق',
  'EQUIPMENT': 'معدات', 'KEY_PERSONNEL': 'كوادر رئيسية', 'VENDOR': 'مورد',
  'DATA': 'أصول بيانات', 'DOCUMENT': 'وثيقة'
}[t] || t || '—');

// ─── Table Row Builders ───────────────────────────────────────────────────────
const makeHeaderRow = (cells, colWidths) => new TableRow({
  children: cells.map((text, i) => new TableCell({
    borders, width: { size: colWidths[i], type: WidthType.DXA }, shading: headerShading,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text, bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
  }))
});

const makeDataRow = (cells, colWidths, isAlt = false) => new TableRow({
  children: cells.map((text, i) => new TableCell({
    borders, width: { size: colWidths[i], type: WidthType.DXA },
    shading: isAlt ? altShading : undefined,
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [new Paragraph({ alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: String(text || '—'), size: 20, font: 'Arial' })] })]
  }))
});

const makeKeyValueRow = (label, value) => new TableRow({
  children: [
    new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, shading: headerShading,
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({ alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: label, bold: true, size: 20, color: WHITE, font: 'Arial' })] })] }),
    new TableCell({ borders, width: { size: CONTENT_WIDTH - 3000, type: WidthType.DXA },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({ alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: String(value || '—'), size: 20, font: 'Arial' })] })] })
  ]
});

// ─── Paragraph Builders ───────────────────────────────────────────────────────
const heading1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1, alignment: AlignmentType.RIGHT,
  spacing: { before: 400, after: 200 },
  children: [new TextRun({ text, size: 32, bold: true, color: NAVY, font: 'Arial' })]
});

const heading2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2, alignment: AlignmentType.RIGHT,
  spacing: { before: 300, after: 150 },
  children: [new TextRun({ text, size: 26, bold: true, color: BLUE, font: 'Arial' })]
});

const bodyText = (text) => new Paragraph({
  alignment: AlignmentType.RIGHT, spacing: { after: 120, line: 360 },
  children: [new TextRun({ text, size: 22, font: 'Arial' })]
});

const bulletItem = (text, ref = 'bullets') => new Paragraph({
  numbering: { reference: ref, level: 0 }, alignment: AlignmentType.RIGHT,
  spacing: { after: 80 },
  children: [new TextRun({ text, size: 22, font: 'Arial' })]
});

const numberedItem = (text) => bulletItem(text, 'numbers');

const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════
export async function generateBCPDocx(plan) {
  const criticalProcesses = parse(plan.critical_processes);
  const criticalAssets = parse(plan.critical_assets);
  const activationCriteria = parse(plan.activation_criteria);
  const cmt = parse(plan.crisis_management_team);
  const testingSchedule = parse(plan.testing_schedule);

  const shortestRTO = Array.isArray(criticalProcesses) && criticalProcesses.length > 0
    ? Math.min(...criticalProcesses.map(p => p.rto_hours || 999)) : null;

  // Default CMT if empty
  const cmtMembers = Array.isArray(cmt) && cmt.length > 0 ? cmt : [
    { role: 'قائد فريق الأزمات', name: '[يُعبأ]', phone: '[يُعبأ]', responsibilities: 'القيادة العامة واتخاذ القرارات الاستراتيجية' },
    { role: 'منسق استمرارية الأعمال', name: '[يُعبأ]', phone: '[يُعبأ]', responsibilities: 'تنسيق تفعيل الخطة وإدارة عمليات التعافي' },
    { role: 'مسؤول تقنية المعلومات', name: '[يُعبأ]', phone: '[يُعبأ]', responsibilities: 'التعافي التقني واستعادة الأنظمة' },
    { role: 'مسؤول الاتصالات', name: '[يُعبأ]', phone: '[يُعبأ]', responsibilities: 'إدارة الاتصالات الداخلية والخارجية' },
    { role: 'المستشار القانوني', name: '[يُعبأ]', phone: '[يُعبأ]', responsibilities: 'الإرشاد القانوني والامتثال التنظيمي' },
    { role: 'مسؤول الموارد البشرية', name: '[يُعبأ]', phone: '[يُعبأ]', responsibilities: 'سلامة الموظفين وترتيبات العمل البديلة' }
  ];

  const activCriteria = Array.isArray(activationCriteria) && activationCriteria.length > 0
    ? activationCriteria.map(c => c.description || c.type || c)
    : [
      'تجاوز وقت التعطل لأي عملية حيوية عن 50% من هدف زمن التعافي (RTO)',
      'فقدان الوصول الكامل للمرافق الرئيسية لأكثر من ساعتين',
      'حادث سيبراني يؤثر على أنظمة حيوية متعددة',
      'كارثة طبيعية تؤثر على البنية التحتية',
      'فقدان مورد حرج بدون بديل فوري متاح',
      'طلب صريح من الإدارة العليا بناءً على تقييم الوضع'
    ];

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Arial', size: 22 } } }
    },
    numbering: {
      config: [
        { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        { reference: 'checklist', levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2610', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      ]
    },
    sections: [
      // ══════════════════════════════════════════════════════════════════
      // COVER PAGE
      // ══════════════════════════════════════════════════════════════════
      {
        properties: { page: { size: { width: PAGE_WIDTH, height: 16838 }, margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN } } },
        children: [
          new Paragraph({ spacing: { before: 600 } }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
            children: [new TextRun({ text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', size: 16, color: 'D1D5DB' })] }),
          new Paragraph({ alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'سري — للاستخدام الداخلي فقط', size: 22, color: RED, bold: true })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
            children: [new TextRun({ text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', size: 16, color: 'D1D5DB' })] }),

          new Paragraph({ spacing: { before: 800 } }),
          new Paragraph({ alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'خطة استمرارية الأعمال', size: 52, bold: true, color: NAVY, font: 'Arial' })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 100 },
            children: [new TextRun({ text: 'Business Continuity Plan (BCP)', size: 28, color: '6B7280', italics: true })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80 },
            children: [new TextRun({ text: 'متوافقة مع معيار ISO 22301:2019 — البند 8.4', size: 20, color: CYAN })] }),

          new Paragraph({ spacing: { before: 400 } }),
          new Paragraph({ alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: '━━━━━━━━━━━━━━━━━━━━━━━', size: 16, color: CYAN })] }),
          new Paragraph({ spacing: { before: 200 } }),

          new Paragraph({ alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: plan.title_ar || 'خطة استمرارية الأعمال', size: 36, bold: true, color: BLUE })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 150 },
            children: [new TextRun({ text: `سيناريو التعطل: ${plan.disruption_scenario || '—'}`, size: 24, color: '6B7280' })] }),

          new Paragraph({ spacing: { before: 600 } }),
          new Table({ width: { size: 7000, type: WidthType.DXA }, columnWidths: [2500, 4500], rows: [
            makeKeyValueRow('رقم الخطة', plan.id),
            makeKeyValueRow('الإصدار', plan.version || '1.0'),
            makeKeyValueRow('التصنيف', plan.classification === 'CONFIDENTIAL' ? 'سري' : plan.classification === 'SECRET' ? 'سري للغاية' : 'داخلي'),
            makeKeyValueRow('الإدارة', plan.department_name_ar || 'على مستوى المنظمة'),
            makeKeyValueRow('الحالة', translateStatus(plan.status)),
            makeKeyValueRow('تاريخ الإنشاء', formatDate(plan.created_at)),
            makeKeyValueRow('التاريخ', formatDate(plan.approved_at)),
            makeKeyValueRow('المراجعة القادمة', plan.next_review_date ? formatDate(plan.next_review_date) : '—'),
          ]}),

          new Paragraph({ spacing: { before: 600 } }),
          new Paragraph({ alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `منصة Khalid Resilience — ${new Date().getFullYear()}`, size: 18, color: '9CA3AF' })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 },
            children: [new TextRun({ text: 'تم إنشاء هذه الوثيقة آلياً وفق معيار ISO 22301:2019', size: 16, color: '9CA3AF' })] }),
        ]
      },

      // ══════════════════════════════════════════════════════════════════
      // CONTENT SECTIONS
      // ══════════════════════════════════════════════════════════════════
      {
        properties: { page: { size: { width: PAGE_WIDTH, height: 16838 }, margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN } } },
        headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: CYAN, space: 8 } }, children: [new TextRun({ text: `خطة BCP — ${plan.id} — ${plan.title_ar || ''}`, size: 16, color: '9CA3AF', font: 'Arial' })] })] }) },
        footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 2, color: 'E5E7EB', space: 8 } }, children: [new TextRun({ text: 'سري — Khalid Resilience — صفحة ', size: 14, color: '9CA3AF' }), new TextRun({ children: [PageNumber.CURRENT], size: 14, color: '9CA3AF' })] })] }) },
        children: [
          // TABLE OF CONTENTS
          heading1('فهرس المحتويات'),
          ...['1. الغرض والنطاق والأهداف', '2. التعريفات والمراجع المعيارية', '3. معايير تفعيل الخطة ومستوياتها', '4. الهيكل التنظيمي وفريق إدارة الأزمات', '5. خطة الاتصالات', '6. العمليات الحيوية المشمولة', '7. الأصول الحرجة الداعمة', '8. إجراءات الاستجابة والتعافي', '9. الموارد المطلوبة', '10. خطة الاختبار والتمارين', '11. صيانة الخطة ومراجعتها', '12. الملاحق'].map(t => new Paragraph({ spacing: { before: 100, after: 60 }, alignment: AlignmentType.RIGHT, children: [new TextRun({ text: t, size: 22, font: 'Arial' })] })),

          pageBreak(),

          // ═══ 1. PURPOSE & SCOPE ═══
          heading1('1. الغرض والنطاق والأهداف'),
          heading2('1.1 الغرض'),
          bodyText(`تحدد هذه الخطة الإجراءات والترتيبات اللازمة لضمان استمرارية العمليات الحيوية عند حدوث سيناريو "${plan.disruption_scenario || 'تعطل محدد'}". تم إعدادها وفقاً لمتطلبات ISO 22301:2019 — البند 8.4.`),
          heading2('1.2 النطاق'),
          bodyText(`تغطي الخطة ${plan.scope_type === 'DEPARTMENT' ? `إدارة ${plan.department_name_ar || 'محددة'}` : 'المنظمة بالكامل'}. تشمل ${criticalProcesses.length} عملية حيوية و ${criticalAssets.length} أصل حرج.`),
          heading2('1.3 الأهداف'),
          numberedItem('حماية سلامة الموظفين والزوار كأولوية قصوى'),
          numberedItem(`استعادة العمليات الحيوية خلال الإطار الزمني المحدد (أقصر RTO: ${shortestRTO ? shortestRTO + ' ساعة' : 'غير محدد'})`),
          numberedItem('تقليل الأثر المالي والتشغيلي للتعطل'),
          numberedItem('الامتثال للمتطلبات التنظيمية السعودية (NCA ECC, SAMA BCM)'),
          numberedItem('الحفاظ على ثقة أصحاب المصلحة والعملاء'),
          numberedItem('توثيق الدروس المستفادة وتحسين الخطة وفق دورة PDCA'),

          pageBreak(),

          // ═══ 2. DEFINITIONS ═══
          heading1('2. التعريفات والمراجع المعيارية'),
          heading2('2.1 التعريفات'),
          new Table({ width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: [1200, CONTENT_WIDTH - 1200], rows: [
            makeHeaderRow(['المصطلح', 'التعريف'], [1200, CONTENT_WIDTH - 1200]),
            makeDataRow(['BCP', 'خطة استمرارية الأعمال — ISO 22301 البند 3.5'], [1200, CONTENT_WIDTH - 1200]),
            makeDataRow(['BIA', 'تحليل تأثير الأعمال — ISO 22301 البند 8.2.2'], [1200, CONTENT_WIDTH - 1200], true),
            makeDataRow(['RTO', 'هدف زمن التعافي — أقصى مدة لاستعادة العملية'], [1200, CONTENT_WIDTH - 1200]),
            makeDataRow(['RPO', 'هدف نقطة التعافي — أقصى حجم فقدان بيانات مقبول'], [1200, CONTENT_WIDTH - 1200], true),
            makeDataRow(['MTPD', 'أقصى فترة تعطل مقبولة'], [1200, CONTENT_WIDTH - 1200]),
            makeDataRow(['CMT', 'فريق إدارة الأزمات'], [1200, CONTENT_WIDTH - 1200], true),
          ]}),
          heading2('2.2 المراجع المعيارية'),
          bulletItem('ISO 22301:2019 — أنظمة إدارة استمرارية الأعمال'),
          bulletItem('ISO 31000:2018 — إدارة المخاطر'),
          bulletItem('NCA ECC — ضوابط الأمن السيبراني السعودية'),
          bulletItem('SAMA BCM — إطار استمرارية الأعمال'),

          pageBreak(),

          // ═══ 3. ACTIVATION CRITERIA ═══
          heading1('3. معايير تفعيل الخطة ومستوياتها'),
          heading2('3.1 معايير التفعيل'),
          bodyText('يتم تفعيل الخطة عند تحقق واحد أو أكثر من المعايير التالية:'),
          ...activCriteria.map(c => numberedItem(String(c))),

          heading2('3.2 مستويات التفعيل'),
          new Table({ width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: [2200, 3500, 1800, 1526], rows: [
            makeHeaderRow(['المستوى', 'الوصف', 'الإطار الزمني', 'الحالة'], [2200, 3500, 1800, 1526]),
            makeDataRow(['المستوى 1 — استنفار', 'مراقبة مكثفة وتجهيز فريق الأزمات', 'أقل من 1 ساعة', '🟡 تأهب'], [2200, 3500, 1800, 1526]),
            makeDataRow(['المستوى 2 — تفعيل جزئي', 'تفعيل إجراءات التعافي للعمليات الأكثر حرجاً', '1 — 4 ساعات', '🟠 جزئي'], [2200, 3500, 1800, 1526], true),
            makeDataRow(['المستوى 3 — تفعيل كامل', 'تفعيل الخطة بالكامل مع جميع فرق التعافي', 'أكثر من 4 ساعات', '🔴 كامل'], [2200, 3500, 1800, 1526]),
          ]}),

          pageBreak(),

          // ═══ 4. CRISIS MANAGEMENT TEAM ═══
          heading1('4. فريق إدارة الأزمات'),
          bodyText('فريق إدارة الأزمات مسؤول عن القرارات الاستراتيجية أثناء الأزمة:'),
          new Table({ width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: [2000, 1600, 1600, 3826], rows: [
            makeHeaderRow(['الدور', 'الاسم', 'الهاتف', 'المسؤوليات'], [2000, 1600, 1600, 3826]),
            ...cmtMembers.map((m, i) => makeDataRow([m.role || '—', m.name || '[يُعبأ]', m.phone || '[يُعبأ]', m.responsibilities || '—'], [2000, 1600, 1600, 3826], i % 2 === 1))
          ]}),

          pageBreak(),

          // ═══ 5. COMMUNICATION PLAN ═══
          heading1('5. خطة الاتصالات'),
          heading2('5.1 الاتصالات الداخلية'),
          numberedItem('إبلاغ فريق إدارة الأزمات فور اكتشاف الحادث (خلال 15 دقيقة)'),
          numberedItem('إبلاغ الموظفين المتأثرين عبر البريد الإلكتروني والرسائل النصية'),
          numberedItem('تحديث منتظم كل ساعة لأصحاب المصلحة الداخليين'),
          numberedItem('إنشاء قناة اتصال طوارئ مخصصة'),
          heading2('5.2 الاتصالات الخارجية'),
          numberedItem('إبلاغ NCA خلال 48 ساعة للحوادث السيبرانية'),
          numberedItem('إبلاغ SAMA حسب المتطلبات — للمؤسسات المالية'),
          numberedItem('التواصل مع الموردين المتأثرين'),
          numberedItem('إعداد بيان صحفي رسمي إن لزم الأمر'),

          pageBreak(),

          // ═══ 6. CRITICAL PROCESSES ═══
          heading1('6. العمليات الحيوية المشمولة'),
          bodyText(`تشمل الخطة ${criticalProcesses.length} عملية حيوية:`),
          ...(criticalProcesses.length > 0 ? [
            new Table({ width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: [3200, 1200, 1200, 1200, 2226], rows: [
              makeHeaderRow(['العملية الحيوية', 'RTO', 'RPO', 'MTPD', 'الأولوية'], [3200, 1200, 1200, 1200, 2226]),
              ...criticalProcesses.map((p, i) => makeDataRow(
                [p.process_name || '—', p.rto_hours ? `${p.rto_hours} ساعة` : '—', p.rpo_hours ? `${p.rpo_hours} ساعة` : '—', p.mtpd_hours ? `${p.mtpd_hours} ساعة` : '—', p.priority || '—'],
                [3200, 1200, 1200, 1200, 2226], i % 2 === 1
              ))
            ]}),
          ] : [bodyText('⚠️ لم يتم ربط عمليات BIA بهذه الخطة.')]),

          pageBreak(),

          // ═══ 7. CRITICAL ASSETS ═══
          heading1('7. الأصول الحرجة الداعمة'),
          ...(criticalAssets.length > 0 ? [
            new Table({ width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: [2800, 1400, 1200, 3626], rows: [
              makeHeaderRow(['الأصل', 'النوع', 'RTO', 'البديل'], [2800, 1400, 1200, 3626]),
              ...criticalAssets.map((a, i) => makeDataRow(
                [a.asset_name || '—', translateAssetType(a.asset_type), a.rto_hours ? `${a.rto_hours} ساعة` : '—', a.alternative || '—'],
                [2800, 1400, 1200, 3626], i % 2 === 1
              ))
            ]}),
          ] : [bodyText('⚠️ لم يتم ربط أصول BIA بهذه الخطة.')]),

          pageBreak(),

          // ═══ 8. RECOVERY PROCEDURES ═══
          heading1('8. إجراءات الاستجابة والتعافي'),
          heading2('8.1 المرحلة الأولى: الاستجابة الفورية (0 — 2 ساعة)'),
          numberedItem('التأكد من سلامة جميع الموظفين والزوار'),
          numberedItem('تقييم نطاق التعطل الأولي'),
          numberedItem('تفعيل فريق إدارة الأزمات وعقد اجتماع طوارئ خلال 30 دقيقة'),
          numberedItem('إبلاغ الإدارة العليا بملخص الوضع'),
          numberedItem('عزل الأنظمة المتأثرة لمنع انتشار الضرر'),
          numberedItem('توثيق الحادث مع طابع زمني دقيق'),
          heading2('8.2 المرحلة الثانية: التعافي القصير (2 — 24 ساعة)'),
          numberedItem('تفعيل موقع العمل البديل'),
          numberedItem('بدء استعادة الأنظمة حسب أولوية RTO'),
          numberedItem('تفعيل اتفاقيات الموردين البديلين'),
          numberedItem('مراقبة مستمرة لعملية التعافي'),
          numberedItem('تحديثات دورية لأصحاب المصلحة'),
          heading2('8.3 المرحلة الثالثة: استعادة كاملة (24 — 72 ساعة)'),
          numberedItem('استعادة جميع الأنظمة والعمليات بنسبة 100%'),
          numberedItem('التحقق من سلامة البيانات واكتمالها'),
          numberedItem('اختبار شامل لجميع الأنظمة المُستعادة'),
          numberedItem('إلغاء تفعيل الخطة رسمياً'),
          numberedItem('بدء مراجعة ما بعد الحادث خلال 5 أيام عمل'),

          pageBreak(),

          // ═══ 9. RESOURCES ═══
          heading1('9. الموارد المطلوبة'),
          heading2('9.1 موارد تقنية'),
          bulletItem('موقع التعافي من الكوارث (DR Site)'),
          bulletItem('خوادم احتياطية وبنية تحتية بديلة'),
          bulletItem('نسخ احتياطية محدّثة من البيانات الحيوية'),
          bulletItem('اتصال إنترنت احتياطي'),
          heading2('9.2 موارد بشرية'),
          bulletItem('قائمة موظفين بديلين لكل منصب حيوي'),
          bulletItem('اتفاقيات عمل عن بُعد مُفعّلة'),
          bulletItem('عقود استشاريين خارجيين للطوارئ'),
          heading2('9.3 موارد مالية ومادية'),
          bulletItem('موقع عمل بديل مجهز'),
          bulletItem('ميزانية طوارئ معتمدة'),
          bulletItem('قائمة موردين بديلين'),

          pageBreak(),

          // ═══ 10. TESTING ═══
          heading1('10. خطة الاختبار والتمارين'),
          new Table({ width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: [2500, 1800, 2200, 2526], rows: [
            makeHeaderRow(['نوع الاختبار', 'الدورية', 'آخر اختبار', 'الاختبار القادم'], [2500, 1800, 2200, 2526]),
            makeDataRow(['مراجعة وثائقية', 'ربع سنوي', testingSchedule[0]?.last_tested ? formatDate(testingSchedule[0].last_tested) : 'لم يُختبر', 'يُحدد بعد الاعتماد'], [2500, 1800, 2200, 2526]),
            makeDataRow(['تمرين طاولة', 'نصف سنوي', 'لم يُختبر', 'يُحدد بعد الاعتماد'], [2500, 1800, 2200, 2526], true),
            makeDataRow(['تمرين شامل', 'سنوي', 'لم يُنفذ', 'يُحدد بعد الاعتماد'], [2500, 1800, 2200, 2526]),
          ]}),

          pageBreak(),

          // ═══ 11. MAINTENANCE ═══
          heading1('11. صيانة الخطة ومراجعتها'),
          numberedItem('تُراجع الخطة سنوياً أو عند حدوث تغيير جوهري'),
          numberedItem('تحديث الخطة بعد كل اختبار أو تفعيل'),
          numberedItem('تحديث فريق الأزمات كل ربع سنة'),
          numberedItem('مراجعة RTO/RPO سنوياً'),
          numberedItem('اعتماد التعديلات الجوهرية من CISO أو CEO'),

          pageBreak(),

          // ═══ 12. APPENDICES ═══
          heading1('12. الملاحق'),
          heading2('12.1 قائمة التحقق عند التفعيل'),
          ...['التأكد من سلامة الموظفين والزوار', 'إبلاغ قائد فريق الأزمات', 'تقييم نطاق التعطل', 'تحديد مستوى التفعيل', 'تفعيل قنوات الاتصال الطارئة', 'إبلاغ الإدارة العليا', 'إبلاغ الجهات التنظيمية', 'تفعيل موقع العمل البديل', 'بدء إجراءات التعافي حسب أولوية RTO', 'التحقق من سلامة النسخ الاحتياطية', 'إلغاء التفعيل رسمياً بعد التعافي', 'بدء مراجعة ما بعد الحادث']
            .map(item => new Paragraph({ numbering: { reference: 'checklist', level: 0 }, alignment: AlignmentType.RIGHT, spacing: { after: 60 }, children: [new TextRun({ text: item, size: 22, font: 'Arial' })] })),

          heading2('12.2 سجل مراجعات الخطة'),
          new Table({ width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: [1200, 1800, 2500, 3526], rows: [
            makeHeaderRow(['الإصدار', 'التاريخ', 'المُعد', 'وصف التعديل'], [1200, 1800, 2500, 3526]),
            makeDataRow([plan.version || '1.0', formatDate(plan.created_at), plan.creator_name_ar || '—', 'الإصدار الأولي — إنشاء آلي من منصة Khalid Resilience'], [1200, 1800, 2500, 3526]),
          ]}),

          new Paragraph({ spacing: { before: 800 } }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '━━━━━ نهاية الخطة ━━━━━', size: 20, color: '9CA3AF' })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100 },
            children: [new TextRun({ text: `تم إنشاء هذه الوثيقة آلياً بواسطة منصة Khalid Resilience — ${formatDate(new Date())}`, size: 16, color: '9CA3AF' })] }),
        ]
      }
    ]
  });

  const rawBlob = await Packer.toBlob(doc);
  return rawBlob;
}

/**
 * Download BCP plan as DOCX — fully client-side, no backend needed
 */
export async function downloadBCPDocx(plan) {
  const rawBlob = await generateBCPDocx(plan);
  
  // Re-wrap blob with explicit DOCX MIME type to ensure correct file association
  const docxBlob = new Blob([rawBlob], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
  
  // Use ASCII-only filename — Arabic chars in download attribute are unreliable
  const filename = `BCP-${plan.id}.docx`;
  
  const url = URL.createObjectURL(docxBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  
  // Delay cleanup so the browser has time to start the download
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 500);
}
