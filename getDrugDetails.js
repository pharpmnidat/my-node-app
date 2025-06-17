require('dotenv').config();
const axios = require('axios');

async function getDrugDetails(query) {
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const sheetName = process.env.SHEET_NAME || 'Drug';
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

  const range = `${sheetName}!A2:D`; // A: DrugName, B: Status, C: Type, D: Image
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

  try {
    const res = await axios.get(url);
    const rows = res.data.values;

    if (!rows || rows.length === 0) return null;

    const matched = rows.find(row => {
      const drugName = row[0] || '';
      return drugName.toLowerCase().includes(query.toLowerCase());
    });

    if (!matched) return null;

    return {
      DrugName: matched[0],
      Status: matched[1] || 'ไม่ระบุ',
      Type: matched[2] || 'ไม่ระบุ',
      Image: matched[3] || '',
    };
  } catch (err) {
    console.error('❌ ดึงข้อมูลจาก Google Sheets ไม่สำเร็จ:', err.message);
    return null;
  }
}

module.exports = getDrugDetails;
