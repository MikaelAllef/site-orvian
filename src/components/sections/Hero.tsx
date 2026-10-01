/**
 * Hero: proposta de valor sobre o vídeo em tela cheia.
 *
 * Composição: conteúdo à esquerda (onde o vídeo é escurecido) e o vídeo
 * respirando à direita. No mobile o vídeo aparece no topo e o texto embaixo.
 *
 * Entrada em sequência (segundos): selo 0.15 · título 0.30 · apoio 0.50 ·
 * áreas 0.70 · CTA 0.85 · métricas 1.00 · capítulos 1.10.
 * Com "reduzir movimento" ativo, tudo já aparece no lugar.
 */
import { motion, useReducedMotion, type MotionProps } from 'motion/react';
import { ArrowRight, Clock3, Monitor, Palette, Sparkles, Workflow } from 'lucide-react';
import { SERVICES } from '../../data/services';
import { scrollToId } from '../../lib/dom';
import { EASE_OUT } from '../../lib/motion';
import { ChapterNav, HeroBackdrop, useHeroChapters } from './HeroVideo';

/** Linhas do título. A do meio fica em tom secundário. */
const HEADLINE = ['Sua marca com', 'presença à altura', 'do que você entrega.'];

/** Áreas de atuação — informação secundária, não uma lista de serviços. */
const AREAS = [
  { label: 'Identidade visual', Icon: Palette },
  { label: 'Conteúdo', Icon: Sparkles },
  { label: 'Sites', Icon: Monitor },
  { label: 'Automação', Icon: Workflow },
];

/** Indicadores: só dados verificáveis (quantidade do catálogo e prazo de resposta). */
const METRICS = [
  { value: String(SERVICES.length), label: 'soluções digitais' },
  { value: '2h', label: 'tempo médio de resposta' },
  { value: 'IA', label: 'integrada aos processos' },
];

export default function Hero() {
  const reduce = Boolean(useReducedMotion());
  const chapters = useHeroChapters(reduce);

  /** Entrada suave (opacity + translateY). Sem animação para "reduzir movimento". */
  const enter = (delay: number, y = 14): MotionProps =>
    reduce ? {} : { initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: EASE_OUT } };

  return (
    <section id="topo" aria-label="Apresentação" className="noise relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <HeroBackdrop chapters={chapters} />

      {/* Conteúdo principal */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-end px-5 pb-8 pt-[34svh] sm:pt-40 md:px-8 lg:items-center lg:pb-6 lg:pt-28">
        <div className="max-w-[56rem]">
          {/* Selo */}
          <motion.p
            {...enter(0.15, 8)}
            className="inline-flex max-w-full items-center gap-3 rounded-full border border-white/12 bg-canvas/40 py-1.5 pl-3 pr-4 text-[11px] text-ink-2 backdrop-blur-sm"
          >
            <span className="flex shrink-0 items-center gap-2 font-mono uppercase tracking-[0.18em] text-ink">
              <span className="pulse-dot" aria-hidden />
              Agenda aberta
            </span>
            <span className="h-3 w-px shrink-0 bg-white/20" aria-hidden />
            <span className="truncate">
              <span className="sm:hidden">Orçamento em 3 minutos</span>
              <span className="hidden sm:inline">Orçamento online em menos de 3 minutos</span>
            </span>
          </motion.p>

          {/* Título — elemento de maior destaque */}
          <h1 className="hero-title mt-6 md:mt-7 short:mt-5">
            {HEADLINE.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  className={`block ${i === 1 ? 'text-ink-2' : 'text-ink'}`}
                  initial={reduce ? false : { y: '102%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.3 + i * 0.08, ease: EASE_OUT }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* Proposta de valor */}
          <motion.p {...enter(0.5)} className="mt-6 max-w-[34rem] text-base leading-relaxed text-ink/80 sm:text-lg md:mt-7 short:mt-5">
            Construímos a presença digital que sua empresa precisa para transmitir confiança, autoridade e profissionalismo em cada ponto de contato.
          </motion.p>

          {/* Áreas de atuação (secundário) */}
          <motion.ul
            {...enter(0.7)}
            aria-label="Áreas de atuação"
            className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] text-ink-2 sm:flex sm:flex-wrap sm:items-center"
          >
            {AREAS.map(({ label, Icon }, i) => (
              <li key={label} className="flex items-center gap-4">
                {/* separadores só quando os itens ficam em linha */}
                {i > 0 && <span className="hidden h-3 w-px bg-white/15 sm:block" aria-hidden />}
                <span className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-ink-3" strokeWidth={1.6} aria-hidden />
                  {label}
                </span>
              </li>
            ))}
          </motion.ul>

          {/* Chamadas */}
          <motion.div {...enter(0.85)} className="mt-8 md:mt-10 short:mt-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
              <div className="flex flex-col">
                <button onClick={() => scrollToId('orcamento')} className="btn-primary btn-lg group">
                  Montar meu orçamento
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" aria-hidden />
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-2 sm:justify-start sm:pl-1">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden /> Leva menos de 3 minutos
                </p>
              </div>
              <button onClick={() => scrollToId('servicos')} className="btn-link self-center sm:mt-1 sm:self-start">
                Ver serviços
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Base: métricas + capítulos do vídeo */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 pb-8 md:px-8 lg:flex-row lg:items-end lg:justify-between lg:pb-9">
        <dl className="grid max-w-xl grid-cols-3 border-t border-white/10">
          {METRICS.map((metric, i) => (
            <motion.div key={metric.label} {...enter(1 + i * 0.08, 10)} className={`pt-4 pr-3 sm:pr-6 ${i > 0 ? 'border-l border-white/10 pl-3 sm:pl-6' : ''}`}>
              <dt className="sr-only">{metric.label}</dt>
              <dd className="font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">{metric.value}</dd>
              <dd className="mt-1 text-[11px] leading-snug text-ink-2 sm:text-xs" aria-hidden>
                {metric.label}
              </dd>
            </motion.div>
          ))}
        </dl>

        {/* Margem à direita reserva o espaço do botão do chat */}
        <div className="lg:pr-20 2xl:pr-0">
          <ChapterNav chapters={chapters} delay={1.1} />
        </div>
      </div>
    </section>
  );
}
