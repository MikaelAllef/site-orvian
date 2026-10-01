/**
 * Pequenos utilitários de DOM usados por vários componentes.
 */
import type { MouseEvent } from 'react';

/** Rola suavemente até a seção com o `id` informado. */
export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Atualiza as variáveis CSS `--mx`/`--my` com a posição do cursor,
 * alimentando o brilho que segue o mouse (classe `.spotlight`).
 */
export function trackSpotlight(e: MouseEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
}
