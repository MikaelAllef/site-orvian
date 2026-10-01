/**
 * Seção "Como funciona": linha do tempo das etapas do atendimento.
 * A linha vertical se preenche conforme a página rola.
 */
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import automationImage from '../../assets/images/automacao-hub.webp';
import { PROCESS_STEPS } from '../../data/content';
import { scrollToId } from '../../lib/dom';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

export default function Process() {
  const timeline = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: timeline, offset: ['start 70%', 'end 60%'] });
  const fill = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section id="processo" className="relative py-20 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Como funciona"
            title={
              <>
                Simples do início ao fim. <span className="text-ink-2">Quatro passos até sua nova presença.</span>
              </>
            }
          />
          <Reveal delay={0.1} className="mt-8 md:mt-10">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-line sm:rounded-[2rem]">
              <img
                src={automationImage}
                alt="Ilustração do fluxo de automação e integração de processos da ORVIAN"
                className="aspect-[4/3] w-full object-cover opacity-90"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent" aria-hidden />
              <div className="glass absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 rounded-2xl p-3 sm:bottom-5 sm:left-5 sm:right-5 sm:p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Processos automatizados</p>
                  <p className="truncate text-xs text-ink-3">Briefing, aprovações e entregas organizados</p>
                </div>
                <span className="shrink-0 font-mono text-xs text-ink-2">● online</span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Linha do tempo */}
        <div ref={timeline} className="relative pl-10 lg:pt-24">
          <div className="absolute left-[11px] top-0 h-full w-px bg-line lg:top-24" aria-hidden />
          <motion.div
            style={{ height: fill }}
            className="absolute left-[11px] top-0 w-px bg-gradient-to-b from-ink via-ink to-transparent lg:top-24"
            aria-hidden
          />
          <ol className="space-y-12 md:space-y-14">
            {PROCESS_STEPS.map((step, i) => (
              <li key={step.title} className="relative">
                <Reveal delay={i * 0.05}>
                  <span
                    className="absolute -left-10 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-line-strong bg-canvas"
                    aria-hidden
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-ink" />
                  </span>
                  <p className="font-mono text-xs text-ink-3">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="font-display mt-2 text-xl font-medium sm:text-2xl">{step.title}</h3>
                  <p className="mt-2 max-w-md leading-relaxed text-ink-2">{step.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
          <Reveal delay={0.1} className="mt-12">
            <button onClick={() => scrollToId('orcamento')} className="btn-primary group">
              Começar agora
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
