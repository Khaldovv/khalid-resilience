const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, PageBreak, LevelFormat, PageNumber } = require('docx');

async function generateBCPDocument(plan) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
  const borders = { top: border, bottom: border, left: border, right: border };
  const headerBg = { fill: '1B3A5C', type: ShadingType.CLEAR };
  const altRowBg = { fill: 'F0F4F8', type: ShadingType.CLEAR };
  
  const criticalProcesses = JSON.parse(plan.critical_processes || '[]');
  const criticalAssets = JSON.parse(plan.critical_assets || '[]');
  const activationCriteria = JSON.parse(plan.activation_criteria || '[]');
  const cmt = JSON.parse(plan.crisis_management_team || '[]');
  const recoveryTeams = JSON.parse(plan.recovery_teams || '[]');
  const commPlan = JSON.parse(plan.communication_plan || '{}');
  const recoveryProcedures = JSON.parse(plan.recovery_procedures || '[]');
  const requiredResources = JSON.parse(plan.required_resources || '[]');
  const testingSchedule = JSON.parse(plan.testing_schedule || '[]');
  
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 22, rightToLeft: true }
        }
      },
      paragraphStyles: [
        {
          id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 32, bold: true, font: 'Arial', color: '1B3A5C' },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 }
        },
        {
          id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 26, bold: true, font: 'Arial', color: '2E75B6' },
          paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 }
        },
        {
          id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 24, bold: true, font: 'Arial', color: '404040' },
          paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 }
        }
      ]
    },
    numbering: {
      config: [
        {
          reference: 'numbered',
          levels: [{
            level: 0, format: LevelFormat.DECIMAL, text: '%1.',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }]
        },
        {
          reference: 'bullets',
          levels: [{
            level: 0, format: LevelFormat.BULLET, text: '\u2022',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }]
        }
      ]
    },
    sections: [
      // ===== COVER PAGE =====
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children: [
          new Paragraph({ spacing: { before: 3000 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: '\u0633\u0631\u064A \u2014 \u0644\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u062F\u0627\u062E\u0644\u064A \u0641\u0642\u0637', size: 20, color: 'FF0000', bold: true })]
          }),
          new Paragraph({ spacing: { before: 600 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: '\u062E\u0637\u0629 \u0627\u0633\u062A\u0645\u0631\u0627\u0631\u064A\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644', size: 48, bold: true, color: '1B3A5C' })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
            children: [new TextRun({ text: 'Business Continuity Plan (BCP)', size: 28, color: '666666', italics: true })]
          }),
          new Paragraph({ spacing: { before: 400 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: plan.title_ar, size: 36, bold: true, color: '2E75B6' })]
          }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `\u0633\u064A\u0646\u0627\u0631\u064A\u0648 \u0627\u0644\u062A\u0639\u0637\u0644: ${plan.disruption_scenario}`, size: 24, color: '666666' })]
          }),
          new Paragraph({ spacing: { before: 600 } }),
          
          // Document control table
          createInfoTable([
            ['\u0631\u0642\u0645 \u0627\u0644\u062E\u0637\u0629', plan.id],
            ['\u0627\u0644\u0625\u0635\u062F\u0627\u0631', plan.version],
            ['\u0627\u0644\u062A\u0635\u0646\u064A\u0641', plan.classification === 'CONFIDENTIAL' ? '\u0633\u0631\u064A' : plan.classification === 'SECRET' ? '\u0633\u0631\u064A \u0644\u0644\u063A\u0627\u064A\u0629' : '\u062F\u0627\u062E\u0644\u064A'],
            ['\u0627\u0644\u0625\u062F\u0627\u0631\u0629', plan.department_name_ar || '\u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0645\u0646\u0638\u0645\u0629'],
            ['\u0627\u0644\u062D\u0627\u0644\u0629', translateStatus(plan.status)],
            ['\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0646\u0634\u0627\u0621', formatDate(plan.created_at)],
            ['\u0623\u0639\u062F\u0647', plan.creator_name_ar || '\u2014'],
            ['\u0627\u0639\u062A\u0645\u062F\u0647', plan.approver_name_ar || '\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F'],
            ['\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F', plan.approved_at ? formatDate(plan.approved_at) : '\u2014'],
            ['\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0642\u0627\u062F\u0645\u0629', plan.next_review_date ? formatDate(plan.next_review_date) : '\u2014'],
          ], borders, headerBg),
          
          new Paragraph({
            spacing: { before: 600 },
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `\u0645\u0646\u0635\u0629 JAHIZIA \u2014 \u062c\u0627\u0647\u0632\u064a\u0629 \u2014 ${new Date().getFullYear()}`, size: 18, color: '999999' })]
          })
        ]
      },
      
      // ===== TABLE OF CONTENTS + ALL SECTIONS =====
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              children: [
                new TextRun({ text: `\u062E\u0637\u0629 BCP \u2014 ${plan.id}`, size: 16, color: '999999' }),
              ]
            })]
          })
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: '\u0635\u0641\u062D\u0629 ', size: 16, color: '999999' }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '999999' })
              ]
            })]
          })
        },
        children: [
          // TABLE OF CONTENTS
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('\u0641\u0647\u0631\u0633 \u0627\u0644\u0645\u062D\u062A\u0648\u064A\u0627\u062A')] }),
          
          ...['1. \u0627\u0644\u063A\u0631\u0636 \u0648\u0627\u0644\u0646\u0637\u0627\u0642', '2. \u0627\u0644\u062A\u0639\u0631\u064A\u0641\u0627\u062A \u0648\u0627\u0644\u0645\u0631\u0627\u062C\u0639', '3. \u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u062A\u0641\u0639\u064A\u0644',
              '4. \u0627\u0644\u0647\u064A\u0643\u0644 \u0627\u0644\u062A\u0646\u0638\u064A\u0645\u064A \u0648\u0641\u0631\u064A\u0642 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0632\u0645\u0627\u062A', '5. \u062E\u0637\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A',
              '6. \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629 \u0627\u0644\u0645\u0634\u0645\u0648\u0644\u0629', '7. \u0627\u0644\u0623\u0635\u0648\u0644 \u0627\u0644\u062D\u0631\u062C\u0629 \u0627\u0644\u062F\u0627\u0639\u0645\u0629',
              '8. \u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0648\u0627\u0644\u062A\u0639\u0627\u0641\u064A', '9. \u0627\u0644\u0645\u0648\u0627\u0631\u062F \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629',
              '10. \u062E\u0637\u0629 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0648\u0627\u0644\u062A\u0645\u0627\u0631\u064A\u0646', '11. \u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u062E\u0637\u0629 \u0648\u0645\u0631\u0627\u062C\u0639\u062A\u0647\u0627',
              '12. \u0627\u0644\u0645\u0644\u0627\u062D\u0642'].map(title => 
            new Paragraph({
              spacing: { before: 120 },
              children: [new TextRun({ text: title, size: 22 })]
            })
          ),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ===== SECTION 1: PURPOSE & SCOPE =====
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('1. \u0627\u0644\u063A\u0631\u0636 \u0648\u0627\u0644\u0646\u0637\u0627\u0642')] }),
          
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('1.1 \u0627\u0644\u063A\u0631\u0636')] }),
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({
              text: `\u062A\u062D\u062F\u062F \u0647\u0630\u0647 \u0627\u0644\u062E\u0637\u0629 \u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0648\u0627\u0644\u062A\u0631\u062A\u064A\u0628\u0627\u062A \u0627\u0644\u0644\u0627\u0632\u0645\u0629 \u0644\u0636\u0645\u0627\u0646 \u0627\u0633\u062A\u0645\u0631\u0627\u0631\u064A\u0629 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629 \u0648\u0633\u0631\u0639\u0629 \u0627\u0644\u062A\u0639\u0627\u0641\u064A \u0639\u0646\u062F \u062D\u062F\u0648\u062B \u0633\u064A\u0646\u0627\u0631\u064A\u0648 "${plan.disruption_scenario}". \u062A\u0645 \u0625\u0639\u062F\u0627\u062F \u0647\u0630\u0647 \u0627\u0644\u062E\u0637\u0629 \u0648\u0641\u0642\u0627\u064B \u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0639\u064A\u0627\u0631 ISO 22301:2019 \u0627\u0644\u0628\u0646\u062F 8.4\u060C \u0648\u062A\u0647\u062F\u0641 \u0625\u0644\u0649 \u062A\u0642\u0644\u064A\u0644 \u0623\u062B\u0631 \u0627\u0644\u062A\u0639\u0637\u0644 \u0639\u0644\u0649 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0648\u0627\u0644\u0633\u0645\u0639\u0629 \u0627\u0644\u0645\u0624\u0633\u0633\u064A\u0629.`,
              size: 22
            })]
          }),
          
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('1.2 \u0627\u0644\u0646\u0637\u0627\u0642')] }),
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({
              text: `\u062A\u063A\u0637\u064A \u0647\u0630\u0647 \u0627\u0644\u062E\u0637\u0629 ${plan.scope_type === 'DEPARTMENT' ? `\u0625\u062F\u0627\u0631\u0629 ${plan.department_name_ar || ''}` : plan.scope_type === 'ORGANIZATION' ? '\u0627\u0644\u0645\u0646\u0638\u0645\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644' : plan.scope_site || '\u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u062D\u062F\u062F'}. \u062A\u0634\u0645\u0644 \u0627\u0644\u062E\u0637\u0629 ${criticalProcesses.length} \u0639\u0645\u0644\u064A\u0629 \u062D\u064A\u0648\u064A\u0629 \u0648 ${criticalAssets.length} \u0623\u0635\u0644 \u062D\u0631\u062C \u062F\u0627\u0639\u0645\u060C \u0645\u0639 \u062A\u062D\u062F\u064A\u062F \u0623\u0647\u062F\u0627\u0641 \u0632\u0645\u0646 \u0627\u0644\u062A\u0639\u0627\u0641\u064A (RTO) \u0648\u0646\u0642\u0637\u0629 \u0627\u0644\u062A\u0639\u0627\u0641\u064A (RPO) \u0644\u0643\u0644 \u0639\u0645\u0644\u064A\u0629 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0646\u062A\u0627\u0626\u062C \u062A\u062D\u0644\u064A\u0644 \u062A\u0623\u062B\u064A\u0631 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 (BIA).`,
              size: 22
            })]
          }),
          
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('1.3 \u0627\u0644\u0623\u0647\u062F\u0627\u0641')] }),
          ...['\u062D\u0645\u0627\u064A\u0629 \u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646 \u0648\u0627\u0644\u0632\u0648\u0627\u0631 \u0643\u0623\u0648\u0644\u0648\u064A\u0629 \u0642\u0635\u0648\u0649',
              `\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629 \u062E\u0644\u0627\u0644 \u0627\u0644\u0625\u0637\u0627\u0631 \u0627\u0644\u0632\u0645\u0646\u064A \u0627\u0644\u0645\u062D\u062F\u062F (\u0623\u0642\u0635\u0631 RTO: ${criticalProcesses.length > 0 ? Math.min(...criticalProcesses.map(p => p.rto_hours || 999)) : '\u063A\u064A\u0631 \u0645\u062D\u062F\u062F'} \u0633\u0627\u0639\u0629)`,
              '\u062A\u0642\u0644\u064A\u0644 \u0627\u0644\u0623\u062B\u0631 \u0627\u0644\u0645\u0627\u0644\u064A \u0648\u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A \u0644\u0644\u062A\u0639\u0637\u0644 \u0625\u0644\u0649 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649',
              '\u0636\u0645\u0627\u0646 \u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644 \u0644\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0646\u0638\u064A\u0645\u064A\u0629 (NCA\u060C SAMA) \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0623\u0632\u0645\u0629',
              '\u0627\u0644\u062D\u0641\u0627\u0638 \u0639\u0644\u0649 \u062B\u0642\u0629 \u0623\u0635\u062D\u0627\u0628 \u0627\u0644\u0645\u0635\u0644\u062D\u0629 \u0648\u0627\u0644\u0639\u0645\u0644\u0627\u0621',
              '\u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u062F\u0631\u0648\u0633 \u0627\u0644\u0645\u0633\u062A\u0641\u0627\u062F\u0629 \u0648\u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u062E\u0637\u0629 \u0628\u0634\u0643\u0644 \u0645\u0633\u062A\u0645\u0631'
          ].map(obj => new Paragraph({
            numbering: { reference: 'bullets', level: 0 },
            children: [new TextRun({ text: obj, size: 22 })]
          })),
          
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('1.4 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0648\u0646 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641\u0648\u0646')] }),
          ...['\u0641\u0631\u064A\u0642 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0632\u0645\u0627\u062A (CMT)',
              '\u0645\u0646\u0633\u0642\u0648 \u0627\u0633\u062A\u0645\u0631\u0627\u0631\u064A\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644',
              '\u0645\u062F\u0631\u0627\u0621 \u0627\u0644\u0625\u062F\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0639\u0646\u064A\u0629',
              '\u0641\u0631\u0642 \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A \u0648\u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A',
              '\u0641\u0631\u064A\u0642 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u0645\u0624\u0633\u0633\u064A'
          ].map(user => new Paragraph({
            numbering: { reference: 'bullets', level: 0 },
            children: [new TextRun({ text: user, size: 22 })]
          })),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ===== SECTION 2: DEFINITIONS =====
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('2. \u0627\u0644\u062A\u0639\u0631\u064A\u0641\u0627\u062A \u0648\u0627\u0644\u0645\u0631\u0627\u062C\u0639')] }),
          
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('2.1 \u0627\u0644\u062A\u0639\u0631\u064A\u0641\u0627\u062A')] }),
          createDefinitionsTable(borders, headerBg),
          
          new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun('2.2 \u0627\u0644\u0645\u0631\u0627\u062C\u0639')] }),
          ...['ISO 22301:2019 \u2014 \u0623\u0646\u0638\u0645\u0629 \u0625\u062F\u0627\u0631\u0629 \u0627\u0633\u062A\u0645\u0631\u0627\u0631\u064A\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644',
              'ISO 31000:2018 \u2014 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u062E\u0627\u0637\u0631',
              'NCA ECC \u2014 \u0636\u0648\u0627\u0628\u0637 \u0627\u0644\u0623\u0645\u0646 \u0627\u0644\u0633\u064A\u0628\u0631\u0627\u0646\u064A',
              'SAMA BCM \u2014 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0633\u062A\u0645\u0631\u0627\u0631\u064A\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644',
              '\u0633\u064A\u0627\u0633\u0629 \u0627\u0633\u062A\u0645\u0631\u0627\u0631\u064A\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u0645\u0624\u0633\u0633\u064A\u0629',
              `\u062A\u062D\u0644\u064A\u0644 \u062A\u0623\u062B\u064A\u0631 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 (BIA) \u2014 ${plan.bia_assessment_id || '\u0645\u0631\u062A\u0628\u0637'}`
          ].map(ref => new Paragraph({
            numbering: { reference: 'bullets', level: 0 },
            children: [new TextRun({ text: ref, size: 22 })]
          })),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ===== SECTION 3: ACTIVATION CRITERIA =====
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('3. \u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u062A\u0641\u0639\u064A\u0644')] }),
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({
              text: '\u064A\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0647\u0630\u0647 \u0627\u0644\u062E\u0637\u0629 \u0639\u0646\u062F \u062A\u062D\u0642\u0642 \u0648\u0627\u062D\u062F \u0623\u0648 \u0623\u0643\u062B\u0631 \u0645\u0646 \u0627\u0644\u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u062A\u0627\u0644\u064A\u0629:',
              size: 22
            })]
          }),
          
          ...(activationCriteria.length > 0 
            ? activationCriteria.map(c => new Paragraph({
                numbering: { reference: 'numbered', level: 0 },
                children: [new TextRun({ text: `${c.description || c.type}: ${c.threshold || ''}`, size: 22 })]
              }))
            : [
                '\u062A\u062C\u0627\u0648\u0632 \u0648\u0642\u062A \u0627\u0644\u062A\u0639\u0637\u0644 \u0644\u0623\u064A \u0639\u0645\u0644\u064A\u0629 \u062D\u064A\u0648\u064A\u0629 \u0639\u0646 50% \u0645\u0646 \u0647\u062F\u0641 \u0632\u0645\u0646 \u0627\u0644\u062A\u0639\u0627\u0641\u064A (RTO)',
                '\u0641\u0642\u062F\u0627\u0646 \u0627\u0644\u0648\u0635\u0648\u0644 \u0627\u0644\u0643\u0627\u0645\u0644 \u0644\u0644\u0645\u0631\u0627\u0641\u0642 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0644\u0623\u0643\u062B\u0631 \u0645\u0646 \u0633\u0627\u0639\u062A\u064A\u0646',
                '\u062D\u0627\u062F\u062B \u0633\u064A\u0628\u0631\u0627\u0646\u064A \u064A\u0624\u062B\u0631 \u0639\u0644\u0649 \u0623\u0646\u0638\u0645\u0629 \u062D\u064A\u0648\u064A\u0629 \u0645\u062A\u0639\u062F\u062F\u0629',
                '\u0643\u0627\u0631\u062B\u0629 \u0637\u0628\u064A\u0639\u064A\u0629 \u062A\u0624\u062B\u0631 \u0639\u0644\u0649 \u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u062A\u062D\u062A\u064A\u0629',
                '\u0641\u0642\u062F\u0627\u0646 \u0645\u0648\u0631\u062F \u062D\u0631\u062C \u0628\u062F\u0648\u0646 \u0628\u062F\u064A\u0644 \u0641\u0648\u0631\u064A',
                '\u0637\u0644\u0628 \u0645\u0646 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0644\u064A\u0627 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0648\u0636\u0639'
              ].map(criteria => new Paragraph({
                numbering: { reference: 'numbered', level: 0 },
                children: [new TextRun({ text: criteria, size: 22 })]
              }))
          ),
          
          new Paragraph({
            spacing: { before: 200 },
            children: [new TextRun({ text: '\u0645\u0633\u062A\u0648\u064A\u0627\u062A \u0627\u0644\u062A\u0641\u0639\u064A\u0644:', size: 22, bold: true })]
          }),
          createActivationLevelsTable(borders, headerBg),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ===== SECTION 4: CRISIS MANAGEMENT TEAM =====
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('4. \u0627\u0644\u0647\u064A\u0643\u0644 \u0627\u0644\u062A\u0646\u0638\u064A\u0645\u064A \u0648\u0641\u0631\u064A\u0642 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0632\u0645\u0627\u062A')] }),
          
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('4.1 \u0641\u0631\u064A\u0642 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0632\u0645\u0627\u062A (CMT)')] }),
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({
              text: '\u0641\u0631\u064A\u0642 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0632\u0645\u0627\u062A \u0647\u0648 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u0639\u0646 \u0627\u062A\u062E\u0627\u0630 \u0627\u0644\u0642\u0631\u0627\u0631\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0623\u0632\u0645\u0629\u060C \u0628\u0645\u0627 \u0641\u064A \u0630\u0644\u0643 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u062E\u0637\u0629\u060C \u062A\u062E\u0635\u064A\u0635 \u0627\u0644\u0645\u0648\u0627\u0631\u062F\u060C \u0648\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0623\u0635\u062D\u0627\u0628 \u0627\u0644\u0645\u0635\u0644\u062D\u0629.',
              size: 22
            })]
          }),
          
          ...(cmt.length > 0 
            ? [createCMTTable(cmt, borders, headerBg)]
            : [createCMTTable([
                { role: '\u0642\u0627\u0626\u062F \u0641\u0631\u064A\u0642 \u0627\u0644\u0623\u0632\u0645\u0627\u062A', name: '[\u064A\u064F\u0639\u0628\u0623]', phone: '[\u064A\u064F\u0639\u0628\u0623]', responsibilities: '\u0627\u0644\u0642\u064A\u0627\u062F\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 \u0648\u0627\u062A\u062E\u0627\u0630 \u0627\u0644\u0642\u0631\u0627\u0631\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629' },
                { role: '\u0645\u0646\u0633\u0642 \u0627\u0633\u062A\u0645\u0631\u0627\u0631\u064A\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644', name: '[\u064A\u064F\u0639\u0628\u0623]', phone: '[\u064A\u064F\u0639\u0628\u0623]', responsibilities: '\u062A\u0646\u0633\u064A\u0642 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u062E\u0637\u0629 \u0648\u0625\u062F\u0627\u0631\u0629 \u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u062A\u0639\u0627\u0641\u064A' },
                { role: '\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A', name: '[\u064A\u064F\u0639\u0628\u0623]', phone: '[\u064A\u064F\u0639\u0628\u0623]', responsibilities: '\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0627\u0644\u062F\u0627\u062E\u0644\u064A\u0629 \u0648\u0627\u0644\u062E\u0627\u0631\u062C\u064A\u0629' },
                { role: '\u0645\u0633\u0624\u0648\u0644 \u062A\u0642\u0646\u064A\u0629 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A', name: '[\u064A\u064F\u0639\u0628\u0623]', phone: '[\u064A\u064F\u0639\u0628\u0623]', responsibilities: '\u0627\u0644\u062A\u0639\u0627\u0641\u064A \u0627\u0644\u062A\u0642\u0646\u064A \u0648\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u0623\u0646\u0638\u0645\u0629' },
                { role: '\u0627\u0644\u0645\u0633\u062A\u0634\u0627\u0631 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A', name: '[\u064A\u064F\u0639\u0628\u0623]', phone: '[\u064A\u064F\u0639\u0628\u0623]', responsibilities: '\u0627\u0644\u0625\u0631\u0634\u0627\u062F \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A \u0648\u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644 \u0627\u0644\u062A\u0646\u0638\u064A\u0645\u064A' },
                { role: '\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0645\u0648\u0627\u0631\u062F \u0627\u0644\u0628\u0634\u0631\u064A\u0629', name: '[\u064A\u064F\u0639\u0628\u0623]', phone: '[\u064A\u064F\u0639\u0628\u0623]', responsibilities: '\u0631\u0639\u0627\u064A\u0629 \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646 \u0648\u062A\u0631\u062A\u064A\u0628\u0627\u062A \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0628\u062F\u064A\u0644\u0629' }
              ], borders, headerBg)]
          ),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ===== SECTION 5: COMMUNICATION PLAN =====
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('5. \u062E\u0637\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A')] }),
          
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('5.1 \u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0627\u0644\u062F\u0627\u062E\u0644\u064A\u0629')] }),
          ...['\u0625\u0628\u0644\u0627\u063A \u0641\u0631\u064A\u0642 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0632\u0645\u0627\u062A \u0641\u0648\u0631 \u0627\u0643\u062A\u0634\u0627\u0641 \u0627\u0644\u062D\u0627\u062F\u062B (\u062E\u0644\u0627\u0644 15 \u062F\u0642\u064A\u0642\u0629)',
              '\u0625\u0628\u0644\u0627\u063A \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646 \u0627\u0644\u0645\u062A\u0623\u062B\u0631\u064A\u0646 \u0628\u0627\u0644\u062A\u0639\u0644\u064A\u0645\u0627\u062A \u0639\u0628\u0631 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0648\u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0646\u0635\u064A\u0629',
              '\u062A\u062D\u062F\u064A\u062B \u0645\u0646\u062A\u0638\u0645 \u0643\u0644 \u0633\u0627\u0639\u0629 \u0644\u062C\u0645\u064A\u0639 \u0623\u0635\u062D\u0627\u0628 \u0627\u0644\u0645\u0635\u0644\u062D\u0629 \u0627\u0644\u062F\u0627\u062E\u0644\u064A\u064A\u0646',
              '\u0625\u0646\u0634\u0627\u0621 \u0642\u0646\u0627\u0629 \u0627\u062A\u0635\u0627\u0644 \u0637\u0648\u0627\u0631\u0626 \u0645\u062E\u0635\u0635\u0629 (\u0645\u062C\u0645\u0648\u0639\u0629 \u0648\u0627\u062A\u0633\u0627\u0628 \u0623\u0648 Teams)'
          ].map(item => new Paragraph({
            numbering: { reference: 'numbered', level: 0 },
            children: [new TextRun({ text: item, size: 22 })]
          })),
          
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('5.2 \u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0627\u0644\u062E\u0627\u0631\u062C\u064A\u0629 \u0648\u0627\u0644\u062A\u0646\u0638\u064A\u0645\u064A\u0629')] }),
          ...['\u0625\u0628\u0644\u0627\u063A \u0627\u0644\u0647\u064A\u0626\u0629 \u0627\u0644\u0648\u0637\u0646\u064A\u0629 \u0644\u0644\u0623\u0645\u0646 \u0627\u0644\u0633\u064A\u0628\u0631\u0627\u0646\u064A (NCA) \u062E\u0644\u0627\u0644 48 \u0633\u0627\u0639\u0629 (\u0644\u0644\u062D\u0648\u0627\u062F\u062B \u0627\u0644\u0633\u064A\u0628\u0631\u0627\u0646\u064A\u0629)',
              '\u0625\u0628\u0644\u0627\u063A \u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0645\u0631\u0643\u0632\u064A (SAMA) \u062D\u0633\u0628 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0625\u0628\u0644\u0627\u063A (\u0644\u0644\u0645\u0624\u0633\u0633\u0627\u062A \u0627\u0644\u0645\u0627\u0644\u064A\u0629)',
              '\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646 \u0627\u0644\u0645\u062A\u0623\u062B\u0631\u064A\u0646 \u0648\u062A\u0641\u0639\u064A\u0644 \u0627\u062A\u0641\u0627\u0642\u064A\u0627\u062A \u0627\u0644\u0637\u0648\u0627\u0631\u0626',
              '\u0625\u0639\u062F\u0627\u062F \u0628\u064A\u0627\u0646 \u0635\u062D\u0641\u064A \u0641\u064A \u062D\u0627\u0644 \u0627\u0644\u062A\u0623\u062B\u064A\u0631 \u0639\u0644\u0649 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0639\u0627\u0645\u0629',
              '\u0625\u0628\u0644\u0627\u063A \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062A\u0623\u062B\u0631\u064A\u0646 \u0628\u0627\u0644\u0648\u0636\u0639 \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0645\u062A\u062E\u0630\u0629'
          ].map(item => new Paragraph({
            numbering: { reference: 'numbered', level: 0 },
            children: [new TextRun({ text: item, size: 22 })]
          })),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ===== SECTION 6: CRITICAL PROCESSES =====
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('6. \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629 \u0627\u0644\u0645\u0634\u0645\u0648\u0644\u0629')] }),
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({
              text: `\u062A\u0634\u0645\u0644 \u0647\u0630\u0647 \u0627\u0644\u062E\u0637\u0629 ${criticalProcesses.length} \u0639\u0645\u0644\u064A\u0629 \u062D\u064A\u0648\u064A\u0629 \u062A\u0645 \u062A\u062D\u062F\u064A\u062F\u0647\u0627 \u0645\u0646 \u062E\u0644\u0627\u0644 \u062A\u062D\u0644\u064A\u0644 \u062A\u0623\u062B\u064A\u0631 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 (BIA). \u0627\u0644\u062C\u062F\u0648\u0644 \u0627\u0644\u062A\u0627\u0644\u064A \u064A\u0648\u0636\u062D \u0623\u0648\u0644\u0648\u064A\u0629 \u0627\u0644\u062A\u0639\u0627\u0641\u064A \u0644\u0643\u0644 \u0639\u0645\u0644\u064A\u0629:`,
              size: 22
            })]
          }),
          createProcessesTable(criticalProcesses, borders, headerBg, altRowBg),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ===== SECTION 7: CRITICAL ASSETS =====
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('7. \u0627\u0644\u0623\u0635\u0648\u0644 \u0627\u0644\u062D\u0631\u062C\u0629 \u0627\u0644\u062F\u0627\u0639\u0645\u0629')] }),
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({
              text: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062F ${criticalAssets.length} \u0623\u0635\u0644 \u062D\u0631\u062C \u0645\u0646 \u0633\u062C\u0644 \u0623\u0635\u0648\u0644 BIA \u064A\u062F\u0639\u0645 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629 \u0627\u0644\u0645\u0634\u0645\u0648\u0644\u0629 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u062E\u0637\u0629:`,
              size: 22
            })]
          }),
          createAssetsTable(criticalAssets, borders, headerBg, altRowBg),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ===== SECTION 8: RECOVERY PROCEDURES =====
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('8. \u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0648\u0627\u0644\u062A\u0639\u0627\u0641\u064A')] }),
          
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('8.1 \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0623\u0648\u0644\u0649: \u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0627\u0644\u0641\u0648\u0631\u064A\u0629 (0-2 \u0633\u0627\u0639\u0629)')] }),
          ...['\u062A\u0623\u0643\u064A\u062F \u0633\u0644\u0627\u0645\u0629 \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646 \u0648\u0627\u0644\u0632\u0648\u0627\u0631',
              '\u062A\u0642\u064A\u064A\u0645 \u0646\u0637\u0627\u0642 \u0627\u0644\u062A\u0639\u0637\u0644 \u0648\u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0645\u062A\u0623\u062B\u0631\u0629',
              '\u062A\u0641\u0639\u064A\u0644 \u0641\u0631\u064A\u0642 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0632\u0645\u0627\u062A \u0648\u0639\u0642\u062F \u0627\u062C\u062A\u0645\u0627\u0639 \u0637\u0648\u0627\u0631\u0626',
              '\u0625\u0628\u0644\u0627\u063A \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0644\u064A\u0627 \u0628\u0627\u0644\u0648\u0636\u0639',
              '\u062A\u0641\u0639\u064A\u0644 \u0642\u0646\u0648\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u0637\u0627\u0631\u0626\u0629',
              '\u0639\u0632\u0644 \u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0645\u062A\u0623\u062B\u0631\u0629 (\u0641\u064A \u062D\u0627\u0644 \u0627\u0644\u062D\u0648\u0627\u062F\u062B \u0627\u0644\u0633\u064A\u0628\u0631\u0627\u0646\u064A\u0629)',
              '\u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u062D\u0627\u062F\u062B \u0641\u064A \u0646\u0638\u0627\u0645 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062D\u0648\u0627\u062F\u062B'
          ].map(step => new Paragraph({
            numbering: { reference: 'numbered', level: 0 },
            children: [new TextRun({ text: step, size: 22 })]
          })),
          
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('8.2 \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062B\u0627\u0646\u064A\u0629: \u0627\u0644\u062A\u0639\u0627\u0641\u064A \u0627\u0644\u0642\u0635\u064A\u0631 (2-24 \u0633\u0627\u0639\u0629)')] }),
          ...['\u062A\u0641\u0639\u064A\u0644 \u0645\u0648\u0642\u0639 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0628\u062F\u064A\u0644 (\u0625\u0646 \u0648\u064F\u062C\u062F)',
              '\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u062D\u064A\u0648\u064A\u0629 \u062D\u0633\u0628 \u0623\u0648\u0644\u0648\u064A\u0629 RTO',
              '\u062A\u0641\u0639\u064A\u0644 \u0627\u062A\u0641\u0627\u0642\u064A\u0627\u062A \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646 \u0627\u0644\u0628\u062F\u064A\u0644\u064A\u0646',
              '\u0625\u0639\u0627\u062F\u0629 \u062A\u0648\u062C\u064A\u0647 \u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A',
              '\u0645\u0631\u0627\u0642\u0628\u0629 \u0645\u0633\u062A\u0645\u0631\u0629 \u0644\u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u062A\u0639\u0627\u0641\u064A',
              '\u062A\u062D\u062F\u064A\u062B\u0627\u062A \u062F\u0648\u0631\u064A\u0629 \u0644\u0623\u0635\u062D\u0627\u0628 \u0627\u0644\u0645\u0635\u0644\u062D\u0629 \u0643\u0644 2 \u0633\u0627\u0639\u0629'
          ].map(step => new Paragraph({
            numbering: { reference: 'numbered', level: 0 },
            children: [new TextRun({ text: step, size: 22 })]
          })),
          
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('8.3 \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062B\u0627\u0644\u062B\u0629: \u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0643\u0627\u0645\u0644\u0629 (24-72 \u0633\u0627\u0639\u0629)')] }),
          ...['\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0648\u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0645\u062A\u0623\u062B\u0631\u0629',
              '\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0648\u0627\u0643\u062A\u0645\u0627\u0644\u0647\u0627',
              '\u0627\u062E\u062A\u0628\u0627\u0631 \u0634\u0627\u0645\u0644 \u0644\u0644\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0645\u064F\u0633\u062A\u0639\u0627\u062F\u0629',
              '\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646 \u0644\u0628\u064A\u0626\u0629 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0623\u0635\u0644\u064A\u0629',
              '\u0625\u0644\u063A\u0627\u0621 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u062E\u0637\u0629 \u0628\u0642\u0631\u0627\u0631 \u0645\u0646 \u0642\u0627\u0626\u062F \u0641\u0631\u064A\u0642 \u0627\u0644\u0623\u0632\u0645\u0627\u062A',
              '\u0628\u062F\u0621 \u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u0627 \u0628\u0639\u062F \u0627\u0644\u062D\u0627\u062F\u062B (Post-Incident Review)'
          ].map(step => new Paragraph({
            numbering: { reference: 'numbered', level: 0 },
            children: [new TextRun({ text: step, size: 22 })]
          })),
          
          ...(recoveryProcedures.length > 0 ? [
            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('8.4 \u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062A\u0641\u0635\u064A\u0644\u064A\u0629 \u0627\u0644\u0645\u062E\u0635\u0635\u0629')] }),
            ...recoveryProcedures.map(proc => new Paragraph({
              numbering: { reference: 'numbered', level: 0 },
              children: [new TextRun({ text: `${proc.action} \u2014 \u0627\u0644\u0645\u0633\u0624\u0648\u0644: ${proc.responsible || '\u063A\u064A\u0631 \u0645\u062D\u062F\u062F'} \u2014 \u0627\u0644\u0625\u0637\u0627\u0631 \u0627\u0644\u0632\u0645\u0646\u064A: ${proc.timeline || '\u063A\u064A\u0631 \u0645\u062D\u062F\u062F'}`, size: 22 })]
            }))
          ] : []),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ===== SECTION 9: RESOURCES =====
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('9. \u0627\u0644\u0645\u0648\u0627\u0631\u062F \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629')] }),
          ...(requiredResources.length > 0 
            ? requiredResources.map(r => new Paragraph({
                numbering: { reference: 'bullets', level: 0 },
                children: [new TextRun({ text: `${r.type}: ${r.description} (\u0627\u0644\u0643\u0645\u064A\u0629: ${r.quantity || '\u062D\u0633\u0628 \u0627\u0644\u062D\u0627\u062C\u0629'})`, size: 22 })]
              }))
            : ['\u0645\u0648\u0642\u0639 \u0639\u0645\u0644 \u0628\u062F\u064A\u0644 \u0645\u062C\u0647\u0632 \u0628\u0627\u0644\u0643\u0627\u0645\u0644',
               '\u062E\u0648\u0627\u062F\u0645 \u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u0648\u0628\u0646\u064A\u0629 \u062A\u062D\u062A\u064A\u0629 \u062A\u0642\u0646\u064A\u0629 \u0628\u062F\u064A\u0644\u0629',
               '\u0648\u0633\u0627\u0626\u0644 \u0627\u062A\u0635\u0627\u0644 \u0628\u062F\u064A\u0644\u0629 (\u0623\u062C\u0647\u0632\u0629 \u062C\u0648\u0627\u0644 \u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629\u060C \u062E\u0637\u0648\u0637 \u0627\u062A\u0635\u0627\u0644 \u0628\u062F\u064A\u0644\u0629)',
               '\u0646\u0633\u062E \u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u0645\u062D\u062F\u0651\u062B\u0629 \u0645\u0646 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629',
               '\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0645\u0643\u062A\u0628\u064A\u0629 \u0648\u0623\u062C\u0647\u0632\u0629 \u062D\u0627\u0633\u0648\u0628 \u0645\u062D\u0645\u0648\u0644\u0629 \u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629',
               '\u0645\u064A\u0632\u0627\u0646\u064A\u0629 \u0637\u0648\u0627\u0631\u0626 \u0645\u0639\u062A\u0645\u062F\u0629',
               '\u0642\u0627\u0626\u0645\u0629 \u0645\u0648\u0631\u062F\u064A\u0646 \u0628\u062F\u064A\u0644\u064A\u0646 \u0645\u0639\u062A\u0645\u062F\u0629 \u0645\u0633\u0628\u0642\u0627\u064B'
              ].map(r => new Paragraph({
                numbering: { reference: 'bullets', level: 0 },
                children: [new TextRun({ text: r, size: 22 })]
              }))
          ),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ===== SECTION 10: TESTING =====
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('10. \u062E\u0637\u0629 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0648\u0627\u0644\u062A\u0645\u0627\u0631\u064A\u0646')] }),
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({
              text: '\u064A\u062C\u0628 \u0627\u062E\u062A\u0628\u0627\u0631 \u0647\u0630\u0647 \u0627\u0644\u062E\u0637\u0629 \u0628\u0634\u0643\u0644 \u062F\u0648\u0631\u064A \u0644\u0636\u0645\u0627\u0646 \u0641\u0639\u0627\u0644\u064A\u062A\u0647\u0627 \u0648\u0641\u0642 ISO 22301 Clause 8.5. \u0627\u0644\u062C\u062F\u0648\u0644 \u0627\u0644\u062A\u0627\u0644\u064A \u064A\u0648\u0636\u062D \u0628\u0631\u0646\u0627\u0645\u062C \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631:',
              size: 22
            })]
          }),
          createTestingTable(testingSchedule, borders, headerBg),
          
          new Paragraph({
            spacing: { before: 200 },
            children: [new TextRun({ text: '\u0646\u062A\u0627\u0626\u062C \u0643\u0644 \u0627\u062E\u062A\u0628\u0627\u0631 \u064A\u062C\u0628 \u062A\u0648\u062B\u064A\u0642\u0647\u0627 \u0648\u062A\u062D\u0644\u064A\u0644\u0647\u0627\u060C \u0648\u0627\u0644\u062F\u0631\u0648\u0633 \u0627\u0644\u0645\u0633\u062A\u0641\u0627\u062F\u0629 \u064A\u062C\u0628 \u062F\u0645\u062C\u0647\u0627 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062E\u0637\u0629.', size: 22 })]
          }),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ===== SECTION 11: MAINTENANCE =====
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('11. \u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u062E\u0637\u0629 \u0648\u0645\u0631\u0627\u062C\u0639\u062A\u0647\u0627')] }),
          ...['\u062A\u064F\u0631\u0627\u062C\u0639 \u0627\u0644\u062E\u0637\u0629 \u0633\u0646\u0648\u064A\u0627\u064B \u0623\u0648 \u0639\u0646\u062F \u062D\u062F\u0648\u062B \u062A\u063A\u064A\u064A\u0631 \u062C\u0648\u0647\u0631\u064A \u0641\u064A \u0627\u0644\u0645\u0646\u0638\u0645\u0629 \u0623\u0648 \u0628\u064A\u0626\u0629 \u0627\u0644\u062A\u0634\u063A\u064A\u0644',
              '\u064A\u0642\u0648\u0645 \u0645\u0646\u0633\u0642 \u0627\u0633\u062A\u0645\u0631\u0627\u0631\u064A\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0628\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062E\u0637\u0629 \u0628\u0639\u062F \u0643\u0644 \u0627\u062E\u062A\u0628\u0627\u0631 \u0623\u0648 \u062A\u0641\u0639\u064A\u0644 \u0641\u0639\u0644\u064A',
              '\u064A\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0642\u0627\u0626\u0645\u0629 \u0641\u0631\u064A\u0642 \u0627\u0644\u0623\u0632\u0645\u0627\u062A \u0648\u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0643\u0644 \u0631\u0628\u0639 \u0633\u0646\u0629',
              '\u064A\u062A\u0645 \u0645\u0631\u0627\u062C\u0639\u0629 \u0623\u0647\u062F\u0627\u0641 RTO/RPO \u0633\u0646\u0648\u064A\u0627\u064B \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0646\u062A\u0627\u0626\u062C BIA \u0627\u0644\u0645\u062D\u062F\u0651\u062B\u0629',
              '\u062C\u0645\u064A\u0639 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A \u062A\u064F\u0648\u062B\u0642 \u0641\u064A \u0633\u062C\u0644 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A \u0645\u0639 \u0631\u0642\u0645 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u062C\u062F\u064A\u062F',
              '\u064A\u062C\u0628 \u0627\u0639\u062A\u0645\u0627\u062F \u0623\u064A \u062A\u0639\u062F\u064A\u0644 \u062C\u0648\u0647\u0631\u064A \u0645\u0646 CISO \u0623\u0648 CEO \u0642\u0628\u0644 \u0627\u0644\u062A\u0641\u0639\u064A\u0644'
          ].map(item => new Paragraph({
            numbering: { reference: 'numbered', level: 0 },
            children: [new TextRun({ text: item, size: 22 })]
          })),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ===== SECTION 12: APPENDICES =====
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('12. \u0627\u0644\u0645\u0644\u0627\u062D\u0642')] }),
          
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('12.1 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062A\u062D\u0642\u0642 \u0639\u0646\u062F \u0627\u0644\u062A\u0641\u0639\u064A\u0644')] }),
          ...['☐ \u062A\u0623\u0643\u064A\u062F \u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646',
              '☐ \u0625\u0628\u0644\u0627\u063A \u0642\u0627\u0626\u062F \u0641\u0631\u064A\u0642 \u0627\u0644\u0623\u0632\u0645\u0627\u062A',
              '☐ \u062A\u0642\u064A\u064A\u0645 \u0646\u0637\u0627\u0642 \u0627\u0644\u062A\u0639\u0637\u0644',
              '☐ \u062A\u0641\u0639\u064A\u0644 \u0642\u0646\u0648\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u0637\u0627\u0631\u0626\u0629',
              '☐ \u0625\u0628\u0644\u0627\u063A \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u062A\u0646\u0638\u064A\u0645\u064A\u0629 (\u062D\u0633\u0628 \u0627\u0644\u062D\u0627\u062C\u0629)',
              '☐ \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0628\u062F\u064A\u0644 (\u062D\u0633\u0628 \u0627\u0644\u062D\u0627\u062C\u0629)',
              '☐ \u0628\u062F\u0621 \u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062A\u0639\u0627\u0641\u064A \u062D\u0633\u0628 \u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629',
              '☐ \u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u062D\u0627\u062F\u062B \u0641\u064A \u0627\u0644\u0646\u0638\u0627\u0645',
              '☐ \u062A\u062D\u062F\u064A\u062B\u0627\u062A \u062F\u0648\u0631\u064A\u0629 \u0644\u0623\u0635\u062D\u0627\u0628 \u0627\u0644\u0645\u0635\u0644\u062D\u0629',
              '☐ \u062A\u0642\u064A\u064A\u0645 \u0628\u0639\u062F \u0627\u0644\u062A\u0639\u0627\u0641\u064A (Post-Incident Review)'
          ].map(item => new Paragraph({
            numbering: { reference: 'bullets', level: 0 },
            children: [new TextRun({ text: item, size: 22 })]
          })),
          
          new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun('12.2 \u0633\u062C\u0644 \u0645\u0631\u0627\u062C\u0639\u0627\u062A \u0627\u0644\u062E\u0637\u0629')] }),
          createRevisionTable(plan, borders, headerBg),
          
          new Paragraph({
            spacing: { before: 600 },
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: '\u2014 \u0646\u0647\u0627\u064A\u0629 \u0627\u0644\u062E\u0637\u0629 \u2014', size: 22, bold: true, color: '999999' })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ 
              text: `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u062E\u0637\u0629 \u0622\u0644\u064A\u0627\u064B \u0628\u0648\u0627\u0633\u0637\u0629 \u0645\u0646\u0635\u0629 JAHIZIA \u2014 \u062c\u0627\u0647\u0632\u064a\u0629 \u2014 ${formatDate(new Date())}`, 
              size: 18, color: '999999' 
            })]
          })
        ]
      }
    ]
  });
  
  return await Packer.toBuffer(doc);
}

// ===== HELPER FUNCTIONS =====

function formatDate(date) {
  if (!date) return '\u2014';
  try {
    return new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return String(date);
  }
}

function translateStatus(status) {
  const map = {
    'DRAFT': '\u0645\u0633\u0648\u062F\u0629', 'UNDER_REVIEW': '\u0642\u064A\u062F \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629', 'APPROVED': '\u0645\u0639\u062A\u0645\u062F\u0629',
    'ACTIVE': '\u0645\u064F\u0641\u0639\u0651\u0644\u0629', 'EXPIRED': '\u0645\u0646\u062A\u0647\u064A\u0629', 'ARCHIVED': '\u0645\u0624\u0631\u0634\u0641\u0629'
  };
  return map[status] || status;
}

function createInfoTable(rows, borders, headerBg) {
  const tableWidth = 9026;
  const col1 = 3000;
  const col2 = tableWidth - col1;
  
  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths: [col1, col2],
    rows: rows.map(([label, value]) => new TableRow({
      children: [
        new TableCell({
          borders, width: { size: col1, type: WidthType.DXA },
          shading: headerBg,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, color: 'FFFFFF' })] })]
        }),
        new TableCell({
          borders, width: { size: col2, type: WidthType.DXA },
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: value || '\u2014', size: 20 })] })]
        })
      ]
    }))
  });
}

function createDefinitionsTable(borders, headerBg) {
  const defs = [
    ['BCP', '\u062E\u0637\u0629 \u0627\u0633\u062A\u0645\u0631\u0627\u0631\u064A\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u2014 \u0648\u062B\u064A\u0642\u0629 \u062A\u062D\u062F\u062F \u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062A\u0639\u0627\u0641\u064A \u0648\u0627\u0633\u062A\u0645\u0631\u0627\u0631 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0639\u0646\u062F \u0627\u0644\u062A\u0639\u0637\u0644'],
    ['BIA', '\u062A\u062D\u0644\u064A\u0644 \u062A\u0623\u062B\u064A\u0631 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u2014 \u0639\u0645\u0644\u064A\u0629 \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629 \u0648\u062A\u0642\u064A\u064A\u0645 \u0623\u062B\u0631 \u062A\u0648\u0642\u0641\u0647\u0627'],
    ['RTO', '\u0647\u062F\u0641 \u0632\u0645\u0646 \u0627\u0644\u062A\u0639\u0627\u0641\u064A \u2014 \u0623\u0642\u0635\u0649 \u0648\u0642\u062A \u0645\u0642\u0628\u0648\u0644 \u0644\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0628\u0639\u062F \u0627\u0644\u062A\u0639\u0637\u0644'],
    ['RPO', '\u0647\u062F\u0641 \u0646\u0642\u0637\u0629 \u0627\u0644\u062A\u0639\u0627\u0641\u064A \u2014 \u0623\u0642\u0635\u0649 \u0641\u0642\u062F\u0627\u0646 \u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0642\u0628\u0648\u0644 \u0645\u0642\u0627\u0633\u0627\u064B \u0628\u0627\u0644\u0648\u0642\u062A'],
    ['MTPD', '\u0623\u0642\u0635\u0649 \u0641\u062A\u0631\u0629 \u062A\u0639\u0637\u0644 \u0645\u0642\u0628\u0648\u0644\u0629 \u2014 \u0627\u0644\u0645\u062F\u0629 \u0627\u0644\u062A\u064A \u0628\u0639\u062F\u0647\u0627 \u064A\u0635\u0628\u062D \u0628\u0642\u0627\u0621 \u0627\u0644\u0645\u0646\u0638\u0645\u0629 \u0645\u0647\u062F\u062F\u0627\u064B'],
    ['CMT', '\u0641\u0631\u064A\u0642 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0632\u0645\u0627\u062A \u2014 \u0627\u0644\u0641\u0631\u064A\u0642 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u0639\u0646 \u0627\u0644\u0642\u064A\u0627\u062F\u0629 \u0648\u0627\u0644\u062A\u0646\u0633\u064A\u0642 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0623\u0632\u0645\u0629'],
    ['SPOF', '\u0646\u0642\u0637\u0629 \u0641\u0634\u0644 \u0641\u0631\u062F\u064A\u0629 \u2014 \u0623\u0635\u0644 \u0628\u062F\u0648\u0646 \u0628\u062F\u064A\u0644 \u064A\u0624\u062F\u064A \u0641\u0634\u0644\u0647 \u0644\u062A\u0648\u0642\u0641 \u0639\u0645\u0644\u064A\u0629 \u062D\u064A\u0648\u064A\u0629']
  ];
  
  const tableWidth = 9026;
  const col1 = 1200;
  const col2 = tableWidth - col1;
  
  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths: [col1, col2],
    rows: [
      new TableRow({
        children: [
          new TableCell({ borders, width: { size: col1, type: WidthType.DXA }, shading: headerBg, margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: '\u0627\u0644\u0645\u0635\u0637\u0644\u062D', bold: true, size: 20, color: 'FFFFFF' })] })] }),
          new TableCell({ borders, width: { size: col2, type: WidthType.DXA }, shading: headerBg, margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: '\u0627\u0644\u062A\u0639\u0631\u064A\u0641', bold: true, size: 20, color: 'FFFFFF' })] })] })
        ]
      }),
      ...defs.map(([term, def]) => new TableRow({
        children: [
          new TableCell({ borders, width: { size: col1, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: term, bold: true, size: 20 })] })] }),
          new TableCell({ borders, width: { size: col2, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: def, size: 20 })] })] })
        ]
      }))
    ]
  });
}

function createActivationLevelsTable(borders, headerBg) {
  const levels = [
    ['\u0627\u0644\u0645\u0633\u062A\u0648\u0649 1 \u2014 \u0627\u0633\u062A\u0646\u0641\u0627\u0631', '\u062A\u0646\u0628\u064A\u0647 \u0623\u0648\u0644\u064A \u2014 \u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u0648\u0636\u0639 \u0648\u062A\u062C\u0647\u064A\u0632 \u0641\u0631\u064A\u0642 \u0627\u0644\u0623\u0632\u0645\u0627\u062A', '< 1 \u0633\u0627\u0639\u0629', '\u0623\u0635\u0641\u0631'],
    ['\u0627\u0644\u0645\u0633\u062A\u0648\u0649 2 \u2014 \u062A\u0641\u0639\u064A\u0644 \u062C\u0632\u0626\u064A', '\u062A\u0641\u0639\u064A\u0644 \u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062A\u0639\u0627\u0641\u064A \u0644\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0623\u0643\u062B\u0631 \u062D\u0631\u062C\u0627\u064B', '1-4 \u0633\u0627\u0639\u0627\u062A', '\u0628\u0631\u062A\u0642\u0627\u0644\u064A'],
    ['\u0627\u0644\u0645\u0633\u062A\u0648\u0649 3 \u2014 \u062A\u0641\u0639\u064A\u0644 \u0643\u0627\u0645\u0644', '\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u062E\u0637\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0645\u0639 \u062C\u0645\u064A\u0639 \u0641\u0631\u0642 \u0627\u0644\u062A\u0639\u0627\u0641\u064A', '> 4 \u0633\u0627\u0639\u0627\u062A \u0623\u0648 \u0642\u0631\u0627\u0631 CMT', '\u0623\u062D\u0645\u0631']
  ];
  
  const tableWidth = 9026;
  const cols = [2500, 3500, 1500, 1526];
  
  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths: cols,
    rows: [
      new TableRow({
        children: ['\u0627\u0644\u0645\u0633\u062A\u0648\u0649', '\u0627\u0644\u0648\u0635\u0641', '\u0627\u0644\u0625\u0637\u0627\u0631 \u0627\u0644\u0632\u0645\u0646\u064A', '\u0627\u0644\u0644\u0648\u0646'].map((h, i) => 
          new TableCell({ borders, width: { size: cols[i], type: WidthType.DXA }, shading: headerBg,
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, color: 'FFFFFF' })] })] })
        )
      }),
      ...levels.map(row => new TableRow({
        children: row.map((cell, i) => 
          new TableCell({ borders, width: { size: cols[i], type: WidthType.DXA },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: cell, size: 18 })] })] })
        )
      }))
    ]
  });
}

function createCMTTable(members, borders, headerBg) {
  const tableWidth = 9026;
  const cols = [2000, 1800, 1800, 3426];
  
  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths: cols,
    rows: [
      new TableRow({
        children: ['\u0627\u0644\u062F\u0648\u0631', '\u0627\u0644\u0627\u0633\u0645', '\u0627\u0644\u0647\u0627\u062A\u0641', '\u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A'].map((h, i) => 
          new TableCell({ borders, width: { size: cols[i], type: WidthType.DXA }, shading: headerBg,
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, color: 'FFFFFF' })] })] })
        )
      }),
      ...members.map(m => new TableRow({
        children: [m.role, m.name, m.phone || '\u2014', m.responsibilities].map((cell, i) => 
          new TableCell({ borders, width: { size: cols[i], type: WidthType.DXA },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: cell || '\u2014', size: 18 })] })] })
        )
      }))
    ]
  });
}

function createProcessesTable(processes, borders, headerBg, altRowBg) {
  const tableWidth = 9026;
  const cols = [3000, 1200, 1200, 1200, 2426];
  
  if (processes.length === 0) {
    return new Paragraph({ children: [new TextRun({ text: '\u0644\u0645 \u064A\u062A\u0645 \u0631\u0628\u0637 \u0639\u0645\u0644\u064A\u0627\u062A BIA \u0628\u0647\u0630\u0647 \u0627\u0644\u062E\u0637\u0629. \u064A\u064F\u0631\u062C\u0649 \u0631\u0628\u0637 \u062A\u0642\u064A\u064A\u0645 BIA \u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B.', size: 20, color: 'FF0000' })] });
  }
  
  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths: cols,
    rows: [
      new TableRow({
        children: ['\u0627\u0644\u0639\u0645\u0644\u064A\u0629', 'RTO', 'RPO', 'MTPD', '\u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629'].map((h, i) => 
          new TableCell({ borders, width: { size: cols[i], type: WidthType.DXA }, shading: headerBg,
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, color: 'FFFFFF' })] })] })
        )
      }),
      ...processes.map((p, idx) => new TableRow({
        children: [
          p.process_name || '\u2014',
          p.rto_hours ? `${p.rto_hours} \u0633\u0627\u0639\u0629` : '\u2014',
          p.rpo_hours ? `${p.rpo_hours} \u0633\u0627\u0639\u0629` : '\u2014',
          p.mtpd_hours ? `${p.mtpd_hours} \u0633\u0627\u0639\u0629` : '\u2014',
          p.priority || '\u2014'
        ].map((cell, i) => 
          new TableCell({ borders, width: { size: cols[i], type: WidthType.DXA },
            shading: idx % 2 === 1 ? altRowBg : undefined,
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: cell, size: 18 })] })] })
        )
      }))
    ]
  });
}

function createAssetsTable(assets, borders, headerBg, altRowBg) {
  const tableWidth = 9026;
  const cols = [2500, 1500, 1500, 3526];
  
  if (assets.length === 0) {
    return new Paragraph({ children: [new TextRun({ text: '\u0644\u0645 \u064A\u062A\u0645 \u0631\u0628\u0637 \u0623\u0635\u0648\u0644 BIA \u0628\u0647\u0630\u0647 \u0627\u0644\u062E\u0637\u0629.', size: 20, color: 'FF0000' })] });
  }
  
  const typeMap = {
    'IT_SYSTEM': '\u0646\u0638\u0627\u0645 \u062A\u0642\u0646\u064A', 'APPLICATION': '\u062A\u0637\u0628\u064A\u0642', 'FACILITY': '\u0645\u0631\u0641\u0642',
    'EQUIPMENT': '\u0645\u0639\u062F\u0627\u062A', 'KEY_PERSONNEL': '\u0643\u0648\u0627\u062F\u0631 \u0631\u0626\u064A\u0633\u064A\u0629', 'VENDOR': '\u0645\u0648\u0631\u062F',
    'DATA': '\u0623\u0635\u0648\u0644 \u0628\u064A\u0627\u0646\u0627\u062A', 'DOCUMENT': '\u0648\u062B\u064A\u0642\u0629'
  };
  
  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths: cols,
    rows: [
      new TableRow({
        children: ['\u0627\u0644\u0623\u0635\u0644', '\u0627\u0644\u0646\u0648\u0639', 'RTO', '\u0627\u0644\u0628\u062F\u064A\u0644'].map((h, i) => 
          new TableCell({ borders, width: { size: cols[i], type: WidthType.DXA }, shading: headerBg,
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, color: 'FFFFFF' })] })] })
        )
      }),
      ...assets.map((a, idx) => new TableRow({
        children: [
          a.asset_name || '\u2014',
          typeMap[a.asset_type] || a.asset_type || '\u2014',
          a.rto_hours ? `${a.rto_hours} \u0633\u0627\u0639\u0629` : '\u2014',
          a.alternative || '\u2014'
        ].map((cell, i) => 
          new TableCell({ borders, width: { size: cols[i], type: WidthType.DXA },
            shading: idx % 2 === 1 ? altRowBg : undefined,
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: cell, size: 18 })] })] })
        )
      }))
    ]
  });
}

function createTestingTable(schedule, borders, headerBg) {
  const tableWidth = 9026;
  const cols = [2500, 2000, 2200, 2326];
  
  const defaultSchedule = schedule.length > 0 ? schedule : [
    { test_type: 'TABLETOP', frequency: '\u0631\u0628\u0639 \u0633\u0646\u0648\u064A', last_tested: null, next_test: null },
    { test_type: 'WALKTHROUGH', frequency: '\u0646\u0635\u0641 \u0633\u0646\u0648\u064A', last_tested: null, next_test: null },
    { test_type: 'FULL_EXERCISE', frequency: '\u0633\u0646\u0648\u064A', last_tested: null, next_test: null }
  ];
  
  const typeNames = {
    'TABLETOP': '\u062A\u0645\u0631\u064A\u0646 \u0637\u0627\u0648\u0644\u0629 (Tabletop)',
    'WALKTHROUGH': '\u062A\u0645\u0631\u064A\u0646 \u062A\u0641\u0635\u064A\u0644\u064A (Walkthrough)',
    'FULL_EXERCISE': '\u062A\u0645\u0631\u064A\u0646 \u0634\u0627\u0645\u0644 (Full Exercise)'
  };
  
  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths: cols,
    rows: [
      new TableRow({
        children: ['\u0646\u0648\u0639 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631', '\u0627\u0644\u062F\u0648\u0631\u064A\u0629', '\u0622\u062E\u0631 \u0627\u062E\u062A\u0628\u0627\u0631', '\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0642\u0627\u062F\u0645'].map((h, i) => 
          new TableCell({ borders, width: { size: cols[i], type: WidthType.DXA }, shading: headerBg,
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, color: 'FFFFFF' })] })] })
        )
      }),
      ...defaultSchedule.map(t => new TableRow({
        children: [
          typeNames[t.test_type] || t.test_type,
          t.frequency || '\u2014',
          t.last_tested ? formatDate(t.last_tested) : '\u0644\u0645 \u064A\u064F\u062E\u062A\u0628\u0631 \u0628\u0639\u062F',
          t.next_test ? formatDate(t.next_test) : '\u064A\u064F\u062D\u062F\u062F \u0628\u0639\u062F \u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F'
        ].map((cell, i) => 
          new TableCell({ borders, width: { size: cols[i], type: WidthType.DXA },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: cell, size: 18 })] })] })
        )
      }))
    ]
  });
}

function createRevisionTable(plan, borders, headerBg) {
  const tableWidth = 9026;
  const cols = [1200, 1800, 2500, 3526];
  
  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths: cols,
    rows: [
      new TableRow({
        children: ['\u0627\u0644\u0625\u0635\u062F\u0627\u0631', '\u0627\u0644\u062A\u0627\u0631\u064A\u062E', '\u0627\u0644\u0645\u064F\u0639\u062F', '\u0627\u0644\u0648\u0635\u0641'].map((h, i) => 
          new TableCell({ borders, width: { size: cols[i], type: WidthType.DXA }, shading: headerBg,
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, color: 'FFFFFF' })] })] })
        )
      }),
      new TableRow({
        children: [
          plan.version || '1.0',
          formatDate(plan.created_at),
          plan.creator_name_ar || '\u2014',
          '\u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u0623\u0648\u0644\u064A \u0644\u0644\u062E\u0637\u0629'
        ].map((cell, i) => 
          new TableCell({ borders, width: { size: cols[i], type: WidthType.DXA },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: cell, size: 18 })] })] })
        )
      })
    ]
  });
}

module.exports = { generateBCPDocument };
