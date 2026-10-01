/**
 * Catálogo de serviços da ORVIAN.
 *
 * Fonte: planilha "Base Leads.xlsx" (versão atualizada: Base_Leads_atualizada.xlsx) (preços mínimo/máximo, prazos, inclusões e
 * público indicado). O campo `sheetId` liga cada pacote à linha "ID" da planilha.
 * Itens com `placeholder: true` (ou sem `sheetId`) ainda não estão na planilha
 * e usam valores fictícios — validar antes de publicar.
 *
 * Prazos já consideram os processos acelerados por IA.
 *
 * Este é o único lugar a editar: cards, simulador de orçamento e chatbot
 * (no navegador e no servidor) leem tudo daqui. Por ser importado também pelo
 * `server.ts`, este arquivo não pode importar imagens nem nada do navegador.
 */

/** Categorias usadas no filtro da seção de serviços. */
export type CategoryId = 'marca' | 'social' | 'web' | 'conteudo' | 'estrategia';

/** Ícones disponíveis (mapeados para o Lucide em `ui/ServiceIcon.tsx`). */
export type ServiceIconName = 'palette' | 'pen' | 'instagram' | 'monitor' | 'camera' | 'workflow' | 'layers' | 'megaphone' | 'package' | 'compass' | 'wrench';

/** Modelo de cobrança, como na coluna "Modelo de Cobrança" da planilha. */
export type Billing = 'Projeto' | 'Mensal' | 'Hora / Projeto';

export interface ServicePackage {
  /** Identificador estável — usado no orçamento e no WhatsApp. */
  id: string;
  /** Linha correspondente na planilha (coluna "ID"). Ausente = valor fictício. */
  sheetId?: number;
  name: string;
  billing: Billing;
  /** Faixa de preço em reais (BRL). Iguais = preço fixo. */
  priceMin: number;
  priceMax: number;
  deadline: string;
  /** Descrição curta do pacote (coluna "Descrição"). */
  summary: string;
  /** Entregáveis (coluna "Inclui"). */
  features: string[];
  /** Público indicado (coluna "Indicado Para"). */
  idealFor: string;
  /** Pacote recomendado: vem pré-selecionado e ganha destaque visual. */
  highlight?: boolean;
}

export interface Service {
  /** Também é o nome da imagem em `src/assets/images/servicos/<id>.webp`. */
  id: string;
  category: CategoryId;
  icon: ServiceIconName;
  title: string;
  /** Resumo de uma linha (cards pequenos). */
  short: string;
  /** Texto completo (card em destaque, modal e chatbot). */
  description: string;
  /** Serviço que ainda não está na planilha (valores fictícios). */
  placeholder?: boolean;
  packages: ServicePackage[];
}

export const CATEGORIES: { id: CategoryId | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'marca', label: 'Marca' },
  { id: 'social', label: 'Redes sociais' },
  { id: 'web', label: 'Web & Automação' },
  { id: 'estrategia', label: 'Combos & Consultoria' },
  { id: 'conteudo', label: 'Conteúdo' },
];

