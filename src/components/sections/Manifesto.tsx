/**
 * Faixa "Por que a ORVIAN": foto ampla com parallax e os diferenciais.
 */
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import studioImage from '../../assets/images/sala-estrategia.webp';
import { PILLARS } from '../../data/content';
import { Reveal } from '../ui/Reveal';

export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1.15, 1]);

  return (
    <section
      ref={ref}
      aria-labelledby="manifesto-title"
      className="relative mx-3 overflow-hidden rounded-[1.75rem] border border-line sm:mx-4 sm:rounded-[2.5rem] md:mx-8"
    >
      <motion.img src={studioImage} alt="" style={{ y, scale }} className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
      {/* No celular o texto ocupa a largura toda → escurece por igual */}
      <div className="absolute inset-0 bg-canvas/80 md:bg-transparent md:bg-gradient-to-r md:from-canvas md:via-canvas/85 md:to-canvas/30" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 md:px-12 md:py-36">
        <Reveal>
          <p className="eyebrow">Por que a ORVIAN</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 id="manifesto-title" className="font-display fluid-h2 mt-6 max-w-3xl font-medium text-balance">
            Estratégia, design e tecnologia <span className="text-ink-2">sob o mesmo teto.</span>
          </h2>
        </Reveal>
        <div className="mt-12 grid max-w-4xl gap-8 sm:grid-cols-3 md:mt-14">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={0.1 + i * 0.06}>
              <div className="border-t border-line-strong pt-5">
                <p className="font-display text-lg">{pillar.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{pillar.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
