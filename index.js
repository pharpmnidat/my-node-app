// index.js
const express = require('express');
const cors = require('cors');
const getDrugNames = require('./getDrugNames'); // เรียกโมดูลดึงชื่อยา

const app = express();
app.use(cors()); // อนุญาตทุก Origin ให้เข้าถึง API

// กำหนด route GET /drugs
app.get('/drugs', async (req, res) => {
  try {
    const drugs = await getDrugNames();
    console.log('📤 ส่งกลับไปยัง frontend:', drugs);
    res.json(drugs);
  } catch (err) {
    console.error('❌ API /drugs error:', err);
    res.status(500).json({ error: err.message });
  }
});

// สั่งให้ server ฟังที่พอร์ต 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
