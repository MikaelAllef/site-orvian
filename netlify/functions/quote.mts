/**
 * Função Netlify: POST /api/quote — recebe o orçamento e envia ao n8n.
 *
 * Diferenças em relação ao `server.ts`:
 *  - não grava `orcamentos.jsonl` (o disco do Netlify é somente leitura;
 *    o registro oficial passa a ser a planilha preenchida pelo n8n);
 *  - o envio ao n8n é aguardado, porque a função "congela" ao responder.
 */
import type { Config, Context } from '@netlify/functions';
import { TOO_MANY, isRateLimited, sendToWebhook, validateQuote } from '../../api/core.ts';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  if (isRateLimited(`quote:${context.ip}`, 5)) return Response.json(TOO_MANY.body, { status: TOO_MANY.status });

  const outcome = validateQuote(await req.json().catch(() => ({})));
  if ('honeypot' in outcome) return Response.json({ ok: true, protocol: 'ORV-000000' }); // robô: "ok" sem registrar
  if ('error' in outcome) return Response.json(outcome.error.body, { status: outcome.error.status });

  const { record } = outcome;
  const delivered = await sendToWebhook(record);
  console.log(`[quote] ${record.protocol} — ${record.itens.length} item(s) — n8n: ${delivered ? 'ok' : 'falhou/desligado'}`);

  return Response.json({ ok: true, protocol: record.protocol });
};

export const config: Config = { path: '/api/quote' };
