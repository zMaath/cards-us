const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');

const app = express();

const GITHUB_TOKEN = process.env.TOKEN;

const upload = multer({ storage: multer.memoryStorage() });

function gerarId(tamanho = 20) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: tamanho }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

app.post('/api/upload', upload.single('imagem'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    const ext = path.extname(req.file.originalname);
    const fileName = gerarId() + ext;

    const base64 = req.file.buffer.toString('base64');

    const githubUrl = `https://api.github.com/repos/zMaath/cards-us/contents/cards/${fileName}`;

    await axios.put(
      githubUrl,
      {
        message: `upload ${fileName}`,
        content: base64,
        branch: 'main'
      },
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const finalUrl = `https://ustars.vercel.app/cards/${fileName}`;

    res.json({ url: finalUrl });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao enviar imagem.' });
  }
});

app.get('/cards/:file', (req, res) => {
  const file = req.params.file;

  const cdnUrl = `https://cdn.jsdelivr.net/gh/zMaath/cards-us/main/cards/${file}`;

  res.redirect(cdnUrl);
});


app.listen(8080, () => {
  console.log('Servidor rodando em http://localhost:8080');
});