/**
 * Servidor local da ORVIAN (Express) — desenvolvimento e hospedagem Node.
 * Em produção no Netlify, as mesmas rotas rodam como funções (`netlify/functions/`).
 *
 * Rotas:
 *  - POST /api/chat  → respostas da Orvia
 *  - POST /api/quote → orçamento: grava em arquivo local e envia ao n8n
 *  - Em desenvolvimento serve o front com Vite; com `--prod`, serve a pasta `dist/`.
 *
 * A lógica das rotas fica em `api/core.ts`. Variáveis de ambiente: `.env.example`.
 */
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'] });

// Importado depois do dotenv para que `api/core.ts` já enxergue as variáveis.
const { TOO_MANY, chatModelLabel, handleChat, isRateLimited, sendToWebhook, validateQuote } = await import('./api/core.ts');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');
const QUOTES_FILE = path.join(__dirname, 'orcamentos.jsonl');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));

/** Cabeçalhos básicos de segurança (no Netlify, ficam no `netlify.toml`). */
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

app.post('/api/chat', async (req, res) => {
  if (isRateLimited(`chat:${req.ip}`, 20)) return void res.status(TOO_MANY.status).json(TOO_MANY.body);
  const result = await handleChat(req.body);
  res.status(result.status).json(result.body);
});

app.post('/api/quote', async (req, res) => {
  if (isRateLimited(`quote:${req.ip}`, 5)) return void res.status(TOO_MANY.status).json(TOO_MANY.body);

  const outcome = validateQuote(req.body);
  if ('honeypot' in outcome) return void res.json({ ok: true, protocol: 'ORV-000000' }); // robô: "ok" sem registrar
  if ('error' in outcome) return void res.status(outcome.error.status).json(outcome.error.body);

  const { record } = outcome;

  // Cópia local (contém dados pessoais: está no .gitignore — LGPD). Só existe fora do Netlify.
  fs.appendFile(QUOTES_FILE, JSON.stringify(record) + '\n', (err) => err && console.error('[quote] falha ao gravar arquivo:', err.message));

  // Aqui o envio ao n8n roda em segundo plano: o cliente recebe a resposta na hora.
  void sendToWebhook(record);

  console.log(`[quote] ${record.protocol} — ${record.cliente.nome} — ${record.itens.length} item(s)`);
  res.json({ ok: true, protocol: record.protocol });
});

/* ─────────────────────────────── Front-end ─────────────────────────────── */

if (IS_PROD) {
  const dist = path.resolve(__dirname, 'dist');
  app.use(express.static(dist, { maxAge: '7d', index: false }));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ORVIAN → http://localhost:${PORT} (${IS_PROD ? 'produção' : 'dev'}) · chat: ${chatModelLabel()}`);
});
