/**
 * Valores em reais que "rolam" suavemente até o novo número quando mudam.
 */
import { useEffect, useState } from 'react';
import { useMotionValue, useSpring } from 'motion/react';
import { formatBRL } from '../../data/services';
import type { PriceRange } from '../../lib/quote';

export function AnimatedPrice({ value, className = '' }: { value: number; className?: string }) {
  const target = useMotionValue(value);
  const spring = useSpring(target, { stiffness: 120, damping: 20 });
  const [display, setDisplay] = useState(value);

  useEffect(() => target.set(value), [value, target]);
  useEffect(() => spring.on('change', (v) => setDisplay(Math.round(v))), [spring]);

  return <span className={`tabular-nums ${className}`}>{formatBRL(display)}</span>;
}

/** Faixa animada "R$ mín – R$ máx" (vira valor único quando mínimo = máximo). */
export function AnimatedRange({ range, className = '' }: { range: PriceRange; className?: string }) {
  if (range.min === range.max) return <AnimatedPrice value={range.min} className={className} />;
  return (
    <span className={`whitespace-nowrap ${className}`}>
      <AnimatedPrice value={range.min} /> – <AnimatedPrice value={range.max} />
    </span>
  );
}
