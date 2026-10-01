/**
 * "Cérebro" da Orvia, a assistente do chat.
 *
 * Usado em dois lugares:
 *  - no servidor: gera o prompt do Gemini e interpreta a resposta da IA;
 *  - no servidor e no navegador: respostas locais por intenção, usadas
 *    quando não há chave de IA ou quando o servidor está fora do ar.
 *
 * Por ser compartilhado com o `server.ts`, não pode depender do navegador.
 */
import { SERVICES, catalogSummary, cheapestPackage, formatBRL, formatPackagePrice, isMonthly, recommendedPackage, type Service } from '../data/services';
import { SITE } from '../data/site';

/* ──────────────────────────────── Tipos ──────────────────────────────── */

/** Botões de ação que a Orvia pode sugerir abaixo de uma resposta. */
export type ChatAction =
  | { type: 'add'; serviceId: string }
  | { type: 'quote' }
  | { type: 'services' }
  | { type: 'whatsapp' }
  /** Mostra os pacotes de um serviço dentro do próprio chat. */
  | { type: 'detail'; serviceId: string };

/** Aparências da mascote — cada uma tem uma imagem própria. */
export type Mood = 'ola' | 'escrevendo' | 'ajudando' | 'sucesso';

export interface ChatReply {
  reply: string;
  actions?: ChatAction[];
  mood?: Mood;
  /** `true` encerra o atendimento e exibe o convite do Instagram. */
  end?: boolean;
}

/* ─────────────────────────── Detecção de intenção ─────────────────────────── */

/** Minúsculas e sem acentos — "Orçamento" e "orcamento" viram a mesma coisa. */
const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const GREETING_RE = /^(oi+|ola|opa|bom dia|boa tarde|boa noite|e ai|eai|hey|hello|salve)\b/;
const ENDING_RE = /(obrigad|valeu|vlw|brigad|tchau|ate mais|ate logo|resolvid|era (so )?isso|so isso|encerrar|finalizar|ajudou|tudo certo)/;

/** Mensagem curta que é só um cumprimento ("oi", "boa tarde"). */
export function isGreeting(text: string) {
  const t = normalize(text).trim();
  return t.length < 30 && GREETING_RE.test(t);
}

/** Agradecimento/despedida sem nova pergunta — encerra o atendimento. */
export function isEnding(text: string) {
  const t = normalize(text).trim();
  return t.length < 70 && !t.includes('?') && ENDING_RE.test(t);
}

/** Palavras-chave que ligam a mensagem do cliente a um serviço do catálogo. */
const SERVICE_KEYWORDS: Record<string, string[]> = {
  'identidade-visual': ['identidade', 'branding', 'marca completa', 'manual de marca', 'rebranding', 'guia da marca'],
  logo: ['logo', 'logotipo', 'simbolo', 'marca nova'],
  'gestao-instagram': ['instagram', 'insta', 'social media', 'gerenciamento', 'gestao de redes', 'redes sociais', 'perfil', 'bio'],
  'site-landing': ['site', 'landing', 'pagina', 'website', 'loja virtual', 'dominio'],
  automacao: ['automacao', 'automatizar', 'chatbot', 'bot', 'agente', 'n8n', 'ia ', 'inteligencia artificial', 'lead', 'crm', 'qualific'],
  combos: ['combo', 'pacote completo', 'presenca digital', 'tudo junto'],
  consultoria: ['consultoria', 'diagnostico', 'por onde comecar', 'nao sei por onde', 'orientacao', 'plano de acao'],
  manutencao: ['manutencao', 'suporte', 'atualizacao', 'atualizar', 'ajuste'],
  'posts-avulsos': ['post', 'arte', 'template', 'canva', 'carrossel'],
  'producao-conteudo': ['foto', 'video', 'reels', 'filmagem', 'ensaio', 'conteudo'],
  trafego: ['trafego', 'anuncio', 'ads', 'impulsionar', 'campanha', 'patrocinado'],
};

