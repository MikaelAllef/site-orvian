/**
 * Peças visuais do chat: texto formatado, botões de ação,
 * indicador "escrevendo" e card de convite do Instagram.
 */
import { Fragment, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Check, CheckCheck, Instagram, LayoutGrid, MessageCircle, Plus } from 'lucide-react';
import { getService } from '../../data/services';
import { SITE } from '../../data/site';
import type { ChatAction } from '../../lib/assistant';
import { EASE_OUT } from '../../lib/motion';
import { ServiceIcon } from '../ui/ServiceIcon';
import { ORVIA_AVATAR } from './OrviaMascot';

/**
 * Markdown mínimo e seguro (sem HTML): **negrito**, listas com • ou - e quebras de linha.
 * Renderiza nós React, nunca `innerHTML` — imune a injeção de código.
 */
export function RichText({ text }: { text: string }) {
  const BULLET = /^\s*[•\-*]\s+/;
  const inline = (line: string) =>
    line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    );

  return (
    <>
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <span key={i} className="block h-2" />;
        if (BULLET.test(line)) {
          return (
            <span key={i} className="flex gap-2">
              <span className="opacity-50" aria-hidden>
                •
              </span>
              <span>{inline(line.replace(BULLET, ''))}</span>
            </span>
          );
        }
        return (
          <span key={i} className="block">
            {inline(line)}
          </span>
        );
      })}
    </>
  );
}

/** Botão sugerido pela Orvia abaixo de uma resposta. */
export function ActionChip({ action, onRun, done }: { action: ChatAction; onRun: (a: ChatAction) => void; done: boolean }) {
  let label: ReactNode;
  switch (action.type) {
    case 'add': {
      const title = getService(action.serviceId)?.title;
      label = done ? (
        <>
          <Check className="h-3 w-3" /> {title} no orçamento
        </>
      ) : (
        <>
          <Plus className="h-3 w-3" /> Adicionar {title}
        </>
      );
      break;
    }
    case 'quote':
      label = 'Abrir orçamento →';
      break;
    case 'services':
      label = 'Ver serviços';
      break;
    case 'detail': {
      const service = getService(action.serviceId);
      label = (
        <>
          {service && <ServiceIcon name={service.icon} className="h-3 w-3" />} {service?.title}
        </>
      );
      break;
    }
    case 'whatsapp':
      label = (
        <>
          <MessageCircle className="h-3 w-3" /> Falar no WhatsApp
        </>
      );
      break;
  }

  return (
    <button
      onClick={() => onRun(action)}
      disabled={done}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${done ? 'border-ink/40 text-ink-2' : 'border-line-strong text-ink hover:bg-white/5'}`}
    >
      {label}
    </button>
  );
}

/** "Orvia está escrevendo" com três pontinhos dourados. */
export function TypingIndicator() {
  return (
    <div className="flex gap-2.5" role="status">
      <img src={ORVIA_AVATAR} alt="" className="mt-1 h-7 w-7 shrink-0 self-start object-contain" />
      <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-line bg-white/[0.03] px-4 py-3">
        <span className="text-xs text-ink-3">Orvia está escrevendo</span>
        <span className="flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-gold"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

/** Convite para seguir a ORVIAN, exibido ao encerrar o atendimento. */
export function InstagramCard() {
  return (
    <motion.a
      href={SITE.instagram}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.35, duration: 0.5, ease: EASE_OUT }}
      className="group mt-2 flex items-center gap-3 rounded-2xl border border-gold/30 bg-[linear-gradient(135deg,rgba(220,182,124,0.14),rgba(255,255,255,0.02))] p-3 transition hover:border-gold/60"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#f9ce34,#ee2a7b_55%,#6228d7)]">
        <Instagram className="h-5 w-5 text-white" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink">{SITE.instagramHandle}</span>
        <span className="block text-xs text-ink-3">Bastidores, cases e dicas de marca</span>
      </span>
      <span className="shrink-0 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-canvas transition group-hover:bg-white">Seguir</span>
    </motion.a>
  );
}

/**
 * Pergunta exibida depois de cada resposta: a dúvida foi resolvida?
 * "Sim" encerra o atendimento; "Ver outros produtos" lista o catálogo no chat.
 */
export function ResolvedPrompt({ onResolved, onMoreProducts }: { onResolved: () => void; onMoreProducts?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.4, ease: EASE_OUT }}
      className="mt-3 rounded-2xl border border-line bg-white/[0.02] p-3"
      role="group"
      aria-label="Sua dúvida foi resolvida?"
    >
      <p className="text-xs text-ink-2">Sua dúvida foi resolvida?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          onClick={onResolved}
          className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-medium text-ink transition hover:border-gold/70 hover:bg-gold/20"
        >
          <CheckCheck className="h-3.5 w-3.5 text-gold" /> Sim, foi resolvida
        </button>
        {onMoreProducts && (
          <button
            onClick={onMoreProducts}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-xs text-ink transition hover:bg-white/5"
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Ver outros produtos
          </button>
        )}
      </div>
    </motion.div>
  );
}
