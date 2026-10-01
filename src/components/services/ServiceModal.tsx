/**
 * Janela com os pacotes de um serviço, lado a lado, para escolher e
 * adicionar ao orçamento. No celular abre como "gaveta" vinda de baixo.
 */
import { useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { formatRange, isMonthly, type Service } from '../../data/services';
import { serviceImage } from '../../data/serviceImages';
import { SITE } from '../../data/site';
import { useDialog } from '../../hooks/useDialog';
import { scrollToId } from '../../lib/dom';
import { EASE_OUT } from '../../lib/motion';
import { useQuote } from '../../lib/quote';
import { ServiceIcon } from '../ui/ServiceIcon';

/** Colunas dos pacotes conforme a quantidade (4 pacotes ficam em 2×2). */
const GRID_BY_COUNT: Record<number, string> = {
  1: 'md:grid-cols-1 md:max-w-md',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-2',
};

/** "Projeto", "Plano mensal" ou "Projeto ou mensal", conforme os pacotes do serviço. */
function billingLabel(service: Service) {
  const monthly = service.packages.filter(isMonthly).length;
  if (monthly === 0) return 'Projeto';
  if (monthly === service.packages.length) return 'Plano mensal';
  return 'Projeto ou mensal';
}

interface ServiceModalProps {
  /** Serviço exibido; `null` fecha o modal. */
  service: Service | null;
  onClose: () => void;
}

export default function ServiceModal({ service, onClose }: ServiceModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { add, items } = useQuote();
  useDialog({ open: Boolean(service), onClose, ref: dialogRef });

  const selectedPackage = service ? items.find((i) => i.serviceId === service.id)?.packageId : undefined;
  const image = service ? serviceImage(service.id) : undefined;

  const goToQuote = () => {
    onClose();
    setTimeout(() => scrollToId('orcamento'), 250); // espera a animação de saída
  };

  return (
    <AnimatePresence>
      {service && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Fundo escurecido (clique fecha) */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
            className="scrollbar-thin relative max-h-[92svh] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-t-[2rem] border border-line-strong bg-surface p-5 sm:rounded-[2rem] sm:p-6 md:p-10"
          >
            <button
              onClick={onClose}
              autoFocus
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-canvas/70 backdrop-blur hover:bg-canvas sm:right-5 sm:top-5"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Banner */}
            {image && (
              <div className="relative -mx-5 -mt-5 mb-6 aspect-[16/9] overflow-hidden sm:-mx-6 sm:-mt-6 sm:aspect-[21/9] md:-mx-10 md:-mt-10 md:mb-8">
                <motion.img
                  src={image}
                  alt={`Referência de ${service.title}`}
                  initial={{ scale: 1.08 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.4, ease: EASE_OUT }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" aria-hidden />
              </div>
            )}

            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-white/[0.03]">
                <ServiceIcon name={service.icon} className="h-5 w-5" />
              </span>
              <p className="eyebrow">{billingLabel(service)}</p>
            </div>
            <h3 id="service-modal-title" className="font-display mt-5 text-2xl font-medium sm:text-3xl md:text-4xl">
              {service.title}
            </h3>
            <p className="mt-3 max-w-2xl text-ink-2">{service.description}</p>

            {/* Pacotes */}
            <div className={`mt-10 grid gap-5 md:gap-4 ${GRID_BY_COUNT[service.packages.length] ?? 'md:grid-cols-3'}`}>
              {service.packages.map((pkg) => {
                const selected = selectedPackage === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    className={`relative flex flex-col rounded-3xl border p-5 transition sm:p-6 ${pkg.highlight ? 'border-white/25 bg-white/[0.04]' : 'border-line'} ${
                      selected ? 'ring-1 ring-ink' : ''
                    }`}
                  >
                    {pkg.highlight && (
                      <span className="absolute -top-3 left-6 rounded-full bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-canvas">
                        Recomendado
                      </span>
                    )}
                    <p className="font-display text-lg leading-tight">{pkg.name}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-3">{pkg.billing}</p>
                    {SITE.showPrices && (
                      <p className="mt-3 font-display text-2xl font-medium tabular-nums">
                        {formatRange(pkg.priceMin, pkg.priceMax)}
                        {isMonthly(pkg) && <span className="text-base text-ink-3">/mês</span>}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-ink-3">{pkg.deadline}</p>
                    <p className="mt-4 text-sm leading-relaxed text-ink-2">{pkg.summary}</p>
                    <ul className="mt-6 space-y-2.5 text-sm text-ink-2">
                      {pkg.features.map((f) => (
                        <li key={f} className="flex gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-3">
                      <span className="text-ink-2">Indicado para:</span> {pkg.idealFor}
                    </p>
                    <div className="mt-auto pt-6">
                      <button
                        onClick={() => add(service.id, pkg.id)}
                        aria-pressed={selected}
                        className={`w-full ${selected || !pkg.highlight ? 'btn-ghost' : 'btn-primary'}`}
                      >
                        {selected ? (
                          <>
                            <Check className="h-4 w-4" /> No orçamento
                          </>
                        ) : (
                          'Escolher este pacote'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col items-stretch justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
              <p className="text-sm text-ink-3">Precisa de algo diferente? Descreva no orçamento que adaptamos o escopo.</p>
              <button onClick={goToQuote} className="btn-primary">
                Ir para o orçamento <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