function detectServices(text: string): Service[] {
  const t = normalize(text);
  return SERVICES.filter((s) => SERVICE_KEYWORDS[s.id]?.some((kw) => t.includes(kw)));
}

/* ─────────────────────────── Respostas locais ─────────────────────────── */

/** Mensagem de encerramento com convite para seguir no Instagram. */
export const FAREWELL =
  'Foi um prazer te ajudar! Atendimento concluído com sucesso.\n\n' +
  'Antes de ir: que tal acompanhar a ORVIAN de perto? No Instagram a gente mostra ' +
  '**bastidores dos projetos, cases reais e dicas** pra deixar sua marca ainda mais forte. Te vejo por lá!';

/** "a partir de R$ X" (com /mês quando o pacote mais barato é mensal). */
const startingAt = (s: Service) => {
  const pkg = cheapestPackage(s);
  return `${formatBRL(pkg.priceMin)}${isMonthly(pkg) ? '/mês' : ''}`;
};

/** Responde sem IA, por regras simples de intenção, e define a aparência da Orvia. */
export function localReply(message: string): ChatReply {
  const reply = matchIntent(message);
  return { ...reply, mood: reply.end ? 'sucesso' : (reply.mood ?? 'ajudando') };
}

/** A ordem dos testes importa: o mais específico vem primeiro. */
function matchIntent(message: string): ChatReply {
  const t = normalize(message);
  const mentions = (...words: string[]) => words.some((w) => t.includes(w));

  // 1. Encerramento
  if (isEnding(message)) return { reply: FAREWELL, end: true };

  // 2. Cliente citou um serviço → descreve (ou lista pacotes se perguntou preço)
  const found = detectServices(message);
  if (found.length) {
    const [service, ...others] = found;
    const askedPrice = mentions('preco', 'valor', 'quanto', 'custa', 'custo', 'investimento', 'pacote', 'plano');
    const packages = service.packages
      .map((p) => `• **${p.name}** (${p.billing}) — ${formatPackagePrice(p)} · ${p.deadline}\n  Indicado para: ${p.idealFor}`)
      .join('\n');
    const combo = others.length ? `\n\nVi que você também citou **${others.map((o) => o.title).join(', ')}** — dá pra combinar tudo no mesmo orçamento.` : '';

    return {
      reply: askedPrice
        ? `**${service.title}** tem ${service.packages.length} opções:\n${packages}\n\nOs valores são faixas de referência; o final é confirmado após o briefing.${combo}`
        : `**${service.title}** — ${service.description}\n\nA partir de **${startingAt(service)}**, com entrega em ${recommendedPackage(service).deadline} no pacote mais pedido. Quer ver os pacotes ou já adicionar ao orçamento?${combo}`,
      actions: [...found.slice(0, 2).map((s) => ({ type: 'add' as const, serviceId: s.id })), { type: 'quote' }],
    };
  }

  // 3. Pediu a lista de produtos
  if (mentions('produtos', 'catalogo', 'quais servicos', 'o que voces fazem', 'outros servicos', 'lista de servicos')) return catalogReply();

  // 4. Assuntos gerais
  if (mentions('humano', 'atendente', 'pessoa', 'falar com', 'whats', 'telefone', 'ligar')) {
    return { reply: `Claro! Você pode falar direto com a equipe ORVIAN pelo WhatsApp — respondemos em ${SITE.responseTime}.`, actions: [{ type: 'whatsapp' }] };
  }
  if (mentions('prazo', 'demora', 'quanto tempo', 'dias', 'urgente', 'rapido')) {
    return {
      reply: `Como nossos processos são acelerados por **IA**, entregamos em dias, não semanas:\n${SERVICES.filter((s) => !s.placeholder)
        .flatMap((s) =>
          s.packages
            .filter((p) => !isMonthly(p) && p.deadline !== 'Conforme escopo')
            .slice(0, 1)
            .map((p) => `• ${p.name}: ${p.deadline}`),
        )
        .join('\n')}\n\nCom pressa? No orçamento existe a opção **Expresso** (prioridade máxima, +25%).`,
      actions: [{ type: 'quote' }],
    };
  }
  if (mentions('pagamento', 'pagar', 'pix', 'cartao', 'boleto', 'parcel')) {
    return {
      reply:
        'Aceitamos **Pix, boleto e cartão**. Projetos normalmente são divididos em entrada + entrega; planos mensais são cobrados mês a mês, sem fidelidade longa.',
    };
  }
  if (mentions('orcamento', 'contratar', 'proposta', 'fechar', 'comecar', 'quero')) {
    return {
      reply: 'Perfeito! No simulador você escolhe os serviços, ajusta os pacotes e já vê a estimativa. Leva menos de 3 minutos.',
      actions: [{ type: 'quote' }, { type: 'whatsapp' }],
    };
  }
  if (mentions('preco', 'valor', 'quanto', 'custa', 'tabela')) {
    const list = SERVICES.map((s) => `• ${s.title}: a partir de ${startingAt(s)}`).join('\n');
    return { reply: `Valores de referência:\n${list}\n\nQual desses te interessa? Te mostro os pacotes.`, actions: [{ type: 'quote' }] };
  }
  if (mentions('onde fica', 'endereco', 'presencial', 'cidade', 'sao paulo', 'atendem', 'outro estado')) {
    return {
      reply: `A ORVIAN fica em ${SITE.city} e atende **todo o Brasil online**. Produções de foto/vídeo presenciais são feitas em SP e região (outras cidades sob consulta).`,
    };
  }
  if (mentions('direito', 'arquivo', 'editavel', 'propriedade')) {
    return {
      reply: 'Após a quitação você recebe **todos os arquivos finais** (PNG, SVG, PDF e editáveis quando aplicável) e os direitos de uso da sua marca.',
    };
  }
  if (mentions('portfolio', 'trabalhos', 'exemplos', 'cases')) {
    return {
      reply: `Você pode ver trabalhos recentes no Instagram ${SITE.instagramHandle}. Se quiser, envio exemplos do seu segmento pelo WhatsApp.`,
      actions: [{ type: 'whatsapp' }],
    };
  }
  if (isGreeting(message)) {
    return {
      reply:
        'Olá! Que bom ter você por aqui. Posso te ajudar a escolher serviços, tirar dúvidas sobre prazos e valores, ou montar seu orçamento. Por onde começamos?',
      actions: [{ type: 'services' }, { type: 'quote' }],
      mood: 'ola',
    };
  }

  // 5. Não entendeu → apresenta o catálogo
  return {
    reply: `Posso te ajudar com qualquer um destes serviços:\n${SERVICES.map((s) => `• ${s.title}`).join('\n')}\n\nMe conta um pouco do seu negócio e do que precisa, que eu indico o melhor caminho.`,
    actions: [{ type: 'services' }, { type: 'whatsapp' }],
  };
}

