require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Groq = require('groq-sdk');
const cors = require('cors')
const path = require('path')

const app = express();
const port = process.env.PORT || 3000;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.static(path.join(__dirname, 'fe')));
app.use(cors());
app.use(bodyParser.json());

async function groqchat(userMsg) {
  try {
    const respon = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: userMsg,
        },
      ],
      model: "llama3-8b-8192",
    });
    return respon.choices[0]?.message?.content || 'Tidak ada respon';
  } catch (error) {
    console.error('Terjadi kesalahan saat mengambil penyelesaian chat:', error);
    throw error;
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './fe/index.html'))
})

app.post('/chat', async (req, res) => {
  const userMsg = req.body.message;
  if (!userMsg) {
    return res.status(400).send({ error: 'Pesan diperlukan' });
  }
  try {
    const chatComplete = await groqchat(userMsg);
    res.send({ reply: chatComplete });
  } catch (error) {
    res.status(500).send({ error: 'Gagal menyelesaikan chat' });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});
