/**
 * Cálculo da grade de serviços para que a última linha nunca fique com buraco.
 *
 * Colunas por breakpoint: celular 1 · sm 2 · lg 3 · xl 4.
 * O card destaque (1º de "Todos") ocupa 2 colunas; a partir de lg, também 2 linhas.
 *
 * Quando a última linha fica incompleta em um breakpoint:
 *  - com 1 card sozinho → ele ocupa a linha inteira ("full");
 *  - com 2+ cards → os últimos ganham 1 coluna extra cada ("wide") até fechar a linha.
 * Cards largos passam a ter a imagem à esquerda.
 *
 * As classes estão escritas por extenso de propósito: o Tailwind só gera
 * classes que aparecem literalmente no código.
 */

export type Breakpoint = 'sm' | 'lg' | 'xl';
export type Span = 'wide' | 'full';
export type SpanPlan = Partial<Record<Breakpoint, Span>>;

const BREAKPOINTS: Breakpoint[] = ['sm', 'lg', 'xl'];
const COLUMNS: Record<Breakpoint, number> = { sm: 2, lg: 3, xl: 4 };
/** Células ocupadas pelo card destaque em cada breakpoint. */
const FEATURE_CELLS: Record<Breakpoint, number> = { sm: 2, lg: 4, xl: 4 };

/**
 * Plano de largura de um card (índice `index` de `total`) em cada breakpoint.
 * Só os cards da última linha podem ser alargados.
 */
export function spanPlan(index: number, total: number, hasFeature: boolean): SpanPlan {
  const plan: SpanPlan = {};
  if (hasFeature && index === 0) return plan;

  for (const bp of BREAKPOINTS) {
    const cols = COLUMNS[bp];
    const cells = hasFeature ? FEATURE_CELLS[bp] + (total - 1) : total;
    const inLastRow = cells % cols; // cards na última linha (0 = linha completa)
    if (inLastRow === 0) continue;

    const missing = cols - inLastRow;
    const fromEnd = total - 1 - index; // 0 = último card
    if (inLastRow === 1) {
      if (fromEnd === 0) plan[bp] = 'full';
    } else if (fromEnd < missing) {
      plan[bp] = 'wide';
    }
  }
  return plan;
}

/** Classes da coluna/célula e do layout interno do card, conforme o plano. */
export function spanClasses(plan: SpanPlan) {
  const wideAt = (bp: Breakpoint) => plan[bp] !== undefined;
  const pick = (wide: Record<Breakpoint, string>, normal: Record<Breakpoint, string>) =>
    BREAKPOINTS.map((bp) => (wideAt(bp) ? wide[bp] : normal[bp])).join(' ');

  if (!BREAKPOINTS.some(wideAt)) return { item: '', article: '', image: '', gradient: '', icon: '', content: '', isWide: false };

  const item = BREAKPOINTS.map((bp) => {
    const span = plan[bp];
    if (span === 'full') return { sm: 'sm:col-span-full', lg: 'lg:col-span-full', xl: 'xl:col-span-full' }[bp];
    if (span === 'wide') return { sm: 'sm:col-span-2', lg: 'lg:col-span-2', xl: 'xl:col-span-2' }[bp];
    return { sm: 'sm:col-span-1', lg: 'lg:col-span-1', xl: 'xl:col-span-1' }[bp];
  }).join(' ');

  return {
    isWide: true,
    item,
    article: pick({ sm: 'sm:flex-row', lg: 'lg:flex-row', xl: 'xl:flex-row' }, { sm: 'sm:flex-col', lg: 'lg:flex-col', xl: 'xl:flex-col' }),
    image: pick(
      { sm: 'sm:aspect-auto sm:w-1/2', lg: 'lg:aspect-auto lg:w-1/2', xl: 'xl:aspect-auto xl:w-1/2' },
      { sm: 'sm:aspect-[16/10] sm:w-auto', lg: 'lg:aspect-[16/10] lg:w-auto', xl: 'xl:aspect-[16/10] xl:w-auto' },
    ),
    gradient: pick(
      { sm: 'sm:bg-gradient-to-l', lg: 'lg:bg-gradient-to-l', xl: 'xl:bg-gradient-to-l' },
      { sm: 'sm:bg-gradient-to-t', lg: 'lg:bg-gradient-to-t', xl: 'xl:bg-gradient-to-t' },
    ),
    icon: pick({ sm: 'sm:mt-0', lg: 'lg:mt-0', xl: 'xl:mt-0' }, { sm: 'sm:-mt-6', lg: 'lg:-mt-6', xl: 'xl:-mt-6' }),
    content: pick({ sm: 'sm:pt-6', lg: 'lg:pt-6', xl: 'xl:pt-6' }, { sm: 'sm:pt-0', lg: 'lg:pt-0', xl: 'xl:pt-0' }),
  };
}
