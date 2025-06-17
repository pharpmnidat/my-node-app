const getDrugNames = require('./getDrugNames');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/drugs', async (req, res) => {
  try {
    const drugs = await getDrugNames();
    res.json(drugs);
  } catch (error) {
    console.error('Error fetching drug names:', error);
    res.status(500).json({ error: 'Failed to fetch drug names' });
  }
});

app.get('/', (req, res) => {
  res.send('Hello from Render! 🎉');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
