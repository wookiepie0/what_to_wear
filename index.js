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

const promptAsText = `Kullanıcının dolabında şu kıyafetler var:

Her kıyafet, ID, ad ve renk bilgisiyle listelenmiştir. Renk uyumuna dikkat ederek seçim yap.

Üst kıyafetler:
${upperList}

Alt kıyafetler:
${lowerList}

Elbiseler:
${dressList}

Hava durumu: ${prompt.weather?.main?.temp} derece, ${prompt.weather?.weather?.[0]?.main || 'bilinmiyor'}
Stil tercihi: ${prompt.style}

Kurallar:
- Renk uyumu estetik olarak önemlidir. Uyumlu renk kombinasyonlarını tercih et.
- Elbise varsa %50 ihtimalle sadece "dress_id" içeren bir JSON dön.
- Kombin de varsa %50 ihtimalle hem "upper_id" hem "lower_id" içeren bir JSON dön.
- En az bir alt ve bir üst varsa, her zaman kombin öner (sadece üst ya da alt önermek yok).
- Cevabın sadece JSON formatında olmalı. Başka açıklama ya da yorum yazma.
- ID'ler doğrudan kıyafet ID'si olarak dönmeli (örnek: "upper_id": "abc123").`;
const messages = [
{
  role: 'system',
  content: `Sen bir stil asistanısın. Görevin kullanıcıya hem görsel hem işlevsel açıdan uygun kombin önermek. Asla eksik kombin önermemelisin.`
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
