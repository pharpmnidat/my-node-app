require('dotenv').config(); // โหลดค่าจาก .env

const axios = require('axios');

// อ่านค่าจาก environment variables
const spreadsheetId = process.env.SPREADSHEET_ID;
const sheetName = process.env.SHEET_NAME || 'Drug';
const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

async function getDrugNames() {
  const range = `${sheetName}!A2:A`; // ดึงคอลัมน์ A เริ่มจากแถว 2
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

  try {
    const res = await axios.get(url);
    const values = res.data.values || [];
    return values.map(row => row[0]); // คืน array ของชื่อยา
  } catch (err) {
    console.error('❌ ดึงข้อมูล Google Sheets ไม่สำเร็จ:', err.message);
    return [];
  }
}

module.exports = getDrugNames;

if (require.main === module) {
  (async () => {
    console.log("🧪 Testing getDrugNames()…");
    const list = await getDrugNames();
    console.log("📥 ได้ชื่อยา:", list);
  })();
}
