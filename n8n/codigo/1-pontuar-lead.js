/**
 * n8n · nó "Pontuar lead" (Code, executa uma vez para todos os itens)
 *
 * Recebe o orçamento enviado pelo site (corpo do Webhook) e:
 *  1. calcula uma nota de 1 a 10 por regras simples — serve de referência
 *     para a IA e de reserva caso a IA esteja indisponível;
 *  2. monta o pedido para o Gemini classificar o lead.
 */
const lead = $input.first().json.body ?? {};
const valores = lead.estimativaNum ?? {};
const itens = Array.isArray(lead.itens) ? lead.itens : [];
const cliente = lead.cliente ?? {};

// ── Nota por regras ──────────────────────────────────────────────
let nota = 1;
const motivos = [];

const ticket = (valores.projetosMax ?? 0) + (valores.mensalMax ?? 0) * 6; // mensal ≈ 6 meses
if (ticket >= 8000) { nota += 4; motivos.push('ticket alto'); }
else if (ticket >= 3000) { nota += 3; motivos.push('ticket médio'); }
else if (ticket >= 1000) { nota += 2; motivos.push('ticket de entrada'); }

if ((valores.mensalMax ?? 0) > 0) { nota += 1; motivos.push('recorrência mensal'); }
if (itens.length >= 2) { nota += 1; motivos.push(`${itens.length} serviços`); }
if (lead.prazo === 'expresso') { nota += 1; motivos.push('urgência (expresso)'); }
if ((lead.observacoes ?? '').trim().length > 40) { nota += 1; motivos.push('briefing detalhado'); }
if (cliente.empresa) { nota += 1; motivos.push('informou a empresa'); }

nota = Math.max(1, Math.min(10, nota));
const prioridade = nota >= 7 ? 'quente' : nota >= 4 ? 'morno' : 'frio';

// ── Pedido para a IA ─────────────────────────────────────────────
const servicos = itens.map((i) => `${i.servico} — ${i.pacote} (${i.cobranca}, R$ ${i.valorMin}–${i.valorMax})`).join('; ');
const prompt = `Você qualifica leads da ORVIAN, agência digital premium (marca, Instagram, sites e automação com IA).
Analise o pedido de orçamento abaixo e responda SOMENTE com JSON no formato:
{"nota": número de 1 a 10, "prioridade": "quente" | "morno" | "frio", "resumo": "1 frase sobre o cliente e a necessidade", "proximoPasso": "ação recomendada para o primeiro contato"}

Pedido:
- Empresa: ${cliente.empresa || 'não informada'} · Segmento: ${cliente.segmento || 'não informado'}
- Serviços: ${servicos || 'nenhum'}
- Estimativa: projetos ${lead.estimativa?.projetos ?? '-'} · mensal ${lead.estimativa?.mensal ?? '-'}
- Prazo: ${lead.prazo === 'expresso' ? 'expresso (urgente)' : 'padrão'}
- Observações do cliente: ${lead.observacoes || 'nenhuma'}

Referência por regras: nota ${nota} (${motivos.join(', ') || 'poucos sinais'}). Ajuste se o contexto justificar.`;

return [
  {
    json: {
      ...lead,
      regra: { nota, prioridade, motivos },
      geminiBody: {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      },
    },
  },
];
