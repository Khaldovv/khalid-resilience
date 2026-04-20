const fs = require('fs');
const path = require('path');

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === '.pdf') {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return { text: data.text, pages: data.numpages, metadata: data.info };
    }

    if (ext === '.docx' || ext === '.doc') {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return { text: result.value, pages: null, metadata: {} };
    }

    if (ext === '.xlsx' || ext === '.xls') {
      const XLSX = require('xlsx');
      const workbook = XLSX.readFile(filePath);
      let combinedText = '';
      workbook.SheetNames.forEach((name) => {
        const sheet = workbook.Sheets[name];
        combinedText += `\n=== Sheet: ${name} ===\n${XLSX.utils.sheet_to_csv(sheet)}\n`;
      });
      return { text: combinedText, pages: workbook.SheetNames.length, metadata: { sheets: workbook.SheetNames } };
    }

    if (ext === '.txt') {
      const text = fs.readFileSync(filePath, 'utf-8');
      return { text, pages: null, metadata: {} };
    }

    throw new Error('Unsupported file type');
  } catch (err) {
    throw new Error(`فشل في استخراج النص من الملف: ${err.message}`);
  }
}

module.exports = { extractText };
