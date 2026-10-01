/**
 * Textos institucionais do site (fora do catálogo de serviços).
 * Separar conteúdo de componente permite editar copy sem mexer em layout.
 */

/** Etapas da seção "Como funciona" — a ordem é a ordem real do atendimento. */
export const PROCESS_STEPS = [
  { title: 'Escolha', text: 'Conte o que sua empresa precisa — marca, presença, site ou automação. Leva poucos minutos aqui no site.' },
  { title: 'Conte', text: 'Explique seu negócio e seus objetivos. Uma conversa rápida alinha escopo, prioridades e prazo.' },
  { title: 'Receba', text: 'Receba uma proposta personalizada, com valores e entregas claras — normalmente no mesmo dia.' },
  { title: 'Evolua', text: 'Comece a construir sua nova presença digital, com processos acelerados por IA e acompanhamento próximo.' },
];

/**
 * As quatro áreas da seção "Soluções" — mostram que a ORVIAN estrutura a
 * presença digital inteira, não vende serviços isolados.
 */
export const SOLUTION_AREAS = [
  {
    key: 'marca',
    title: 'Marca',
    text: 'Identidade visual, logo e direção visual para sua empresa ser reconhecida e lembrada.',
    items: ['Identidade visual', 'Logo', 'Guia da marca'],
  },
  {
    key: 'presenca',
    title: 'Presença',
    text: 'Instagram, conteúdo e comunicação consistentes para manter sua marca ativa e relevante.',
    items: ['Instagram', 'Conteúdo', 'Comunicação'],
  },
  {
    key: 'digital',
    title: 'Digital',
    text: 'Sites, landing pages e experiências digitais pensadas para transmitir confiança e gerar contatos.',
    items: ['Sites', 'Landing pages', 'Experiências'],
  },
  {
    key: 'automacao',
    title: 'Automação',
    text: 'IA, integrações e processos inteligentes para atender, qualificar e vender com menos esforço.',
    items: ['Agentes de IA', 'Integrações', 'Processos'],
  },
];

/** Diferenciais da seção "Por que a ORVIAN". */
export const PILLARS = [
  { title: 'Um só responsável', text: 'Você fala direto com quem cria. Sem repasses, sem ruído.' },
  { title: 'Padrão premium', text: 'Cada entrega pensada para valorizar o preço do seu serviço.' },
  { title: 'Velocidade com IA', text: 'Processos acelerados por inteligência artificial: entregas em dias, não semanas, sem abrir mão do padrão premium.' },
];

/** Perguntas frequentes. */
export const FAQS = [
  {
    q: 'Os valores do orçamento online são finais?',
    a: 'São faixas de referência (valor mínimo e máximo de cada pacote). Depois do envio, confirmamos o escopo com você e enviamos a proposta final — normalmente no mesmo dia.',
  },
  {
    q: 'Como funciona o pagamento?',
    a: 'Projetos costumam ser divididos em entrada + entrega. Planos mensais (como gestão de Instagram) são cobrados mensalmente, sem fidelidade longa. Aceitamos Pix, boleto e cartão.',
  },
  {
    q: 'Quanto tempo leva cada serviço?',
    a: 'Como nossos processos são acelerados por IA, entregamos em dias, não semanas: uma logo sai em 2 a 3 dias úteis, uma landing page em 2 a 5 e um site institucional em 5 a 10. Cada pacote mostra seu prazo — e, com pressa, existe a opção Expresso.',
  },
  {
    q: 'Posso combinar vários serviços?',
    a: 'Sim — e é o mais comum. Identidade visual + gestão de Instagram, ou logo + site, por exemplo. Tudo com a mesma linguagem visual.',
  },
  {
    q: 'Vocês atendem fora de São Paulo?',
    a: 'Atendemos todo o Brasil de forma 100% online. Produção de foto e vídeo presencial é feita em São Paulo e região (outras cidades sob consulta).',
  },
  {
    q: 'Fico com os arquivos e direitos da marca?',
    a: 'Sim. Após a quitação, você recebe todos os arquivos finais e os direitos de uso da sua identidade visual e logo.',
  },
];

/** Segmentos sugeridos na etapa "Projeto" do orçamento. */
export const SEGMENTS = ['Saúde & estética', 'Advocacia & contabilidade', 'Alimentação', 'Moda & varejo', 'Imobiliário', 'Educação', 'Tecnologia', 'Outro'];
