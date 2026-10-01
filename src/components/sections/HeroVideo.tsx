/**
 * Vídeo de fundo do Hero, organizado em "capítulos".
 *
 * Os 2 arquivos de vídeo viram 3 capítulos (o primeiro vídeo tem dois momentos
 * distintos — criação e edição — então é dividido por tempo, sem baixar nada extra):
 *   01 Marca & Criação     → vídeo 1, 0s–11s
 *   02 Digital & Conteúdo  → vídeo 1, 11s–fim
 *   03 Tecnologia & IA     → vídeo 2, inteiro
 *
 * Este arquivo exporta:
 *  - useHeroChapters(): estado e controle dos capítulos;
 *  - <HeroBackdrop>: vídeos em tela cheia + camadas de legibilidade;
 *  - <ChapterNav>: navegação inferior (capítulo ativo + pausar).
 *
 * Performance/acessibilidade: só o 1º vídeo pré-carrega (o 2º carrega metadados);
 * poster como fallback; pausa fora da tela; não toca sozinho com "reduzir movimento"
 * ou "economia de dados"; botão de pausar (WCAG 2.2.2).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Pause, Play } from 'lucide-react';
import { EASE_OUT } from '../../lib/motion';

const BASE = import.meta.env.BASE_URL;

/** Arquivos. O `.mp4` é tentado primeiro; o `.webm` é reserva. */
const VIDEOS = [
  {
    mp4: `${BASE}videos/hero-1.mp4`,
    webm: `${BASE}videos/hero-1.webm`,
    // vídeo claro e colorido → menos saturação para conversar com a paleta escura
    filter: 'brightness(0.78) saturate(0.55) contrast(1.06)',
  },
  {
    mp4: `${BASE}videos/hero-2.mp4`,
    webm: `${BASE}videos/hero-2.webm`,
    filter: 'brightness(1) saturate(0.9) contrast(1.04)',
  },
];
const POSTER = `${BASE}videos/hero-poster.jpg`;

export const CHAPTERS = [
  { label: 'Marca & Criação', video: 0, start: 0, end: 11 },
  { label: 'Digital & Conteúdo', video: 0, start: 11, end: Infinity },
  { label: 'Tecnologia & IA', video: 1, start: 0, end: Infinity },
] as const;

/** O usuário ativou "economia de dados" no navegador? */
const prefersSaveData = () =>
  typeof navigator !== 'undefined' && Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

/* ───────────────────────────── Estado ───────────────────────────── */

