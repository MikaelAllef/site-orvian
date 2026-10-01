/**
 * Orvia, a mascote do chat. Cada "humor" (`Mood`) tem uma imagem:
 *  - ola        → acenando (abertura e cumprimentos)
 *  - escrevendo → no notebook (enquanto a resposta é gerada)
 *  - ajudando   → pensativa (depois de responder uma dúvida)
 *  - sucesso    → comemorando (atendimento concluído), com brilho dourado
 */
import { AnimatePresence, motion, useReducedMotion, type TargetAndTransition } from 'motion/react';
import ola from '../../assets/images/orvia-ola.png';
import ajudando from '../../assets/images/orvia-ajudando.png';
import escrevendo from '../../assets/images/orvia-escrevendo.png';
import sucesso from '../../assets/images/orvia-sucesso.png';
import avatar from '../../assets/images/orvia-avatar.png';
import type { Mood } from '../../lib/assistant';
import { EASE_OUT } from '../../lib/motion';

/** Rosto da Orvia (botão flutuante e avatar das mensagens). */
export const ORVIA_AVATAR = avatar;

export const ORVIA_IMAGES: Record<Mood, string> = { ola, ajudando, escrevendo, sucesso };

/** Texto de status exibido abaixo do nome no chat. */
export const MOOD_LABEL: Record<Mood, string> = {
  ola: 'Online · pronta para ajudar',
  escrevendo: 'Escrevendo…',
  ajudando: 'Ajudando você',
  sucesso: 'Atendimento concluído',
};

const ALT_TEXT: Record<Mood, string> = {
  ola: 'Orvia acenando e dizendo olá',
  escrevendo: 'Orvia escrevendo no notebook',
  ajudando: 'Orvia pensando em como ajudar',
  sucesso: 'Orvia comemorando',
};

/** Animação de entrada de cada humor. */
const ENTER: Record<Mood, { initial: TargetAndTransition; animate: TargetAndTransition }> = {
  ola: { initial: { scale: 0.85, rotate: -6, opacity: 0 }, animate: { scale: 1, rotate: 0, opacity: 1 } },
  ajudando: { initial: { scale: 0.85, rotate: -6, opacity: 0 }, animate: { scale: 1, rotate: 0, opacity: 1 } },
  escrevendo: { initial: { y: 12, opacity: 0 }, animate: { y: 0, opacity: 1 } },
  sucesso: { initial: { scale: 0.6, y: 20, opacity: 0 }, animate: { scale: [0.6, 1.12, 1], y: [20, -10, 0], opacity: 1 } },
};

interface OrviaMascotProps {
  mood: Mood;
  /** Posição e tamanho vêm de quem usa o componente. */
  className?: string;
}

export function OrviaMascot({ mood, className = 'relative' }: OrviaMascotProps) {
  const reduce = useReducedMotion();

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.img
          key={mood}
          src={ORVIA_IMAGES[mood]}
          alt={ALT_TEXT[mood]}
          draggable={false}
          initial={reduce ? false : ENTER[mood].initial}
          animate={ENTER[mood].animate}
          exit={reduce ? undefined : { opacity: 0, scale: 0.9, y: 6, transition: { duration: 0.15 } }}
          transition={{ duration: mood === 'sucesso' ? 0.7 : 0.4, ease: EASE_OUT }}
          className={`mascot absolute inset-0 h-full w-full select-none object-contain object-bottom ${mood === 'escrevendo' ? '' : 'float-y'}`}
        />
      </AnimatePresence>
      {mood === 'sucesso' && !reduce && <GoldBurst />}
    </div>
  );
}

/** Pequena explosão de partículas douradas ao concluir o atendimento. */
function GoldBurst() {
  const COUNT = 14;
  const particles = Array.from({ length: COUNT }, (_, i) => {
    const angle = (i / COUNT) * Math.PI * 2;
    const radius = 48 + (i % 3) * 14;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius - 10,
      size: 3 + (i % 3) * 1.5,
      delay: (i % 4) * 0.04,
    };
  });

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden>
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-gold"
          style={{ width: p.size, height: p.size, boxShadow: '0 0 8px rgb(220 182 124 / .8)' }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.15 + p.delay, ease: EASE_OUT }}
        />
      ))}
    </div>
  );
}
