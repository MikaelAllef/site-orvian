/**
 * Configuração geral da ORVIAN.
 * Contatos e opções globais do site ficam centralizados aqui para que
 * nenhum componente tenha telefone, e-mail ou links "chumbados" no código.
 */

export const SITE = {
  city: 'São Paulo · SP',
  /** WhatsApp no formato internacional, só dígitos. TODO: trocar pelo número real. */
  whatsapp: '5511999999999',
  email: 'contato@orvian.com.br',
  instagram: 'https://www.instagram.com/byorvian/',
  instagramHandle: '@byorvian',
  /** Prazo de retorno exibido no site e usado pelo chatbot. */
  responseTime: 'até 2 horas úteis',
  /** `false` esconde todos os valores e mantém apenas o pedido de orçamento. */
  showPrices: true,
} as const;

/** Monta um link do WhatsApp com a mensagem já preenchida. */
export const whatsappLink = (text: string) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
