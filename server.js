require('dotenv').config();
const express = require('express');
const cors = require('cors');
const line = require('@line/bot-sdk');
const getDrugNames = require('./getDrugNames');       // ดึงรายชื่อยา
const getDrugDetails = require('./getDrugDetails');   // ดึงรายละเอียดยา

const app = express();
const port = process.env.PORT || 3000;

// ====== LINE SDK CONFIG ======
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
const lineClient = new line.Client(config);

// ====== MIDDLEWARE ======
app.use(cors());
app.use(express.json());
app.use('/webhook', line.middleware(config));

// ====== ROUTES ======

// ทดสอบหน้าเว็บ
app.get('/', (req, res) => {
  res.send('✅ Hello from PharstoreApp on Render');
});

// ดึงรายชื่อยา (ใช้กับ LIFF dropdown หรืออื่น ๆ)
app.get('/drugs', async (req, res) => {
  try {
    const drugs = await getDrugNames();
    res.json(drugs);
  } catch (error) {
    console.error('Error fetching drug names:', error);
    res.status(500).json({ error: 'Failed to fetch drug names' });
  }
});

// ====== LINE WEBHOOK ======
app.post('/webhook', async (req, res) => {
  try {
    await Promise.all(req.body.events.map(handleEvent));
    res.status(200).end();
  } catch (err) {
    console.error('❌ LINE Webhook error:', err);
    res.status(500).end();
  }
});

// ====== LINE EVENT HANDLER ======
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') return;

  const query = event.message.text;
  const drug = await getDrugDetails(query);

  if (!drug) {
    return lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: `❌ ไม่พบข้อมูลสำหรับ "${query}"`,
    });
  }

  const message = {
    type: 'flex',
    altText: `ข้อมูลยา ${drug.DrugName}`,
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: drug.Image || 'https://placehold.co/600x400?text=No+Image',
        size: 'full',
        aspectRatio: '16:9',
        aspectMode: 'cover',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: drug.DrugName, weight: 'bold', size: 'lg' },
          { type: 'text', text: `สถานะ: ${drug.Status}` },
          { type: 'text', text: `ประเภท: ${drug.Type}` },
        ],
      },
    },
  };

  return lineClient.replyMessage(event.replyToken, message);
}

// ====== START SERVER ======
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