export function useHeroChapters(reducedMotion: boolean) {
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(() => reducedMotion || prefersSaveData());
  const [progress, setProgress] = useState(0);
  const activeVideo = CHAPTERS[active].video;

  /** Vai para um capítulo. `seek: false` = continuação natural do mesmo vídeo. */
  const goTo = useCallback(
    (index: number, seek = true) => {
      const chapter = CHAPTERS[index];
      const video = videos.current[chapter.video];
      if (video && seek) video.currentTime = chapter.start;
      if (video && !paused) video.play().catch(() => {});
      setProgress(0);
      setActive(index);
    },
    [paused],
  );

  const next = useCallback(() => {
    const nextIndex = (active + 1) % CHAPTERS.length;
    const current = CHAPTERS[active];
    const upcoming = CHAPTERS[nextIndex];
    // Mesmo vídeo e tempo contínuo → só troca o rótulo, sem "pulo" na imagem.
    const continuous = upcoming.video === current.video && upcoming.start === current.end;
    goTo(nextIndex, !continuous);
  }, [active, goTo]);

  /** Chamado pelo `timeupdate` do vídeo ativo: atualiza a barra e troca de capítulo. */
  const onTime = useCallback(
    (video: HTMLVideoElement) => {
      const chapter = CHAPTERS[active];
      const end = Math.min(chapter.end, video.duration || chapter.end);
      // Capítulos com fim definido trocam por tempo; os demais, no evento `ended`.
      if (Number.isFinite(chapter.end) && video.currentTime >= chapter.end) return next();
      setProgress(Math.max(0, (video.currentTime - chapter.start) / (end - chapter.start)));
    },
    [active, next],
  );

  // Play/pause e pausa dos vídeos inativos (após o fade entre eles).
  useEffect(() => {
    const current = videos.current[activeVideo];
    if (current) paused ? current.pause() : current.play().catch(() => {});
    const timer = setTimeout(() => videos.current.forEach((v, i) => i !== activeVideo && v?.pause()), 1200);
    return () => clearTimeout(timer);
  }, [activeVideo, paused]);

  // Pausa quando o Hero sai da tela (economiza bateria e processamento).
  useEffect(() => {
    const target = videos.current[0]?.parentElement;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      const current = videos.current[activeVideo];
      if (!current || paused) return;
      if (entry.isIntersecting) current.play().catch(() => {});
      else current.pause();
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [activeVideo, paused]);

  return { videos, active, activeVideo, paused, setPaused, progress, goTo, next, onTime };
}

type Chapters = ReturnType<typeof useHeroChapters>;

/* ───────────────────────────── Fundo ───────────────────────────── */

export function HeroBackdrop({ chapters }: { chapters: Chapters }) {
  return (
    <div className="absolute inset-0 -z-10" aria-hidden>
      {VIDEOS.map((video, i) => (
        <video
          key={video.mp4}
          ref={(el) => {
            chapters.videos.current[i] = el;
          }}
          poster={i === 0 ? POSTER : undefined}
          muted
          playsInline
          preload={i === 0 ? 'auto' : 'metadata'}
          autoPlay={i === 0 && !chapters.paused}
          onTimeUpdate={(e) => i === chapters.activeVideo && chapters.onTime(e.currentTarget)}
          onEnded={() => i === chapters.activeVideo && chapters.next()}
          className="absolute inset-0 h-full w-full object-cover object-[70%_center] transition-opacity duration-[1200ms] ease-out lg:object-center"
          style={{ opacity: i === chapters.activeVideo ? 1 : 0, filter: video.filter }}
        >
          <source src={video.mp4} type="video/mp4" />
          <source src={video.webm} type="video/webm" />
        </video>
      ))}

      {/* Legibilidade: escuro onde está o texto, aberto onde está o vídeo */}
      <div className="hero-scrim absolute inset-0" />
      <div className="hero-fade absolute inset-0" />
    </div>
  );
}

/* ─────────────────────────── Navegação ─────────────────────────── */

export function ChapterNav({ chapters, delay = 0 }: { chapters: Chapters; delay?: number }) {
  const { active, progress, paused, setPaused, goTo } = chapters;
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT }}
      className="flex items-center gap-4 sm:gap-6"
    >
      <nav aria-label="Capítulos do vídeo" className="flex items-end gap-3 sm:gap-6">
        {CHAPTERS.map((chapter, i) => {
          const isActive = i === active;
          return (
            <button
              key={chapter.label}
              onClick={() => goTo(i)}
              aria-pressed={isActive}
              aria-label={`Capítulo ${i + 1}: ${chapter.label}`}
              className="group flex min-w-0 flex-col items-start gap-2 text-left"
            >
              <span className="flex items-baseline gap-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-300">
                <span className={isActive ? 'text-ink' : 'text-ink-3 group-hover:text-ink-2'}>0{i + 1}</span>
                {/* No celular só o capítulo ativo mostra o nome */}
                <span className={`${isActive ? 'inline text-ink' : 'hidden text-ink-3 group-hover:text-ink-2 md:inline'} whitespace-nowrap`}>
                  {chapter.label}
                </span>
              </span>
              <span className="relative h-px w-8 overflow-hidden bg-white/15 sm:w-full sm:min-w-16">
                <span
                  className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-300 ease-linear"
                  style={{ width: isActive ? `${progress * 100}%` : i < active ? '100%' : '0%' }}
                />
              </span>
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? 'Reproduzir vídeo de fundo' : 'Pausar vídeo de fundo'}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-ink-2 transition-colors duration-300 hover:border-white/35 hover:text-ink"
      >
        {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
      </button>
    </motion.div>
  );
}
