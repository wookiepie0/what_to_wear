require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const PORT = 3000;

app.post('/suggest', async (req, res) => {
const { prompt } = req.body;

const promptAsText = `Kullanıcının dolabında şu kıyafetler var:

Üst kıyafetler: ${prompt.upperCandidates?.join(', ') || 'yok'}
Alt kıyafetler: ${prompt.lowerCandidates?.join(', ') || 'yok'}
Elbiseler: ${prompt.dressCandidates?.join(', ') || 'yok'}

Hava durumu: ${prompt.weather?.main?.temp} derece, ${prompt.weather?.weather?.[0]?.main || 'bilinmiyor'}.
Stil tercihi: ${prompt.style}

Lütfen aşağıdaki kurallara göre rastgele ama uygun bir kombin öner:
- Elbise de varsa %50 ihtimalle "dress_id" döndür
- Kombin de varsa %50 ihtimalle "upper_id" ve "lower_id" döndür
- Sadece JSON olarak yanıt ver, başka hiçbir şey yazma.`;
const messages = [
  {
    role: 'system',
    content: `Sen bir stil asistanısın. Kullanıcının dolabındaki kıyafetlerden mevsime ve stile uygun bir kombin öner.`
  },
  {
    role: 'user',
    content: promptAsText // ❗ Burada artık string olacak
  }
];

  try {
const response = await axios.post(
  'https://openrouter.ai/api/v1/chat/completions',
  {
    model: "openai/gpt-4o-mini", // ← burada değiştiriyoruz
    messages,
    temperature: 0.7,
  },
  {
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    }
  }
);

    res.json(response.data);
  } catch (err) {
    console.error('OpenRouter API hatası:', err.response?.data || err.message);
    res.status(500).json({ error: 'OpenRouter API hatası' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ GPT-4 sunucusu ${PORT} portunda çalışıyor...`);
});