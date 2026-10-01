/**
 * Lógica das APIs do site, independente de onde roda.
 *
 * Usada por:
 *  - `server.ts` (Express) → desenvolvimento local / hospedagem Node;
 *  - `netlify/functions/*.mts` → produção no Netlify.
 *
 * Cada handler recebe o corpo da requisição e devolve `{ status, body }`,
 * sem depender de Express nem de Netlify.
 */
import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT, isEnding, isGreeting, localReply, parseModelReply } from '../src/lib/assistant.ts';
import { SERVICES, URGENCY, formatRange } from '../src/data/services.ts';

export interface ApiResult {
  status: number;
  body: unknown;
}

/* ─────────────────────────────── Utilidades ─────────────────────────────── */

/** Texto do corpo da requisição, limpo e com tamanho máximo. */
const cleanText = (value: unknown, max = 500) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

/**
 * Limite de requisições por chave (rota + IP) em janela de 1 minuto.
 * Em memória: vale por instância (no Netlify, cada função "quente" tem a sua).
 * É uma proteção básica contra abuso, não um bloqueio absoluto.
 */
const hits = new Map<string, { count: number; since: number }>();
export function isRateLimited(key: string, maxPerMinute: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now - entry.since > 60_000) {
    hits.set(key, { count: 1, since: now });
    return false;
  }
  return ++entry.count > maxPerMinute;
}

export const TOO_MANY: ApiResult = { status: 429, body: { reply: 'Muitas mensagens em pouco tempo — aguarde alguns segundos, por favor.' } };

/* ─────────────────────────────── Chat ─────────────────────────────── */

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
let aiClient: GoogleGenAI | null | undefined;

/** Cliente da IA, criado na primeira chamada. `null` = sem chave (respostas locais). */
function getAi() {
  if (aiClient === undefined) aiClient = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
  return aiClient;
}

export const chatModelLabel = () => (getAi() ? MODEL : 'respostas locais');

interface IncomingMessage {
  role: string;
  content: string;
}

/** Responde uma mensagem do chat (IA quando disponível; senão, respostas locais). */
export async function handleChat(payload: any): Promise<ApiResult> {
  const incoming: IncomingMessage[] = Array.isArray(payload?.messages) ? payload.messages : [];

  // Converte o histórico para o formato do Gemini (últimas 10 mensagens).
  const history = incoming
    .filter((m) => typeof m?.content === 'string' && m.content.trim())
    .slice(-10)
    .map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content.slice(0, 1500) }] }));

  const lastUserMessage = [...history].reverse().find((m) => m.role === 'user')?.parts[0].text;
  if (!lastUserMessage) return { status: 400, body: { error: 'Mensagem obrigatória.' } };

  // O Gemini exige que a conversa comece por uma mensagem do usuário.
  while (history.length && history[0].role !== 'user') history.shift();

  const ai = getAi();
  if (ai) {
    try {
      const quoteContext: string[] = Array.isArray(payload?.context?.quote) ? payload.context.quote : [];
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: history,
        config: {
          systemInstruction: SYSTEM_PROMPT + (quoteContext.length ? `\n\nO cliente já tem no orçamento: ${quoteContext.join(', ')}.` : ''),
          temperature: 0.6,
          maxOutputTokens: 600,
        },
      });

      if (response.text) {
        const parsed = parseModelReply(response.text);
        const end = Boolean(parsed.end) || isEnding(lastUserMessage);
        return { status: 200, body: { ...parsed, end, mood: end ? 'sucesso' : isGreeting(lastUserMessage) ? 'ola' : 'ajudando' } };
      }
    } catch (err) {
      console.warn('[chat] IA indisponível, usando respostas locais:', (err as Error).message);
    }
  }

  return { status: 200, body: localReply(lastUserMessage) };
}

/* ─────────────────────────────── Orçamento ─────────────────────────────── */

/** Registro de um orçamento, no formato enviado ao n8n. */
export type QuoteRecord = ReturnType<typeof buildRecord>;

