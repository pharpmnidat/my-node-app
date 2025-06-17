require('dotenv').config();
const axios = require('axios');

async function getDrugNames() {
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const sheetName = process.env.SHEET_NAME || 'Drug';
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

  const range = `${sheetName}!A2:A`; // คอลัมน์ A = DrugName
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const values = response.data.values;

    if (!values || values.length === 0) {
      return [];
    }

    // คืนเฉพาะชื่อยา (คอลัมน์ A)
    return values.map(row => row[0]);
  } catch (error) {
    console.error('❌ ไม่สามารถดึงรายชื่อยาได้:', error.message);
    return [];
  }
}

module.exports = getDrugNames;
