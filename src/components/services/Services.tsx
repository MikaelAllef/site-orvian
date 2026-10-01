/**
 * Seção "Serviços": filtro por categoria + grade de cards + modal de pacotes.
 *
 * O 1º card de "Todos" é o destaque; o cálculo que fecha a última linha
 * da grade sem buracos fica em `gridLayout.ts`.
 */
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CATEGORIES, SERVICES, type CategoryId, type Service } from '../../data/services';
import { EASE_OUT } from '../../lib/motion';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';
import ServiceCard from './ServiceCard';
import ServiceModal from './ServiceModal';
import { spanClasses, spanPlan } from './gridLayout';

type Filter = CategoryId | 'todos';

export default function Services() {
  const [filter, setFilter] = useState<Filter>('todos');
  const [openService, setOpenService] = useState<Service | null>(null);
  const list = filter === 'todos' ? SERVICES : SERVICES.filter((s) => s.category === filter);
  const hasFeature = filter === 'todos';

  return (
    <section id="servicos" className="relative py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col justify-between gap-8 xl:flex-row xl:items-end xl:gap-10">
          <SectionHeading
            eyebrow="Serviços"
            title={
              <>
                Tudo que sua marca precisa, <span className="text-ink-3">em um só lugar.</span>
              </>
            }
            intro="Escolha um serviço para ver os pacotes, ou adicione direto ao seu orçamento. Você pode combinar quantos quiser."
          />

          {/* Filtro — rola na horizontal no celular, com fade indicando que há mais */}
          <Reveal delay={0.1} className="-mx-5 min-w-0 px-5 md:mx-0 md:px-0 xl:shrink-0">
            <div
              role="tablist"
              aria-label="Filtrar serviços por categoria"
              className="no-scrollbar glass flex w-max max-w-full gap-1 overflow-x-auto rounded-full p-1 [mask-image:linear-gradient(90deg,#000_85%,transparent)] sm:[mask-image:none]"
            >
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={filter === c.id}
                  onClick={() => setFilter(c.id)}
                  className={`relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${filter === c.id ? 'text-canvas' : 'text-ink-2 hover:text-ink'}`}
                >
                  {filter === c.id && (
                    <motion.span
                      layoutId="category-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-ink"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.55 }}
                    />
                  )}
                  {c.label}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <motion.ul layout className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-14 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((service, i) => {
              const isFeature = hasFeature && i === 0;
              const span = spanPlan(i, list.length, hasFeature);
              return (
                <motion.li
                  layout
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.5, delay: i * 0.04, ease: EASE_OUT }}
                  className={isFeature ? 'sm:col-span-2 lg:row-span-2' : spanClasses(span).item}
                >
                  <ServiceCard service={service} feature={isFeature} span={span} onOpen={setOpenService} />
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </div>

      <ServiceModal service={openService} onClose={() => setOpenService(null)} />
    </section>
  );
}
