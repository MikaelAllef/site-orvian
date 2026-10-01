/**
 * Comportamentos padrão de diálogos (modal de pacotes e chat):
 * fechar com Esc, travar a rolagem do fundo e manter o foco do teclado
 * dentro da janela — requisitos de acessibilidade (WCAG 2.1.2 / 2.4.3).
 */
import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

interface DialogOptions {
  /** O diálogo está aberto? */
  open: boolean;
  /** Chamado ao pressionar Esc. */
  onClose: () => void;
  /** Elemento raiz do diálogo, usado para prender o foco. */
  ref: RefObject<HTMLElement | null>;
  /** Trava a rolagem da página enquanto aberto (padrão: true). */
  lockScroll?: boolean;
}

export function useDialog({ open, onClose, ref, lockScroll = true }: DialogOptions) {
  // Guarda o callback mais recente sem reexecutar o efeito a cada render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    // Guarda quem tinha o foco para devolvê-lo ao fechar.
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      // Tab circular: do último volta ao primeiro e vice-versa.
      if (e.key !== 'Tab' || !ref.current) return;
      const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (lockScroll) document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, ref, lockScroll]);
}
