/**
 * Revela o conteúdo com fade + leve subida (opacity + translateY) quando ele entra na tela.
 * Respeita "reduzir movimento" do sistema operacional.
 */
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { EASE_OUT } from '../../lib/motion';

interface RevealProps {
  children: ReactNode;
  /** Atraso em segundos — útil para escalonar itens de uma lista. */
  delay?: number;
  /** Deslocamento vertical inicial, em px. */
  y?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, y = 20, className }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
