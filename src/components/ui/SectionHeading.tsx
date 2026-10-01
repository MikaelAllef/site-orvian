/**
 * Cabeçalho padrão das seções: rótulo pequeno (eyebrow), título e introdução.
 */
import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  /** id do título, para `aria-labelledby` da seção. */
  id?: string;
}

export function SectionHeading({ eyebrow, title, intro, id }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <Reveal>
        <p className="eyebrow flex items-center gap-3">
          <span className="h-px w-8 bg-ink-3" aria-hidden />
          {eyebrow}
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 id={id} className="font-display fluid-h2 mt-5 font-medium text-balance text-ink">
          {title}
        </h2>
      </Reveal>
      {intro && (
        <Reveal delay={0.1}>
          <p className="mt-5 text-base leading-relaxed text-ink-2 md:text-lg">{intro}</p>
        </Reveal>
      )}
    </div>
  );
}
