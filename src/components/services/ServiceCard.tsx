/**
 * Card de um serviço: imagem de referência, descrição, preço inicial,
 * botão "Ver pacotes" (abre o modal) e atalho "+" para o orçamento.
 *
 * Variantes de layout:
 *  - `feature`: card grande (2×2 na grade), com lista de entregáveis;
 *  - `span`: em quais breakpoints o card fica largo, com imagem à esquerda
 *    (fecha a última linha da grade — ver `gridLayout.ts`).
 */
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Check, Plus } from 'lucide-react';
import { SERVICES, cheapestPackage, formatBRL, isMonthly, recommendedPackage, type Service } from '../../data/services';
import { serviceImage } from '../../data/serviceImages';
import { SITE } from '../../data/site';
import { trackSpotlight } from '../../lib/dom';
import { useQuote } from '../../lib/quote';
import { ServiceIcon } from '../ui/ServiceIcon';
import { spanClasses, type SpanPlan } from './gridLayout';

interface ServiceCardProps {
  service: Service;
  feature?: boolean;
  span?: SpanPlan;
  onOpen: (service: Service) => void;
}

export default function ServiceCard({ service, feature = false, span = {}, onOpen }: ServiceCardProps) {
  const { add, has } = useQuote();
  const added = has(service.id);
  const layout = spanClasses(span);
  const wide = layout.isWide;
  const image = serviceImage(service.id);
  const cheapest = cheapestPackage(service);
  const number = String(SERVICES.indexOf(service) + 1).padStart(2, '0');

  return (
    <article
      onMouseMove={trackSpotlight}
      className={`spotlight group flex h-full overflow-hidden rounded-3xl border bg-surface transition-colors duration-500 hover:border-line-strong ${
        added ? 'border-white/25' : 'border-line'
      } flex-col ${layout.article}`}
    >
      {/* Imagem de referência (clicável) */}
      <button
        onClick={() => onOpen(service)}
        aria-label={`Ver pacotes de ${service.title}`}
        className={`relative block shrink-0 overflow-hidden ${
          feature ? 'aspect-[16/10] lg:aspect-auto lg:min-h-[300px] lg:flex-1' : `aspect-[16/10] ${layout.image}`
        }`}
      >
        {image && (
          <img
            src={image}
            alt={`Referência de ${service.title} — ORVIAN`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]"
          />
        )}
        {/* degradê que funde a imagem com o card */}
        <span className={`absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent ${layout.gradient}`} aria-hidden />
        <span
          className="absolute right-4 top-4 rounded-full bg-canvas/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-2 backdrop-blur"
          aria-hidden
        >
          {number}
        </span>
      </button>

      {/* Conteúdo */}
      <div className={`relative flex flex-col px-5 pb-5 sm:px-6 sm:pb-6 ${feature ? 'md:px-8 md:pb-8' : 'flex-1'} ${layout.content}`}>
        <span
          className={`-mt-6 flex items-center justify-center rounded-2xl border border-line-strong bg-elevated shadow-lg ${feature ? 'h-14 w-14' : 'h-12 w-12'} ${layout.icon}`}
        >
          <ServiceIcon name={service.icon} className={feature ? 'h-6 w-6' : 'h-5 w-5'} />
        </span>

        <h3 className={`font-display mt-5 font-medium leading-tight ${feature ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-xl'}`}>{service.title}</h3>
        <p className={`mt-3 leading-relaxed text-ink-2 ${feature ? 'text-base md:max-w-md' : 'text-sm'}`}>
          {feature || wide ? service.description : service.short}
        </p>

        {feature && (
          <ul className="mt-6 grid gap-2 text-sm text-ink-2 sm:grid-cols-2">
            {recommendedPackage(service)
              .features.filter((f) => !f.startsWith('Tudo do')) // "Tudo do Essencial" não diz nada fora do contexto
              .slice(0, 4)
              .map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden />
                  {f}
                </li>
              ))}
          </ul>
        )}

        <div className="mt-auto pt-7">
          {SITE.showPrices && (
            <p className="text-xs text-ink-3">
              a partir de <span className="font-display text-base text-ink">{formatBRL(cheapest.priceMin)}</span>
              {isMonthly(cheapest) && <span>/mês</span>}
            </p>
          )}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => onOpen(service)}
              className="flex min-w-0 flex-1 items-center justify-between rounded-full border border-line-strong px-4 py-2.5 text-sm transition hover:bg-white/5"
            >
              Ver pacotes
              <ArrowUpRight
                className="h-4 w-4 shrink-0 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden
              />
            </button>
            <button
              onClick={() => add(service.id)}
              aria-label={added ? `${service.title} já está no orçamento` : `Adicionar ${service.title} ao orçamento`}
              aria-pressed={added}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${added ? 'bg-ink text-canvas' : 'border border-line-strong hover:bg-white/10'}`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={added ? 'added' : 'add'}
                  initial={{ scale: 0.5, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0.5, rotate: 90 }}
                >
                  {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
