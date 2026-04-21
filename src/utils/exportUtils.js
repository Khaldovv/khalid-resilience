/**
 * Export Utilities — PDF, CSV, DOCX for GRC Risk Register.
 * All exports support Arabic/RTL text natively.
 */

// ════════════════════════════════════════════════════════════════════════════════
// CSV EXPORT — with BOM for Excel Arabic support
// ════════════════════════════════════════════════════════════════════════════════
export const exportToCSV = (data, columns, filename) => {
  if (!data || data.length === 0) return false;

  try {
    const header = columns.map(c => `"${c.label}"`).join(',');
    const rows = data.map(row =>
      columns.map(c => {
        let val = typeof c.accessor === 'function' ? c.accessor(row) : row[c.accessor];
        val = String(val ?? '').replace(/"/g, '""');
        return `"${val}"`;
      }).join(',')
    );

    const csv = '\ufeff' + header + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${filename}-${dateStamp()}.csv`);
    return true;
  } catch (err) {
    console.error('CSV export failed:', err);
    return false;
  }
};

// ════════════════════════════════════════════════════════════════════════════════
// PDF EXPORT — Generates a beautiful HTML document and triggers browser print
// ════════════════════════════════════════════════════════════════════════════════
export const exportToPDF = async (data, columns, filename, options = {}) => {
  if (!data || data.length === 0) return false;

  try {
    const title = options.title || 'سجل المخاطر المؤسسي';
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    // Build table rows
    const headerCells = columns.map(c => `<th>${esc(c.label)}</th>`).join('');
    const bodyRows = data.map((row, i) => {
      const cells = columns.map(c => {
        const val = typeof c.accessor === 'function' ? c.accessor(row) : row[c.accessor];
        return `<td>${esc(String(val ?? '—'))}</td>`;
      }).join('');
      return `<tr class="${i % 2 === 0 ? 'even' : 'odd'}">${cells}</tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${esc(title)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'IBM Plex Sans Arabic', 'Segoe UI', Tahoma, sans-serif;
      direction: rtl;
      color: #1a1a2e;
      background: #fff;
      padding: 0;
    }
    @page {
      size: A4 landscape;
      margin: 12mm;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }

    /* Header Banner */
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f766e 100%);
      color: #fff;
      padding: 28px 32px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 {
      font-size: 22px;
      font-weight: 700;
    }
    .header .subtitle {
      font-size: 11px;
      opacity: 0.7;
      margin-top: 4px;
    }
    .header .logo {
      text-align: left;
      font-size: 12px;
      opacity: 0.6;
    }
    .header .logo .brand {
      font-size: 16px;
      font-weight: 700;
      opacity: 1;
      color: #06b6d4;
    }

    /* Stats Row */
    .stats {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }
    .stat-card {
      flex: 1;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 16px;
      text-align: center;
    }
    .stat-card .number {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
    }
    .stat-card .label {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
    }
    .stat-card.catastrophic .number { color: #dc2626; }
    .stat-card.high .number { color: #ea580c; }
    .stat-card.medium .number { color: #ca8a04; }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
    }
    th {
      background: #0f172a;
      color: #e2e8f0;
      padding: 10px 8px;
      font-weight: 600;
      text-align: right;
      font-size: 9px;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    td {
      padding: 8px;
      text-align: right;
      border-bottom: 1px solid #e2e8f0;
      font-size: 10px;
    }
    tr.even { background: #fff; }
    tr.odd { background: #f8fafc; }
    tr:hover { background: #f1f5f9; }

    /* Score cells */
    .score-high { color: #dc2626; font-weight: 700; }
    .score-med { color: #ca8a04; font-weight: 700; }
    .score-low { color: #16a34a; font-weight: 700; }

    /* Footer */
    .footer {
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #94a3b8;
    }

    /* Print button */
    .print-btn {
      position: fixed;
      bottom: 24px;
      left: 24px;
      background: #0f172a;
      color: #fff;
      border: none;
      padding: 14px 28px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      font-family: 'IBM Plex Sans Arabic', sans-serif;
      box-shadow: 0 4px 24px rgba(0,0,0,0.3);
      z-index: 9999;
    }
    .print-btn:hover { background: #1e293b; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>📋 ${esc(title)}</h1>
      <div class="subtitle">تاريخ الإصدار: ${dateStr} — ${timeStr}</div>
    </div>
    <div class="logo">
      <div class="brand">خالد ريزيلينس</div>
      Khalid Resilience AI Platform
    </div>
  </div>

  <div class="stats">
    <div class="stat-card">
      <div class="number">${data.length}</div>
      <div class="label">إجمالي المخاطر</div>
    </div>
    <div class="stat-card catastrophic">
      <div class="number">${data.filter(r => (r.inherentScore || 0) >= 20).length}</div>
      <div class="label">كارثي</div>
    </div>
    <div class="stat-card high">
      <div class="number">${data.filter(r => { const s = r.inherentScore || 0; return s >= 15 && s < 20; }).length}</div>
      <div class="label">عالي</div>
    </div>
    <div class="stat-card medium">
      <div class="number">${data.filter(r => { const s = r.inherentScore || 0; return s >= 8 && s < 15; }).length}</div>
      <div class="label">متوسط</div>
    </div>
  </div>

  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>

  <div class="footer">
    <span>تم الإنشاء بواسطة منصة خالد ريزيلينس — Khalid Resilience AI Platform v4.2</span>
    <span>سري وللاستخدام الداخلي فقط — Confidential</span>
    <span>الصفحة 1</span>
  </div>

  <button class="print-btn no-print" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
</body>
</html>`;

    // Open in new window for printing
    const printWin = window.open('', '_blank', 'width=1200,height=800');
    if (!printWin) {
      // Fallback: download as HTML file
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      downloadBlob(blob, `${filename}-${dateStamp()}.html`);
      return true;
    }
    printWin.document.write(html);
    printWin.document.close();
    printWin.focus();

    // Auto-trigger print after fonts load
    printWin.onload = () => {
      setTimeout(() => printWin.print(), 800);
    };

    return true;
  } catch (err) {
    console.error('PDF export failed:', err);
    return false;
  }
};

// ════════════════════════════════════════════════════════════════════════════════
// DOCX EXPORT — Real .docx file using Office Open XML
// ════════════════════════════════════════════════════════════════════════════════
export const exportToDocx = (data, columns, filename, options = {}) => {
  if (!data || data.length === 0) return false;

  try {
    const title = options.title || 'سجل المخاطر المؤسسي';
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

    // Build Word XML table rows
    const headerCells = columns.map(c =>
      `<w:tc>
        <w:tcPr><w:shd w:val="clear" w:fill="0F172A"/></w:tcPr>
        <w:p><w:pPr><w:bidi/><w:jc w:val="right"/></w:pPr>
          <w:r><w:rPr><w:b/><w:color w:val="E2E8F0"/><w:sz w:val="18"/><w:rtl/></w:rPr>
            <w:t>${xmlEsc(c.label)}</w:t>
          </w:r>
        </w:p>
      </w:tc>`
    ).join('');

    const bodyRows = data.map((row, i) => {
      const fill = i % 2 === 0 ? 'FFFFFF' : 'F8FAFC';
      const cells = columns.map(c => {
        const val = typeof c.accessor === 'function' ? c.accessor(row) : row[c.accessor];
        return `<w:tc>
          <w:tcPr><w:shd w:val="clear" w:fill="${fill}"/></w:tcPr>
          <w:p><w:pPr><w:bidi/><w:jc w:val="right"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="18"/><w:rtl/></w:rPr>
              <w:t>${xmlEsc(String(val ?? '—'))}</w:t>
            </w:r>
          </w:p>
        </w:tc>`;
      }).join('');
      return `<w:tr>${cells}</w:tr>`;
    }).join('');

    // Count stats
    const totalRisks = data.length;
    const catastrophic = data.filter(r => (r.inherentScore || 0) >= 20).length;
    const high = data.filter(r => { const s = r.inherentScore || 0; return s >= 15 && s < 20; }).length;

    const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
            xmlns:mo="http://schemas.microsoft.com/office/mac/office/2008/main"
            xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
            xmlns:mv="urn:schemas-microsoft-com:mac:vml"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:w10="urn:schemas-microsoft-com:office:word"
            xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
            mc:Ignorable="w14 wp14">
  <w:body>
    <!-- Title -->
    <w:p>
      <w:pPr><w:bidi/><w:jc w:val="right"/><w:pStyle w:val="Title"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="40"/><w:color w:val="0F172A"/><w:rtl/></w:rPr>
        <w:t>📋 ${xmlEsc(title)}</w:t>
      </w:r>
    </w:p>

    <!-- Subtitle -->
    <w:p>
      <w:pPr><w:bidi/><w:jc w:val="right"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="20"/><w:color w:val="64748B"/><w:rtl/></w:rPr>
        <w:t>تاريخ الإصدار: ${xmlEsc(dateStr)} | إجمالي المخاطر: ${totalRisks} | كارثي: ${catastrophic} | عالي: ${high}</w:t>
      </w:r>
    </w:p>

    <!-- Spacer -->
    <w:p><w:pPr><w:spacing w:after="200"/></w:pPr></w:p>

    <!-- Table -->
    <w:tbl>
      <w:tblPr>
        <w:bidiVisual/>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="4" w:color="CBD5E1"/>
          <w:left w:val="single" w:sz="4" w:color="CBD5E1"/>
          <w:bottom w:val="single" w:sz="4" w:color="CBD5E1"/>
          <w:right w:val="single" w:sz="4" w:color="CBD5E1"/>
          <w:insideH w:val="single" w:sz="4" w:color="E2E8F0"/>
          <w:insideV w:val="single" w:sz="4" w:color="E2E8F0"/>
        </w:tblBorders>
        <w:tblLook w:val="04A0"/>
      </w:tblPr>
      <w:tr>${headerCells}</w:tr>
      ${bodyRows}
    </w:tbl>

    <!-- Footer -->
    <w:p><w:pPr><w:spacing w:before="400"/></w:pPr></w:p>
    <w:p>
      <w:pPr><w:bidi/><w:jc w:val="right"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="16"/><w:color w:val="94A3B8"/><w:rtl/></w:rPr>
        <w:t>تم الإنشاء بواسطة منصة خالد ريزيلينس — Khalid Resilience AI Platform v4.2 — سري وللاستخدام الداخلي فقط</w:t>
      </w:r>
    </w:p>

    <w:sectPr>
      <w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>
      <w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/>
      <w:bidi/>
    </w:sectPr>
  </w:body>
</w:document>`;

    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

    const wordRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

    // Build ZIP file manually (minimal ZIP for .docx)
    const zip = buildDocxZip({
      '[Content_Types].xml': contentTypes,
      '_rels/.rels': rels,
      'word/_rels/document.xml.rels': wordRels,
      'word/document.xml': docXml,
    });

    const blob = new Blob([zip], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    downloadBlob(blob, `${filename}-${dateStamp()}.docx`);
    return true;
  } catch (err) {
    console.error('DOCX export failed:', err);
    return false;
  }
};

// ════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════════

function dateStamp() {
  return new Date().toISOString().split('T')[0];
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function xmlEsc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ────────────────────────────────────────────────────────────────────────────────
// Minimal ZIP builder for DOCX (no external dependencies)
// ────────────────────────────────────────────────────────────────────────────────
function buildDocxZip(files) {
  const entries = Object.entries(files);
  const encoder = new TextEncoder();
  const parts = [];
  const centralDir = [];
  let offset = 0;

  for (const [name, content] of entries) {
    const nameBytes = encoder.encode(name);
    const dataBytes = encoder.encode(content);
    const crc = crc32(dataBytes);

    // Local file header
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(localHeader.buffer);
    view.setUint32(0, 0x04034b50, true); // signature
    view.setUint16(4, 20, true); // version needed
    view.setUint16(6, 0x0800, true); // general purpose flag (UTF-8)
    view.setUint16(8, 0, true); // compression: store
    view.setUint16(10, 0, true); // mod time
    view.setUint16(12, 0, true); // mod date
    view.setUint32(14, crc, true); // crc32
    view.setUint32(18, dataBytes.length, true); // compressed size
    view.setUint32(22, dataBytes.length, true); // uncompressed size
    view.setUint16(26, nameBytes.length, true); // filename length
    view.setUint16(28, 0, true); // extra field length
    localHeader.set(nameBytes, 30);

    // Central directory entry
    const centralEntry = new Uint8Array(46 + nameBytes.length);
    const cView = new DataView(centralEntry.buffer);
    cView.setUint32(0, 0x02014b50, true); // signature
    cView.setUint16(4, 20, true); // version made by
    cView.setUint16(6, 20, true); // version needed
    cView.setUint16(8, 0x0800, true); // flags (UTF-8)
    cView.setUint16(10, 0, true); // compression
    cView.setUint16(12, 0, true); // mod time
    cView.setUint16(14, 0, true); // mod date
    cView.setUint32(16, crc, true); // crc32
    cView.setUint32(20, dataBytes.length, true); // compressed
    cView.setUint32(24, dataBytes.length, true); // uncompressed
    cView.setUint16(28, nameBytes.length, true); // name length
    cView.setUint16(30, 0, true); // extra
    cView.setUint16(32, 0, true); // comment
    cView.setUint16(34, 0, true); // disk
    cView.setUint16(36, 0, true); // internal attrs
    cView.setUint32(38, 0, true); // external attrs
    cView.setUint32(42, offset, true); // offset
    centralEntry.set(nameBytes, 46);

    parts.push(localHeader, dataBytes);
    centralDir.push(centralEntry);
    offset += localHeader.length + dataBytes.length;
  }

  const centralDirOffset = offset;
  let centralDirSize = 0;
  for (const cd of centralDir) {
    parts.push(cd);
    centralDirSize += cd.length;
  }

  // End of central directory
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);
  eocdView.setUint16(4, 0, true);
  eocdView.setUint16(6, 0, true);
  eocdView.setUint16(8, entries.length, true);
  eocdView.setUint16(10, entries.length, true);
  eocdView.setUint32(12, centralDirSize, true);
  eocdView.setUint32(16, centralDirOffset, true);
  eocdView.setUint16(20, 0, true);
  parts.push(eocd);

  // Combine all parts
  const totalLength = parts.reduce((sum, p) => sum + p.length, 0);
  const result = new Uint8Array(totalLength);
  let pos = 0;
  for (const part of parts) {
    result.set(part, pos);
    pos += part.length;
  }
  return result;
}

// CRC32 implementation
function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
