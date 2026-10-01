/**
 * n8n · nó "Montar lead" (Code, executa uma vez para todos os itens)
 *
 * Junta o orçamento com a resposta da IA e prepara as três saídas:
 *  - a linha da planilha "Leads";
 *  - a mensagem do Telegram para a ORVIAN;
 *  - o e-mail de confirmação para o cliente.
 * Se a IA falhar (sem chave, fora do ar), usa a nota calculada por regras.
 */
const lead = $('Pontuar lead').first().json;
const resposta = $input.first().json;
const cliente = lead.cliente ?? {};
const itens = Array.isArray(lead.itens) ? lead.itens : [];

// ── Resposta da IA (com reserva) ─────────────────────────────────
let ia = null;
try {
  const texto = resposta.candidates[0].content.parts[0].text;
  ia = JSON.parse(texto.replace(/```json|```/g, '').trim());
} catch (erro) {
  ia = null; // segue com a nota por regras
}

const nota = Math.max(1, Math.min(10, Math.round(Number(ia?.nota)) || lead.regra.nota));
const prioridade = ['quente', 'morno', 'frio'].includes(ia?.prioridade) ? ia.prioridade : lead.regra.prioridade;
const resumo = ia?.resumo || `Interesse em ${itens.map((i) => i.servico).join(', ') || 'serviços da ORVIAN'}.`;
const proximoPasso = ia?.proximoPasso || 'Retornar pelo WhatsApp e agendar um briefing rápido.';
const classificadoPor = ia ? 'IA' : 'regras';

// ── Utilidades ───────────────────────────────────────────────────
/** Escapa texto do cliente antes de colocar em HTML (Telegram e e-mail). */
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const primeiroNome = String(cliente.nome ?? '').trim().split(' ')[0] || 'olá';
const dataBR = new Date(lead.createdAt ?? Date.now()).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
const whatsapp = String(cliente.whatsapp ?? '').replace(/\D/g, '');
const icone = { quente: '🔥', morno: '🌤️', frio: '❄️' }[prioridade];
const listaServicos = itens.map((i) => `${i.servico} — ${i.pacote}`).join(' · ');

// ── Telegram (HTML) ──────────────────────────────────────────────
const telegram = [
  `${icone} <b>Novo orçamento ${esc(lead.protocol)}</b> — lead ${prioridade} (${nota}/10)`,
  '',
  `<b>${esc(cliente.nome)}</b>${cliente.empresa ? ` · ${esc(cliente.empresa)}` : ''}${cliente.segmento ? ` · ${esc(cliente.segmento)}` : ''}`,
  `📱 <a href="https://wa.me/55${whatsapp.replace(/^55/, '')}">${esc(cliente.whatsapp)}</a> · ✉️ ${esc(cliente.email)}`,
  '',
  ...itens.map((i) => `• ${esc(i.servico)} — ${esc(i.pacote)}`),
  '',
  `💰 Projetos: ${esc(lead.estimativa?.projetos)} · Mensal: ${esc(lead.estimativa?.mensal)}`,
  `⏱️ Prazo: ${lead.prazo === 'expresso' ? 'Expresso' : 'Padrão'}`,
  lead.observacoes ? `📝 ${esc(lead.observacoes)}` : null,
  '',
  `🤖 <i>${esc(resumo)}</i>`,
  `➡️ ${esc(proximoPasso)}`,
]
  .filter((l) => l !== null)
  .join('\n');

// ── E-mail para o cliente ────────────────────────────────────────
const linhasItens = itens
  .map(
    (i) => `<tr><td style="padding:10px 0;border-bottom:1px solid #22252d;color:#efede6">${esc(i.servico)}<br><span style="color:#8b8f98;font-size:13px">${esc(i.pacote)} · ${esc(i.prazo)}</span></td></tr>`,
  )
  .join('');

const emailHtml = `<!doctype html><html><body style="margin:0;background:#07080b;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#07080b;padding:32px 16px"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0e1015;border:1px solid #22252d;border-radius:20px;padding:36px">
<tr><td style="color:#8b8f98;font-size:11px;letter-spacing:3px;text-transform:uppercase">ORVIAN · Serviços Digitais</td></tr>
<tr><td style="padding-top:18px;color:#efede6;font-size:24px;line-height:1.3">Recebemos seu pedido, ${esc(primeiroNome)}.</td></tr>
<tr><td style="padding-top:12px;color:#a3a6ad;font-size:15px;line-height:1.6">Nossa equipe está analisando o seu projeto e retorna pelo WhatsApp em até 2 horas úteis com a proposta personalizada.</td></tr>
<tr><td style="padding-top:22px"><span style="display:inline-block;border:1px solid #33363f;border-radius:999px;padding:8px 16px;color:#efede6;font-family:monospace;font-size:14px">Protocolo ${esc(lead.protocol)}</span></td></tr>
<tr><td style="padding-top:24px"><table width="100%" cellpadding="0" cellspacing="0">${linhasItens}</table></td></tr>
<tr><td style="padding-top:16px;color:#a3a6ad;font-size:14px">Estimativa: <b style="color:#efede6">${esc(lead.estimativa?.projetos)}</b>${(lead.estimativaNum?.mensalMax ?? 0) > 0 ? ` + <b style="color:#efede6">${esc(lead.estimativa?.mensal)}</b>` : ''}<br><span style="font-size:12px;color:#6b6f78">Valores de referência — o final é confirmado após o briefing.</span></td></tr>
<tr><td style="padding-top:28px;color:#a3a6ad;font-size:14px;line-height:1.6">Enquanto isso, acompanhe bastidores e cases no Instagram: <a href="https://www.instagram.com/byorvian/" style="color:#efede6">@byorvian</a></td></tr>
</table></td></tr></table></body></html>`;

return [
  {
    json: {
      // Colunas da aba "Leads" (os nomes batem com o cabeçalho da planilha)
      data: dataBR,
      protocolo: lead.protocol,
      nome: cliente.nome,
      email: cliente.email,
      whatsapp: cliente.whatsapp,
      empresa: cliente.empresa || '',
      segmento: cliente.segmento || '',
      servicos: listaServicos,
      projetos: lead.estimativa?.projetos ?? '',
      mensal: lead.estimativa?.mensal ?? '',
      prazo: lead.prazo === 'expresso' ? 'Expresso' : 'Padrão',
      observacoes: lead.observacoes || '',
      nota,
      prioridade,
      resumo,
      proximoPasso,
      classificadoPor,
      status: 'Novo',
      // Mensagens
      telegram,
      emailAssunto: `ORVIAN · Recebemos seu pedido (${lead.protocol})`,
      emailHtml,
    },
  },
];
