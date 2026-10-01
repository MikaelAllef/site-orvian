/**
 * Resumo lateral do orçamento: itens escolhidos e totais estimados.
 * Fica fixo ao rolar no desktop; no celular aparece abaixo do formulário.
 */
import { AnimatePresence, motion } from 'motion/react';
import { Minus, Zap } from 'lucide-react';
import { formatPackagePrice } from '../../data/services';
import { SITE } from '../../data/site';
import { describeItems, useQuote } from '../../lib/quote';
import { ServiceIcon } from '../ui/ServiceIcon';
import { AnimatedRange } from './AnimatedPrice';

export default function QuoteSummary() {
  const { items, totals, details, remove } = useQuote();
  const rows = describeItems(items);

  return (
    <aside aria-label="Resumo do orçamento" className="lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-[2rem] border border-line bg-surface p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Resumo</p>
          <span className="font-mono text-xs text-ink-3">{items.length} item(s)</span>
        </div>

        <ul className="mt-5 min-h-[120px] space-y-3">
          <AnimatePresence initial={false}>
            {rows.length === 0 && (
              <motion.li
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-dashed border-line-strong p-5 text-center text-sm text-ink-3"
              >
                Nenhum serviço ainda. Selecione na lista ou na seção de serviços.
              </motion.li>
            )}
            {rows.map(({ service, pkg }) => (
              <motion.li
                key={service.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                className="flex items-start gap-3"
              >
                <ServiceIcon name={service.icon} className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="leading-tight">{service.title}</p>
                  <p className="text-xs text-ink-3">
                    {pkg.name} · {pkg.deadline}
                  </p>
                  {SITE.showPrices && <p className="mt-0.5 text-xs tabular-nums text-ink-2">{formatPackagePrice(pkg)}</p>}
                </div>
                <button onClick={() => remove(service.id)} className="shrink-0 opacity-60 transition hover:opacity-100" aria-label={`Remover ${service.title}`}>
                  <Minus className="h-4 w-4" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {SITE.showPrices && (
          <div className="mt-6 space-y-3 border-t border-line pt-5">
            {details.urgency === 'expresso' && (
              <p className="flex items-center gap-1.5 text-xs text-ink-3">
                <Zap className="h-3 w-3" aria-hidden /> Prazo expresso aplicado (+25% em projetos)
              </p>
            )}
            <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
              <span className="text-sm text-ink-2">Projetos</span>
              <AnimatedRange range={totals.oneOff} className="font-display text-xl font-medium sm:text-2xl" />
            </div>
            {totals.monthly.max > 0 && (
              <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
                <span className="text-sm text-ink-2">Recorrente</span>
                <span>
                  <AnimatedRange range={totals.monthly} className="font-display text-lg" />
                  <span className="text-sm text-ink-3">/mês</span>
                </span>
              </div>
            )}
            <p className="pt-1 text-[11px] leading-relaxed text-ink-3">Estimativa. O valor final é confirmado após entendermos seu escopo.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
