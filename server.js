console.log('ENV:', process.env.LINE_CHANNEL_SECRET); // 🕵️‍♂️ Debug!
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const express = require('express');
const cors = require('cors');
const line = require('@line/bot-sdk');
const getDrugNames = require('./getDrugNames');
const getDrugDetails = require('./getDrugDetails');

const app = express();
const port = process.env.PORT || 3000;

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
const lineClient = new line.Client(config);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ Hello from PharstoreApp on Render');
});

app.get('/drugs', async (req, res) => {
  try {
    const drugs = await getDrugNames();
    res.json(drugs);
  } catch (error) {
    console.error('Error fetching drug names:', error);
    res.status(500).json({ error: 'Failed to fetch drug names' });
  }
});

// ✅ อย่ามี middleware ซ้อนตรง use/path
app.post('/webhook', line.middleware(config), async (req, res) => {
  // ✅ ต้องใช้ req.body.events
  try {
    const events = req.body.events;
    await Promise.all(events.map(handleEvent));
    res.status(200).end();
  } catch (err) {
    console.error('❌ LINE Webhook error:', err);
    res.status(500).end();
  }
});


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

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