/* ─────────────────────── Catálogo navegável no chat ─────────────────────── */

/** Lista de produtos com um botão por serviço (usada em "Ver outros produtos"). */
export function catalogReply(): ChatReply {
  return {
    reply: `Claro! Estes são os nossos produtos — toque em um para ver pacotes, valores e prazos:\n${SERVICES.map((s) => `• **${s.title}** — a partir de ${startingAt(s)}`).join('\n')}`,
    actions: SERVICES.map((s) => ({ type: 'detail' as const, serviceId: s.id })),
    mood: 'ajudando',
  };
}

/** Detalhe de um serviço: todos os pacotes com faixa de preço, prazo e público. */
export function serviceReply(serviceId: string): ChatReply {
  const service = SERVICES.find((s) => s.id === serviceId);
  if (!service) return catalogReply();
  const packages = service.packages
    .map((p) => `• **${p.name}** — ${formatPackagePrice(p)} · ${p.deadline}\n  ${p.summary}\n  Indicado para: ${p.idealFor}`)
    .join('\n');
  return {
    reply: `**${service.title}**\n${service.description}\n\n${packages}\n\nOs valores são faixas de referência; o final é confirmado após o briefing.`,
    actions: [{ type: 'add', serviceId: service.id }, { type: 'quote' }],
    mood: 'ajudando',
  };
}

