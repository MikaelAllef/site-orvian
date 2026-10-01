/**
 * Lógica do chat, separada da interface:
 * histórico de mensagens, envio, humor da Orvia e encerramento.
 */
import { useState } from 'react';
import { catalogReply, localReply, serviceReply, type ChatAction, type ChatReply, type Mood } from '../../lib/assistant';
import { describeItems, type QuoteItem } from '../../lib/quote';

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  actions?: ChatAction[];
  /** Mensagem de encerramento (exibe o card do Instagram). */
  end?: boolean;
}

const GREETING: ChatMessage = {
  id: 0,
  role: 'assistant',
  content:
    'Olá! Eu sou a **Orvia**, assistente da ORVIAN. Posso tirar suas dúvidas sobre serviços, prazos e valores, ou te ajudar a montar o orçamento. Como posso ajudar você hoje?',
};

/** Tempo mínimo "escrevendo", para a resposta não surgir de forma brusca. */
const MIN_TYPING_MS = 1100;

/** Pede a resposta ao servidor; se falhar, responde localmente. */
async function fetchReply(history: ChatMessage[], quoteItems: QuoteItem[]): Promise<ChatReply> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: history.slice(-10).map(({ role, content }) => ({ role, content })),
        context: { quote: describeItems(quoteItems).map((r) => `${r.service.title} (${r.pkg.name})`) },
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as ChatReply;
  } catch {
    return localReply(history[history.length - 1].content);
  }
}

export function useChat(quoteItems: QuoteItem[]) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [typing, setTyping] = useState(false);
  const [mood, setMood] = useState<Mood>('ola');
  const [ended, setEnded] = useState(false);

  /**
   * Registra a mensagem do cliente e mostra a resposta com o efeito "escrevendo".
   * `getReply` decide de onde vem a resposta (servidor/IA ou catálogo local).
   */
  const exchange = async (text: string, getReply: (history: ChatMessage[]) => Promise<ChatReply> | ChatReply) => {
    const content = text.trim();
    if (!content || typing) return;

    const history = [...messages, { id: Date.now(), role: 'user' as const, content }];
    setMessages(history);
    setEnded(false);
    setTyping(true);
    setMood('escrevendo');

    const started = Date.now();
    const reply = await getReply(history);
    await new Promise((r) => setTimeout(r, Math.max(0, MIN_TYPING_MS - (Date.now() - started))));

    setTyping(false);
    setMood(reply.end ? 'sucesso' : (reply.mood ?? 'ajudando'));
    setEnded(Boolean(reply.end));
    setMessages((m) => [...m, { id: Date.now() + 1, role: 'assistant', content: reply.reply, actions: reply.actions, end: reply.end }]);
  };

  /** Pergunta livre → servidor (IA) com respostas locais de reserva. */
  const send = (text: string) => exchange(text, (history) => fetchReply(history, quoteItems));

  /** "Ver outros produtos" → lista do catálogo, sem depender do servidor. */
  const showCatalog = () => exchange('Quero ver outros produtos', () => catalogReply());

  /** Cliente tocou em um produto da lista → detalhes dos pacotes. */
  const showService = (serviceId: string, title: string) => exchange(`Quero saber sobre ${title}`, () => serviceReply(serviceId));

  const restart = () => {
    setMessages([GREETING]);
    setMood('ola');
    setEnded(false);
  };

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content;
  const userMessageCount = messages.filter((m) => m.role === 'user').length;

  return { messages, typing, mood, ended, send, showCatalog, showService, restart, lastUserMessage, userMessageCount };
}