export const SERVICES: Service[] = [
  {
    id: 'identidade-visual',
    category: 'marca',
    icon: 'palette',
    title: 'Identidade Visual & Branding',
    short: 'Marca profissional e consistente, do logo ao guia de aplicação.',
    description: 'Estruturação visual e posicionamento da marca para uma presença mais profissional, consistente e fácil de reconhecer.',
    packages: [
      {
        sheetId: 1,
        id: 'identidade-essencial',
        name: 'Identidade Visual Essencial',
        billing: 'Projeto',
        priceMin: 1500,
        priceMax: 2500,
        deadline: '3 a 5 dias úteis',
        summary: 'Estruturação visual da marca para criar uma presença mais profissional e consistente.',
        features: ['Logo', 'Paleta de cores', 'Tipografia', 'Direcionamento visual'],
        idealFor: 'Empresas que precisam profissionalizar a marca',
        highlight: true,
      },
      {
        sheetId: 2,
        id: 'branding-completo',
        name: 'Branding Completo',
        billing: 'Projeto',
        priceMin: 2500,
        priceMax: 5000,
        deadline: '7 a 10 dias úteis',
        summary: 'Estruturação mais ampla da identidade e posicionamento visual da marca.',
        features: ['Identidade visual', 'Direção visual', 'Aplicações', 'Guia da marca'],
        idealFor: 'Empresas em reposicionamento ou lançamento',
      },
    ],
  },
  {
    id: 'logo',
    category: 'marca',
    icon: 'pen',
    title: 'Criação de Logo',
    short: 'Um símbolo marcante, versátil e pronto para todos os formatos.',
    description: 'Criação de logotipo para representar visualmente a empresa, entregue nas versões e formatos que você vai precisar.',
    packages: [
      {
        sheetId: 3,
        id: 'logo-essencial',
        name: 'Logo Essencial',
        billing: 'Projeto',
        priceMin: 500,
        priceMax: 1000,
        deadline: '2 a 3 dias úteis',
        summary: 'Criação de logotipo para representar visualmente a empresa.',
        features: ['Conceito', 'Logo principal', 'Variações básicas'],
        idealFor: 'Novos negócios ou marcas que precisam de uma logo',
        highlight: true,
      },
      {
        id: 'logo-profissional',
        name: 'Logo Profissional',
        billing: 'Projeto',
        priceMin: 1190,
        priceMax: 1190,
        deadline: '3 a 4 dias úteis',
        summary: 'Logo com mais conceitos e todas as versões de uso.',
        features: ['3 propostas de conceito', 'Versões horizontal', 'Vertical', 'Símbolo', 'Versões monocromáticas', 'Mockups de apresentação'],
        idealFor: 'Marcas que querem mais opções de conceito',
      },
      {
        id: 'logo-premium',
        name: 'Logo Premium',
        billing: 'Projeto',
        priceMin: 1890,
        priceMax: 1890,
        deadline: '4 a 6 dias úteis',
        summary: 'Logo completa com paleta, tipografia e itens para redes.',
        features: ['Tudo do Profissional', 'Paleta + tipografia', 'Favicon', 'Avatar de redes', 'Ajustes ilimitados por 30 dias'],
        idealFor: 'Marcas que querem a logo pronta para todos os canais',
      },
    ],
  },
  {
    id: 'gestao-instagram',
    category: 'social',
    icon: 'instagram',
    title: 'Instagram Profissional',
    short: 'Perfil organizado e presença ativa, com estratégia e constância.',
    description: 'Organização visual e estratégica do perfil e gestão recorrente de conteúdo para manter sua marca ativa e relevante.',
    packages: [
      {
        sheetId: 4,
        id: 'estruturacao-instagram',
        name: 'Estruturação de Instagram',
        billing: 'Projeto',
        priceMin: 600,
        priceMax: 1200,
        deadline: '2 a 3 dias úteis',
        summary: 'Organização visual e estratégica do perfil profissional.',
        features: ['Bio', 'Destaques', 'Identidade do perfil', 'Direcionamento visual'],
        idealFor: 'Empresas com perfil desorganizado',
      },
      {
        sheetId: 5,
        id: 'gestao-instagram',
        name: 'Gestão de Instagram',
        billing: 'Mensal',
        priceMin: 300,
        priceMax: 1500,
        deadline: 'Recorrente',
        summary: 'Gestão recorrente de conteúdo e presença digital.',
        features: ['Planejamento', 'Criação', 'Publicação conforme escopo contratado'],
        idealFor: 'Empresas que precisam manter presença ativa',
        highlight: true,
      },
    ],
  },
  {
    id: 'site-landing',
    category: 'web',
    icon: 'monitor',
    title: 'Sites & Landing Pages',
    short: 'Páginas rápidas e elegantes, pensadas para gerar oportunidades.',
    description: 'Sites e landing pages profissionais, responsivos e orientados à conversão — da página única de campanha ao site estratégico completo.',
    packages: [
      {
        sheetId: 8,
        id: 'lp-essencial',
        name: 'Landing Page Essencial',
        billing: 'Projeto',
        priceMin: 800,
        priceMax: 1500,
        deadline: '2 a 3 dias úteis',
        summary: 'Página única focada em apresentar uma oferta e gerar uma ação.',
        features: ['Estrutura', 'Copy base', 'CTA', 'Formulário ou contato'],
        idealFor: 'Campanhas e captação de leads',
      },
      {
        sheetId: 9,
        id: 'lp-estrategica',
        name: 'Landing Page Estratégica',
        billing: 'Projeto',
        priceMin: 1500,
        priceMax: 3000,
        deadline: '3 a 5 dias úteis',
        summary: 'Página orientada à conversão para campanhas ou ofertas específicas.',
        features: ['Estrutura estratégica', 'Design', 'CTA', 'Formulário', 'Integrações'],
        idealFor: 'Campanhas comerciais e tráfego pago',
      },
      {
        sheetId: 6,
        id: 'site-institucional',
        name: 'Site Institucional',
        billing: 'Projeto',
        priceMin: 2400,
        priceMax: 5000,
        deadline: '5 a 10 dias úteis',
        summary: 'Site profissional para apresentar empresa, serviços e gerar oportunidades.',
        features: ['Estrutura de páginas', 'Responsividade', 'Contato', 'Publicação'],
        idealFor: 'Empresas que precisam de presença digital própria',
        highlight: true,
      },
      {
        sheetId: 7,
        id: 'site-estrategico',
        name: 'Site Estratégico',
        billing: 'Projeto',
        priceMin: 5000,
        priceMax: 8000,
        deadline: '10 a 15 dias úteis',
        summary: 'Site com foco maior em posicionamento, conversão e experiência do usuário.',
        features: ['Estratégia', 'Estrutura', 'Design', 'Desenvolvimento', 'Integrações'],
        idealFor: 'Empresas com operação comercial mais estruturada',
      },
    ],
  },
  {
    id: 'automacao',
    category: 'web',
    icon: 'workflow',
    title: 'Automação & IA',
    short: 'Leads, atendimento e processos comerciais rodando sozinhos.',
    description: 'Automações e agentes de IA para receber, qualificar e atender leads, organizar o processo comercial e acabar com o trabalho repetitivo.',
    packages: [
      {
        sheetId: 10,
        id: 'automacao-leads',
        name: 'Automação de Leads',
        billing: 'Projeto',
        priceMin: 1500,
        priceMax: 3500,
        deadline: '3 a 7 dias úteis',
        summary: 'Automação para receber, classificar e encaminhar novos leads.',
        features: ['Captura', 'Classificação', 'Notificações', 'Encaminhamento'],
        idealFor: 'Empresas com volume recorrente de leads',
      },
      {
        sheetId: 11,
        id: 'automacao-comercial',
        name: 'Automação Comercial',
        billing: 'Projeto',
        priceMin: 3000,
        priceMax: 8000,
        deadline: '7 a 15 dias úteis',
        summary: 'Estruturação de processos comerciais com múltiplas etapas e integrações.',
        features: ['Fluxos', 'Integrações', 'Notificações', 'CRM', 'Acompanhamento'],
        idealFor: 'Empresas que precisam organizar o processo comercial',
      },
      {
        sheetId: 12,
        id: 'agente-ia',
        name: 'Agente de Atendimento com IA',
        billing: 'Projeto',
        priceMin: 3000,
        priceMax: 8000,
        deadline: '7 a 15 dias úteis',
        summary: 'Agente para responder, qualificar e organizar atendimentos comerciais.',
        features: ['Agente', 'Prompt', 'Memória', 'Modelo de IA', 'Integração'],
        idealFor: 'Empresas com atendimento repetitivo',
        highlight: true,
      },
      {
        sheetId: 13,
        id: 'qualificacao-ia',
        name: 'Qualificação de Leads com IA',
        billing: 'Projeto',
        priceMin: 2500,
        priceMax: 6000,
        deadline: '5 a 10 dias úteis',
        summary: 'Análise automática das informações do lead para classificação e priorização.',
        features: ['Classificação', 'Regras', 'Score', 'Encaminhamento'],
        idealFor: 'Operações comerciais com muitos leads',
      },
    ],
  },
  {
    id: 'combos',
    category: 'estrategia',
    icon: 'package',
    title: 'Combos de Presença Digital',
    short: 'Marca, Instagram e site integrados — mais resultado por menos.',
    description: 'Pacotes que combinam serviços para estruturar sua presença digital de forma integrada, com a mesma linguagem visual em todos os canais.',
    packages: [
      {
        sheetId: 14,
        id: 'branding-instagram',
        name: 'Branding + Instagram',
        billing: 'Projeto',
        priceMin: 2000,
        priceMax: 4500,
        deadline: '5 a 10 dias úteis',
        summary: 'Estruturação da marca junto à presença profissional no Instagram.',
        features: ['Identidade visual', 'Estruturação do Instagram'],
        idealFor: 'Negócios iniciando ou reposicionando presença digital',
      },
      {
        sheetId: 15,
        id: 'site-instagram',
        name: 'Site + Instagram',
        billing: 'Projeto',
        priceMin: 2500,
        priceMax: 5500,
        deadline: '7 a 12 dias úteis',
        summary: 'Criação de site combinada com estruturação inicial do Instagram.',
        features: ['Site', 'Estruturação inicial do Instagram'],
        idealFor: 'Empresas que precisam organizar a presença digital',
      },
      {
        sheetId: 16,
        id: 'presenca-completa',
        name: 'Presença Digital Completa',
        billing: 'Projeto',
        priceMin: 4500,
        priceMax: 9000,
        deadline: '12 a 20 dias úteis',
        summary: 'Estruturação integrada de marca, Instagram e site.',
        features: ['Branding', 'Instagram', 'Site conforme escopo'],
        idealFor: 'Empresas que precisam de uma estrutura digital completa',
        highlight: true,
      },
    ],
  },
  {
    id: 'consultoria',
    category: 'estrategia',
    icon: 'compass',
    title: 'Consultoria & Diagnóstico',
    short: 'Descubra por onde começar e quais ações trazem mais resultado.',
    description: 'Análise da presença digital e orientação estratégica para definir posicionamento, prioridades e um plano de ação claro.',
    packages: [
      {
        sheetId: 17,
        id: 'diagnostico',
        name: 'Diagnóstico Digital',
        billing: 'Projeto',
        priceMin: 300,
        priceMax: 800,
        deadline: '1 a 2 dias úteis',
        summary: 'Análise da presença digital e identificação das principais oportunidades de melhoria.',
        features: ['Diagnóstico', 'Recomendações prioritárias'],
        idealFor: 'Empresas que não sabem por onde começar',
        highlight: true,
      },
      {
        sheetId: 18,
        id: 'consultoria-estrategica',
        name: 'Consultoria Estratégica',
        billing: 'Hora / Projeto',
        priceMin: 300,
        priceMax: 1500,
        deadline: 'Conforme escopo',
        summary: 'Orientação para estruturar posicionamento, presença digital e prioridades do projeto.',
        features: ['Diagnóstico', 'Direcionamento', 'Plano de ação'],
        idealFor: 'Empresas que precisam de direcionamento',
      },
    ],
  },
  {
    id: 'manutencao',
    category: 'web',
    icon: 'wrench',
    title: 'Manutenção & Suporte',
    short: 'Site e automações sempre atualizados, sem dor de cabeça.',
    description: 'Planos mensais para manter site e automações funcionando, com atualizações, correções e ajustes contínuos.',
    packages: [
      {
        sheetId: 19,
        id: 'manutencao-site',
        name: 'Manutenção de Site',
        billing: 'Mensal',
        priceMin: 200,
        priceMax: 600,
        deadline: 'Recorrente',
        summary: 'Atualizações e ajustes após a entrega do site.',
        features: ['Atualizações', 'Pequenos ajustes conforme plano'],
        idealFor: 'Clientes com site ativo',
        highlight: true,
      },
      {
        sheetId: 20,
        id: 'suporte-automacao',
        name: 'Suporte de Automação',
        billing: 'Mensal',
        priceMin: 300,
        priceMax: 1000,
        deadline: 'Recorrente',
        summary: 'Acompanhamento e ajustes em automações existentes.',
        features: ['Correções', 'Ajustes', 'Suporte conforme plano'],
        idealFor: 'Clientes com automações em produção',
      },
    ],
  },
  {
    id: 'posts-avulsos',
    category: 'social',
    icon: 'layers',
    title: 'Design de Posts & Templates',
    short: 'Pacotes de artes e templates editáveis com a cara da sua marca.',
    description: 'Para quem já publica sozinho mas quer um padrão visual profissional: artes prontas e templates editáveis no Canva.',
    placeholder: true, // ⚠️ não está na planilha — valores fictícios
    packages: [
      {
        id: 'pack-10',
        name: 'Pack 10 artes',
        billing: 'Projeto',
        priceMin: 390,
        priceMax: 390,
        deadline: '2 a 3 dias úteis',
        summary: '10 artes para feed.',
        features: ['10 artes para feed', 'Formato post ou carrossel', '1 rodada de ajuste'],
        idealFor: 'Quem publica sozinho e quer padrão visual',
      },
      {
        id: 'pack-20',
        name: 'Pack 20 artes',
        billing: 'Projeto',
        priceMin: 690,
        priceMax: 690,
        deadline: '3 a 4 dias úteis',
        summary: '20 artes para feed e stories.',
        features: ['20 artes (feed + stories)', 'Capas de destaques', '2 rodadas de ajuste'],
        idealFor: 'Perfis com publicação frequente',
        highlight: true,
      },
      {
        id: 'kit-templates',
        name: 'Kit Templates',
        billing: 'Projeto',
        priceMin: 990,
        priceMax: 990,
        deadline: '4 a 5 dias úteis',
        summary: 'Templates editáveis no Canva.',
        features: ['30 templates editáveis no Canva', 'Guia rápido de uso', 'Capas de destaques', 'Treinamento de 30 min'],
        idealFor: 'Equipes que produzem o próprio conteúdo',
      },
    ],
  },
  {
    id: 'producao-conteudo',
    category: 'conteudo',
    icon: 'camera',
    title: 'Produção de Conteúdo',
    short: 'Fotos e vídeos profissionais para posicionar sua marca com autoridade.',
    description: 'Sessões de foto e vídeo, edição de reels e banco de imagens próprio — conteúdo real, com padrão premium.',
    placeholder: true, // ⚠️ não está na planilha — valores fictícios
    packages: [
      {
        id: 'sessao-foto',
        name: 'Sessão de Fotos',
        billing: 'Projeto',
        priceMin: 890,
        priceMax: 890,
        deadline: 'Entrega em 3 dias úteis',
        summary: 'Sessão de fotos com tratamento.',
        features: ['2h de sessão', '30 fotos tratadas', '1 locação'],
        idealFor: 'Marcas que precisam de banco de imagens',
      },
      {
        id: 'foto-video',
        name: 'Foto + Vídeo',
        billing: 'Projeto',
        priceMin: 1690,
        priceMax: 1690,
        deadline: 'Entrega em 5 dias úteis',
        summary: 'Produção de fotos e reels.',
        features: ['4h de produção', '50 fotos tratadas', '4 reels editados', 'Roteiro incluso'],
        idealFor: 'Perfis que querem conteúdo em vídeo',
        highlight: true,
      },
      {
        id: 'campanha',
        name: 'Campanha',
        billing: 'Projeto',
        priceMin: 3490,
        priceMax: 3490,
        deadline: 'Entrega em 7 dias úteis',
        summary: 'Diária completa com direção criativa.',
        features: ['Diária completa', '100 fotos tratadas', '8 vídeos editados', 'Direção criativa + roteiro'],
        idealFor: 'Lançamentos e campanhas',
      },
    ],
  },
  {
    id: 'trafego',
    category: 'social',
    icon: 'megaphone',
    title: 'Tráfego Pago',
    short: 'Anúncios no Instagram, Facebook e Google para gerar demanda previsível.',
    description: 'Estruturação de campanhas, públicos, criativos e otimização contínua com relatórios claros. Verba de mídia à parte.',
    placeholder: true, // ⚠️ não está na planilha — valores fictícios
    packages: [
      {
        id: 'meta-ads',
        name: 'Meta Ads',
        billing: 'Mensal',
        priceMin: 890,
        priceMax: 890,
        deadline: 'Início em 2 dias úteis',
        summary: 'Gestão de campanhas no Instagram e Facebook.',
        features: ['Até 2 campanhas ativas', 'Configuração de pixel', 'Relatório quinzenal'],
        idealFor: 'Negócios começando no tráfego pago',
      },
      {
        id: 'meta-google',
        name: 'Meta + Google',
        billing: 'Mensal',
        priceMin: 1590,
        priceMax: 1590,
        deadline: 'Início em 2 dias úteis',
        summary: 'Gestão de campanhas na Meta e no Google.',
        features: ['Até 5 campanhas', 'Criativos inclusos', 'Remarketing', 'Relatório semanal'],
        idealFor: 'Negócios que querem escalar a demanda',
        highlight: true,
      },
      {
        id: 'performance',
        name: 'Performance',
        billing: 'Mensal',
        priceMin: 2790,
        priceMax: 2790,
        deadline: 'Início em 2 dias úteis',
        summary: 'Gestão completa com testes contínuos.',
        features: ['Campanhas ilimitadas', 'Testes A/B contínuos', 'Landing page de campanha', 'Reunião quinzenal'],
        idealFor: 'Operações com investimento alto em mídia',
      },
    ],
  },
];

