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

const upperList = prompt.upperCandidates?.map(item => `- ID: ${item.id}, Tip: ${item.tip}, Renk: ${item.renk || 'bilinmiyor'}`).join('\n') || 'yok';
const lowerList = prompt.lowerCandidates?.map(item => `- ID: ${item.id}, Tip: ${item.tip}, Renk: ${item.renk || 'bilinmiyor'}`).join('\n') || 'yok';
const dressList = prompt.dressCandidates?.map(item => `- ID: ${item.id}, Tip: ${item.tip}, Renk: ${item.renk || 'bilinmiyor'}`).join('\n') || 'yok';

const promptAsText = `Kullanıcının dolabında şu kıyafetler var:

Üst kıyafetler:
${upperList}

Alt kıyafetler:
${lowerList}

Elbiseler:
${dressList}

Hava durumu: ${prompt.weather?.main?.temp} derece, ${prompt.weather?.weather?.[0]?.main || 'bilinmiyor'}
Stil tercihi: ${prompt.style}

Kurallar:
- Renk uyumu önemlidir. Ancak eğer kombin seçenekleri sınırlıysa, yine de şık ve kullanılabilir kombinler öner.
- Nötr renkler (siyah, beyaz, bej, gri) her şeyle uyumludur.
- Elbise varsa, %50 ihtimalle sadece "dress_id" içeren bir JSON dön.
- En az bir alt ve bir üst varsa, %50 ihtimalle kombin öner ("upper_id" ve "lower_id").
- Eğer kombin oluşturulamıyorsa ve elbise mevcutsa, mutlaka elbise öner.
- Cevabın sadece JSON formatında olmalı. Başka açıklama, yorum ya da metin yazma.
- Tip ve renk bilgilerini dikkate al. Örneğin, "siyah pantolon" ile "beyaz tişört" uyumludur.
- Yanıtta her zaman ID kullan. Sakın tip ya da ad yazma.
Örnek dönüşler:
{ "upper_id": "abc123", "lower_id": "xyz789" } veya { "dress_id": "def456" }`;
  
const messages = [
  {
    role: 'system',
    content: `Sen bir stil asistanısın. Görevin kullanıcıya hem görsel hem işlevsel açıdan uygun kombin önermek. Renk uyumu ve kullanıcı tercihini dikkate almalısın. Asla eksik kombin önermemelisin.`
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
