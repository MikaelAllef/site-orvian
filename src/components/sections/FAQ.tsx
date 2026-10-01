/**
 * Perguntas frequentes (acordeão) + atalho para conversar com a Orvia.
 */
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MessageCircle, Plus } from 'lucide-react';
import orviaHelping from '../../assets/images/orvia-ajudando.png';
import { FAQS } from '../../data/content';
import { EASE_OUT } from '../../lib/motion';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

export default function FAQ({ onOpenChat }: { onOpenChat: () => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div>
          <SectionHeading
            eyebrow="Dúvidas"
            title={
              <>
                Perguntas <span className="text-ink-3">frequentes.</span>
              </>
            }
          />
          <Reveal delay={0.1}>
            <div className="relative mt-14 rounded-3xl border border-line bg-surface p-5 sm:mt-16 sm:p-6">
              <img
                src={orviaHelping}
                alt=""
                className="mascot float-y pointer-events-none absolute -top-10 right-1 w-28 sm:-top-12 sm:right-2 sm:w-32"
                loading="lazy"
              />
              {/* recuo à direita reserva o espaço da mascote */}
              <p className="pr-24 font-display text-lg sm:pr-28">Não encontrou sua resposta?</p>
              <p className="mt-2 pr-24 text-sm text-ink-2 sm:pr-28">A Orvia, nossa assistente, responde na hora — 24h por dia.</p>
              <button onClick={onOpenChat} className="btn-primary mt-5 w-full sm:w-auto">
                <MessageCircle className="h-4 w-4" /> Conversar com a Orvia
              </button>
            </div>
          </Reveal>
        </div>

        <ul className="divide-y divide-line border-y border-line">
          {FAQS.map((item, i) => {
            const open = openIndex === i;
            const panelId = `faq-panel-${i}`;
            return (
              <li key={item.q}>
                <h3>
                  <button
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left sm:gap-6 sm:py-6"
                    aria-expanded={open}
                    aria-controls={panelId}
                  >
                    <span className={`font-display text-base transition-colors sm:text-lg md:text-xl ${open ? 'text-ink' : 'text-ink-2'}`}>{item.q}</span>
                    <motion.span
                      animate={{ rotate: open ? 45 : 0 }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-strong"
                      aria-hidden
                    >
                      <Plus className="h-4 w-4" />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={panelId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE_OUT }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-6 leading-relaxed text-ink-2">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
