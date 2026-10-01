/**
 * Função Netlify: POST /api/chat — respostas da Orvia (Gemini ou respostas locais).
 * A lógica é a mesma do `server.ts`, em `api/core.ts`.
 */
import type { Config, Context } from '@netlify/functions';
import { TOO_MANY, handleChat, isRateLimited } from '../../api/core.ts';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  if (isRateLimited(`chat:${context.ip}`, 20)) return Response.json(TOO_MANY.body, { status: TOO_MANY.status });

  const result = await handleChat(await req.json().catch(() => ({})));
  return Response.json(result.body, { status: result.status });
};

export const config: Config = { path: '/api/chat' };