/* ─────────────────────────── Prazo e utilidades ─────────────────────────── */

/** Opções de prazo do simulador. O multiplicador vale só para projetos (não mensais). */
export const URGENCY = [
  { id: 'padrao', label: 'Prazo padrão', hint: 'Conforme cada pacote', multiplier: 1 },
  { id: 'expresso', label: 'Expresso', hint: 'Prioridade máxima na fila · +25%', multiplier: 1.25 },
] as const;

export type UrgencyId = (typeof URGENCY)[number]['id'];

export const isMonthly = (pkg: ServicePackage) => pkg.billing === 'Mensal';

/** Formata número como moeda brasileira, sem centavos (ex.: R$ 1.490). */
export const formatBRL = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

/** Faixa de preço: "R$ 1.500 – R$ 2.500" (ou valor único), com "/mês" nos mensais. */
export function formatRange(min: number, max: number, monthly = false) {
  const range = min === max ? formatBRL(min) : `${formatBRL(min)} – ${formatBRL(max)}`;
  return monthly ? `${range}/mês` : range;
}

export const formatPackagePrice = (pkg: ServicePackage) => formatRange(pkg.priceMin, pkg.priceMax, isMonthly(pkg));

export const getService = (id: string) => SERVICES.find((s) => s.id === id);

/** Pacote mais barato — base do "a partir de". */
export const cheapestPackage = (service: Service) => service.packages.reduce((a, b) => (b.priceMin < a.priceMin ? b : a));

/** Pacote recomendado (ou o primeiro). */
export const recommendedPackage = (service: Service) => service.packages.find((p) => p.highlight) ?? service.packages[0];

/** Texto-resumo do catálogo, injetado no prompt do chatbot. */
export function catalogSummary() {
  return SERVICES.map((s) => {
    const packages = s.packages
      .map(
        (p) => `  - ${p.name} (${p.billing}): ${formatPackagePrice(p)} · prazo ${p.deadline} · inclui: ${p.features.join(', ')} · indicado para: ${p.idealFor}`,
      )
      .join('\n');
    return `• ${s.title} — ${s.description}\n${packages}`;
  }).join('\n');
}