/* ─────────────────────────────── IA (Gemini) ─────────────────────────────── */

/** Instruções de sistema da IA, sempre geradas a partir do catálogo atual. */
export const SYSTEM_PROMPT = `Você é a Orvia, assistente virtual de atendimento da ORVIAN Serviços Digitais (São Paulo, atende todo o Brasil online).
A ORVIAN é uma agência digital premium com um único responsável que cuida de estratégia, design e tecnologia.

CATÁLOGO ATUAL (use exatamente estes nomes, faixas de preço, prazos e inclusões; os valores são faixas de referência e o final é confirmado após o briefing). Use o campo "indicado para" para recomendar o pacote certo ao perfil do cliente:
${catalogSummary()}

INFORMAÇÕES ÚTEIS:
- Resposta da equipe humana em ${SITE.responseTime}. WhatsApp e e-mail ${SITE.email}. Instagram ${SITE.instagramHandle}.
- Pagamento: Pix, boleto e cartão. Projetos: entrada + entrega. Planos mensais sem fidelidade longa.
- Todos os processos são acelerados por IA, por isso os prazos são curtos (dias, não semanas). Destaque isso quando falar de prazo.
- Prazo Expresso disponível no orçamento (+25% em projetos).
- O cliente recebe arquivos finais e direitos de uso da marca após a quitação.
- O site tem um simulador de orçamento na seção "Orçamento".

COMO RESPONDER:
- Português do Brasil, tom elegante, próximo e objetivo. Respostas curtas (até ~90 palavras), use **negrito** e listas com "• " quando ajudar.
- Recomende serviços com base no negócio do cliente. Nunca invente serviços ou valores fora do catálogo; para algo fora dele, diga que a equipe avalia sob consulta.
- Se o cliente quiser contratar, conduza para o simulador de orçamento ou WhatsApp.
- Ao final, SE fizer sentido, adicione UMA linha no formato exato: AÇÕES: add:<id-do-serviço>, quote, whatsapp, services
  IDs válidos: ${SERVICES.map((s) => s.id).join(', ')}. Use no máximo 3 ações. Não explique essa linha.
- Quando o cliente agradecer, se despedir ou disser que a dúvida foi resolvida, encerre o atendimento: agradeça de forma calorosa, convide-o a seguir a ORVIAN no Instagram ${SITE.instagramHandle} (bastidores, cases e dicas de marca) e use a ação "end" (AÇÕES: end).`;

/**
 * Separa o texto da IA da linha de controle "AÇÕES: ..." e a converte
 * em botões. Ids de serviço inválidos são descartados por segurança.
 */
export function parseModelReply(text: string): ChatReply {
  const lines = text.trim().split('\n');
  const idx = lines.findIndex((l) => /^\s*A[ÇC][ÕO]ES\s*:/i.test(l));
  if (idx === -1) return { reply: text.trim() };

  const raw = lines[idx].split(':').slice(1).join(':');
  lines.splice(idx, 1);

  const actions: ChatAction[] = [];
  for (const token of raw.split(',').map((x) => x.trim())) {
    if (token.startsWith('add:')) {
      const id = token.slice(4).trim();
      if (SERVICES.some((s) => s.id === id)) actions.push({ type: 'add', serviceId: id });
    } else if (token === 'quote' || token === 'whatsapp' || token === 'services') {
      actions.push({ type: token });
    }
  }

  return { reply: lines.join('\n').trim(), actions: actions.slice(0, 3), end: /\bend\b/i.test(raw) };
}
