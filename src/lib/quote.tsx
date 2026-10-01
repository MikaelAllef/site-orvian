/**
 * Estado global do orçamento (React Context).
 *
 * Qualquer componente — card de serviço, modal, simulador ou chatbot — pode
 * adicionar/remover serviços. O estado vive só na memória da página.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  SERVICES,
  URGENCY,
  formatPackagePrice,
  formatRange,
  getService,
  isMonthly,
  recommendedPackage,
  type Service,
  type ServicePackage,
  type UrgencyId,
} from '../data/services';

/* ──────────────────────────────── Tipos ──────────────────────────────── */

/** Um serviço escolhido e o pacote selecionado para ele. */
export interface QuoteItem {
  serviceId: string;
  packageId: string;
}

/** Dados preenchidos nas etapas "Projeto" e "Contato". */
export interface QuoteDetails {
  urgency: UrgencyId;
  segment: string;
  notes: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  /** Aceite de uso dos dados para contato (LGPD). */
  consent: boolean;
}

/** Faixa de valores (mínimo–máximo), como na planilha de preços. */
export interface PriceRange {
  min: number;
  max: number;
}

export interface QuoteTotals {
  /** Soma dos projetos (já com acréscimo de prazo expresso). */
  oneOff: PriceRange;
  /** Soma dos planos mensais. */
  monthly: PriceRange;
}

interface QuoteContextValue {
  items: QuoteItem[];
  details: QuoteDetails;
  totals: QuoteTotals;
  /** Timestamp da última adição — usado para animar o contador do cabeçalho. */
  lastAdded: number;
  /** Adiciona (ou troca o pacote de) um serviço. Sem pacote, usa o recomendado. */
  add: (serviceId: string, packageId?: string) => void;
  remove: (serviceId: string) => void;
  setPackage: (serviceId: string, packageId: string) => void;
  has: (serviceId: string) => boolean;
  setDetails: (patch: Partial<QuoteDetails>) => void;
  reset: () => void;
}

const EMPTY_DETAILS: QuoteDetails = {
  urgency: 'padrao',
  segment: '',
  notes: '',
  name: '',
  email: '',
  phone: '',
  company: '',
  consent: false,
};

/* ─────────────────────────────── Provider ─────────────────────────────── */

const QuoteContext = createContext<QuoteContextValue | null>(null);

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [details, setDetailsState] = useState<QuoteDetails>(EMPTY_DETAILS);
  const [lastAdded, setLastAdded] = useState(0);

  const value = useMemo<QuoteContextValue>(() => {
    const add = (serviceId: string, packageId?: string) => {
      const service = getService(serviceId);
      if (!service) return;
      const chosen = packageId ?? recommendedPackage(service).id;
      setItems((prev) =>
        prev.some((i) => i.serviceId === serviceId)
          ? prev.map((i) => (i.serviceId === serviceId ? { ...i, packageId: chosen } : i))
          : [...prev, { serviceId, packageId: chosen }],
      );
      setLastAdded(Date.now());
    };

    return {
      items,
      details,
      lastAdded,
      totals: computeTotals(items, details.urgency),
      add,
      remove: (serviceId) => setItems((prev) => prev.filter((i) => i.serviceId !== serviceId)),
      setPackage: (serviceId, packageId) => setItems((prev) => prev.map((i) => (i.serviceId === serviceId ? { ...i, packageId } : i))),
      has: (serviceId) => items.some((i) => i.serviceId === serviceId),
      setDetails: (patch) => setDetailsState((d) => ({ ...d, ...patch })),
      reset: () => {
        setItems([]);
        setDetailsState(EMPTY_DETAILS);
      },
    };
  }, [items, details, lastAdded]);

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

/** Acesso ao orçamento. Precisa estar dentro de `<QuoteProvider>`. */
export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error('useQuote() precisa estar dentro de <QuoteProvider>.');
  return ctx;
}

/* ─────────────────────────── Funções puras ─────────────────────────── */

/** Calcula os totais. O prazo expresso só encarece projetos, nunca mensalidades. */
export function computeTotals(items: QuoteItem[], urgency: UrgencyId): QuoteTotals {
  const multiplier = URGENCY.find((u) => u.id === urgency)?.multiplier ?? 1;
  const oneOff = { min: 0, max: 0 };
  const monthly = { min: 0, max: 0 };
  for (const { pkg } of describeItems(items)) {
    if (isMonthly(pkg)) {
      monthly.min += pkg.priceMin;
      monthly.max += pkg.priceMax;
    } else {
      oneOff.min += pkg.priceMin * multiplier;
      oneOff.max += pkg.priceMax * multiplier;
    }
  }
  return { oneOff: { min: Math.round(oneOff.min), max: Math.round(oneOff.max) }, monthly };
}

/** Resolve os ids do orçamento para os objetos completos do catálogo. */
export function describeItems(items: QuoteItem[]): { service: Service; pkg: ServicePackage }[] {
  return items.flatMap((item) => {
    const service = SERVICES.find((s) => s.id === item.serviceId);
    const pkg = service?.packages.find((p) => p.id === item.packageId);
    return service && pkg ? [{ service, pkg }] : [];
  });
}

/** Texto pronto para o WhatsApp/e-mail com o resumo do orçamento. */
export function buildQuoteMessage(items: QuoteItem[], d: QuoteDetails, protocol: string) {
  const totals = computeTotals(items, d.urgency);
  const lines = describeItems(items).map(({ service, pkg }) => `• ${service.title} — ${pkg.name} (${formatPackagePrice(pkg)})`);

  return [
    `Olá, ORVIAN! Gostaria de um orçamento. Protocolo ${protocol}`,
    '',
    ...lines,
    '',
    `Prazo: ${d.urgency === 'expresso' ? 'Expresso' : 'Padrão'}`,
    totals.oneOff.max ? `Estimativa projetos: ${formatRange(totals.oneOff.min, totals.oneOff.max)}` : null,
    totals.monthly.max ? `Estimativa mensal: ${formatRange(totals.monthly.min, totals.monthly.max, true)}` : null,
    '',
    `Nome: ${d.name}`,
    d.company ? `Empresa: ${d.company}` : null,
    d.segment ? `Segmento: ${d.segment}` : null,
    d.notes ? `Detalhes: ${d.notes}` : null,
  ]
    .filter((line): line is string => line !== null)
    .join('\n')
    .trim();
}
