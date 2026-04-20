/**
 * Export Utilities — CSV and PDF export for GRC data.
 */

/**
 * Export data to CSV file with proper Arabic support (BOM for Excel).
 */
export const exportToCSV = (data, columns, filename) => {
  if (!data || data.length === 0) {
    return false;
  }

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
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('CSV export failed:', err);
    return false;
  }
};

/**
 * Export data to PDF file using jsPDF + autoTable (lazy-loaded).
 */
export const exportToPDF = async (data, columns, filename, options = {}) => {
  if (!data || data.length === 0) {
    return false;
  }

  try {
    const { jsPDF } = await import('jspdf');
    const autoTableModule = await import('jspdf-autotable');
    const autoTable = autoTableModule.default || autoTableModule;

    const doc = new jsPDF({ orientation: options.orientation || 'landscape' });
    doc.setFontSize(16);
    doc.text(options.title || filename, 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, 14, 22);

    const tableConfig = {
      startY: 28,
      head: [columns.map(c => c.label)],
      body: data.map(row => columns.map(c => {
        const val = typeof c.accessor === 'function' ? c.accessor(row) : row[c.accessor];
        return val ?? '';
      })),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [6, 182, 212] },
    };

    // jspdf-autotable can attach as doc.autoTable or as a standalone function
    if (typeof doc.autoTable === 'function') {
      doc.autoTable(tableConfig);
    } else if (typeof autoTable === 'function') {
      autoTable(doc, tableConfig);
    } else {
      throw new Error('autoTable plugin failed to load');
    }

    doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
    return true;
  } catch (err) {
    console.error('PDF export failed:', err);
    return false;
  }
};