/**
 * Valida o orçamento e monta o registro. Retorna o erro (status 400) ou o registro.
 * Os itens são recalculados pelo catálogo — nunca confiar em valores do navegador.
 */
export function validateQuote(payload: any): { error: ApiResult } | { record: QuoteRecord } | { honeypot: true } {
  const { items, details, website } = payload ?? {};

  // Honeypot: campo invisível para pessoas. Preenchido = robô.
  if (website) return { honeypot: true };

  const name = cleanText(details?.name, 120);
  const email = cleanText(details?.email, 160);
  const phone = cleanText(details?.phone, 30);
  if (!Array.isArray(items) || !items.length || !name || !/^\S+@\S+\.\S+$/.test(email) || phone.replace(/\D/g, '').length < 10) {
    return { error: { status: 400, body: { error: 'Dados incompletos.' } } };
  }
  if (!details?.consent) return { error: { status: 400, body: { error: 'É necessário autorizar o contato.' } } };

  const record = buildRecord(items, details, { name, email, phone });
  if (!record.itens.length) return { error: { status: 400, body: { error: 'Nenhum serviço válido no orçamento.' } } };
  return { record };
}

function buildRecord(items: { serviceId?: string; packageId?: string }[], details: any, contact: { name: string; email: string; phone: string }) {
  const lines = items.flatMap((item) => {
    const service = SERVICES.find((s) => s.id === item?.serviceId);
    const pkg = service?.packages.find((p) => p.id === item?.packageId);
    return service && pkg
      ? [
          {
            servico: service.title,
            pacote: pkg.name,
            idPlanilha: pkg.sheetId ?? null,
            cobranca: pkg.billing,
            valorMin: pkg.priceMin,
            valorMax: pkg.priceMax,
            prazo: pkg.deadline,
          },
        ]
      : [];
  });

  // Prazo expresso só encarece projetos, nunca mensalidades.
  const urgency = details?.urgency === 'expresso' ? 'expresso' : 'padrao';
  const multiplier = URGENCY.find((u) => u.id === urgency)?.multiplier ?? 1;
  const sum = (monthly: boolean, key: 'valorMin' | 'valorMax') =>
    Math.round(lines.filter((l) => (l.cobranca === 'Mensal') === monthly).reduce((acc, l) => acc + l[key] * (monthly ? 1 : multiplier), 0));

  return {
    protocol: 'ORV-' + Date.now().toString(36).slice(-6).toUpperCase(),
    createdAt: new Date().toISOString(),
    cliente: {
      nome: contact.name,
      email: contact.email,
      whatsapp: contact.phone,
      empresa: cleanText(details?.company, 120),
      segmento: cleanText(details?.segment, 60),
    },
    prazo: urgency,
    observacoes: cleanText(details?.notes, 2000),
    itens: lines,
    estimativa: {
      projetos: formatRange(sum(false, 'valorMin'), sum(false, 'valorMax')),
      mensal: formatRange(sum(true, 'valorMin'), sum(true, 'valorMax'), true),
    },
    // Mesmos valores em número, para automações (ex.: pontuação do lead no n8n).
    estimativaNum: {
      projetosMin: sum(false, 'valorMin'),
      projetosMax: sum(false, 'valorMax'),
      mensalMin: sum(true, 'valorMin'),
      mensalMax: sum(true, 'valorMax'),
    },
    origem: 'site',
  };
}

/**
 * Envia o orçamento ao fluxo do n8n (pasta `n8n/`).
 * A chave secreta no cabeçalho impede que terceiros chamem o webhook direto.
 * Nunca lança erro: uma falha na automação não pode derrubar o orçamento.
 */
export async function sendToWebhook(record: QuoteRecord): Promise<boolean> {
  const url = process.env.QUOTE_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.QUOTE_WEBHOOK_SECRET ? { 'X-Orvian-Secret': process.env.QUOTE_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify(record),
      // Abaixo do limite de 10 s das funções do Netlify.
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) console.warn(`[quote] webhook respondeu ${res.status}`);
    return res.ok;
  } catch (err) {
    console.warn('[quote] webhook falhou:', (err as Error).message);
    return false;
  }
}
