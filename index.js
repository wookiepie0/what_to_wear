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

const upperList = prompt.upperCandidates?.map(item => `- ID: ${item.id}, Ad: ${item.name}, Renk: ${item.color || 'bilinmiyor'}`).join('\n') || 'yok';
const lowerList = prompt.lowerCandidates?.map(item => `- ID: ${item.id}, Ad: ${item.name}, Renk: ${item.color || 'bilinmiyor'}`).join('\n') || 'yok';
const dressList = prompt.dressCandidates?.map(item => `- ID: ${item.id}, Ad: ${item.name}, Renk: ${item.color || 'bilinmiyor'}`).join('\n') || 'yok';

const promptAsText = `
Kullanıcının dolabında şu kıyafetler var:

Üst kıyafetler:
${upperList}

Alt kıyafetler:
${lowerList}

Elbiseler:
${dressList}

Hava durumu: ${prompt.weather?.main?.temp} derece, ${prompt.weather?.weather?.[0]?.main || 'bilinmiyor'}
Stil tercihi: ${prompt.style}

Kurallar:
- Eğer elbise de kombin de uygunsa, **yalnızca birini seç** ve **sadece onu öner**.
- Bu kararı verirken renk uyumu, stil ve hava durumuna dikkat et.
- Eğer kombin öneriyorsan yalnızca şu formatta JSON dön:
  { "upper_id": "abc123", "lower_id": "xyz789" }
- Eğer elbise öneriyorsan yalnızca şu formatta JSON dön:
  { "dress_id": "def456" }
- Asla hem elbise hem kombin aynı anda dönme. Kullanıcıya **tek öneri** sun.
- JSON dışında herhangi bir açıklama, yorum veya süsleme yazma.
- Tüm ID'ler Supabase veritabanındaki gerçek kıyafet ID'leri olmalı.
`;
const messages = [
  {
    role: 'system',
    content: `Sen bir stil asistanısın. Kullanıcıya sadece bir tane, stiline ve hava durumuna uygun en iyi kıyafet önerisi yap.`
  },
  {
    role: 'user',
    content: promptAsText
  }
];

  try {
const response = await axios.post(
  'https://openrouter.ai/api/v1/chat/completions',
  {
    model: "openai/gpt-4.1-nano", // ← burada değiştiriyoruz
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
