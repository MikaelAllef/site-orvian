/**
 * Imagem de referência de cada serviço (cards e modal de pacotes).
 *
 * Basta colocar um arquivo `src/assets/images/servicos/<id-do-serviço>.webp`:
 * o Vite encontra todos automaticamente. Fica separado de `services.ts`
 * porque o servidor também importa o catálogo e não lida com imagens.
 */
const files = import.meta.glob('../assets/images/servicos/*.webp', { eager: true, import: 'default' }) as Record<string, string>;

/** Mapa `id do serviço → URL da imagem`. */
const SERVICE_IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace('.webp', ''), url]),
);

export const serviceImage = (id: string): string | undefined => SERVICE_IMAGES[id];
