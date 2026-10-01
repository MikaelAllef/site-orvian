/**
 * Chat de suporte com a Orvia.
 *
 * Partes:
 *  - botão flutuante (rosto da Orvia) + convite "Olá!" após alguns segundos;
 *  - painel com a mascote "saindo" da borda, cuja aparência acompanha o atendimento;
 *  - mensagens, sugestões rápidas, ações e campo de texto.
 * A lógica (envio, humor, encerramento) fica em `useChat`.
 */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, RotateCcw, X } from 'lucide-react';
import { getService } from '../../data/services';
import { whatsappLink } from '../../data/site';
import { useDialog } from '../../hooks/useDialog';
import type { ChatAction } from '../../lib/assistant';
import { scrollToId } from '../../lib/dom';
import { EASE_OUT } from '../../lib/motion';
import { useQuote } from '../../lib/quote';
import { ActionChip, InstagramCard, ResolvedPrompt, RichText, TypingIndicator } from './ChatParts';
import { MOOD_LABEL, ORVIA_AVATAR, ORVIA_IMAGES, OrviaMascot } from './OrviaMascot';
import { useChat } from './useChat';

const QUICK_QUESTIONS = [
  'Quanto custa uma logo?',
  'Como funciona a gestão de Instagram?',
  'Quais os prazos?',
  'Formas de pagamento',
  'Quero falar com uma pessoa',
];
const RESOLVED_MESSAGE = 'Minha dúvida foi resolvida, obrigado!';
/** Quando o convite aparece e por quanto tempo fica na tela. */
const TEASER_DELAY_MS = 5000;
const TEASER_DURATION_MS = 12000;

interface ChatWidgetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function ChatWidget({ open, setOpen }: ChatWidgetProps) {
  const quote = useQuote();
  const chat = useChat(quote.items);
  const [input, setInput] = useState('');
  const [showTeaser, setShowTeaser] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useDialog({ open, onClose: () => setOpen(false), ref: panelRef, lockScroll: false });

  // Convite aparece uma vez, depois de alguns segundos, e some sozinho.
  useEffect(() => {
    const show = setTimeout(() => setShowTeaser(true), TEASER_DELAY_MS);
    const hide = setTimeout(() => setShowTeaser(false), TEASER_DELAY_MS + TEASER_DURATION_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  // Ao abrir: esconde o convite e põe o foco no campo de texto.
  useEffect(() => {
    if (!open) return;
    setShowTeaser(false);
    const timer = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(timer);
  }, [open]);

  // Mantém a conversa rolada até a última mensagem.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [chat.messages, chat.typing]);

  // Pré-carrega as aparências da Orvia para a troca ser instantânea.
  useEffect(() => {
    Object.values(ORVIA_IMAGES).forEach((src) => {
      new Image().src = src;
    });
  }, []);

  const send = (text: string) => {
    setInput('');
    void chat.send(text);
  };

  /** Executa o botão sugerido pela Orvia. */
  const runAction = (action: ChatAction) => {
    const closeAndScroll = (id: string) => {
      setOpen(false);
      setTimeout(() => scrollToId(id), 200);
    };
    if (action.type === 'add') quote.add(action.serviceId);
    if (action.type === 'detail') void chat.showService(action.serviceId, getService(action.serviceId)?.title ?? 'este serviço');
    if (action.type === 'quote') closeAndScroll('orcamento');
    if (action.type === 'services') closeAndScroll('servicos');
    if (action.type === 'whatsapp') {
      const question = chat.lastUserMessage ? ` Minha dúvida: ${chat.lastUserMessage}` : '';
      window.open(whatsappLink(`Olá, ORVIAN! Vim pelo site.${question}`), '_blank', 'noopener');
    }
  };

  return (
    <>
      {/* ───────────── Botão flutuante + convite ───────────── */}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end sm:bottom-5 sm:right-5 md:bottom-7 md:right-7">
        <AnimatePresence>
          {showTeaser && !open && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
              className="relative -mb-2 mr-1 hidden origin-bottom-right lg:block" // em telas menores, cobriria o conteúdo
            >
              <button onClick={() => setOpen(true)} aria-label="Abrir chat com a Orvia" className="block">
                <img src={ORVIA_IMAGES.ola} alt="Orvia: Olá! Como posso ajudar você hoje?" className="mascot float-y h-52 w-auto" />
              </button>
              <button
                onClick={() => setShowTeaser(false)}
                aria-label="Dispensar convite"
                className="absolute -left-2 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-line-strong bg-surface text-ink-3 hover:text-ink"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setOpen(!open)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          aria-label={open ? 'Fechar chat' : 'Abrir chat de suporte'}
          aria-expanded={open}
          aria-controls="orvia-chat"
          className="relative flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-elevated shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9)] md:h-16 md:w-16"
        >
          {!open && <span className="absolute inset-0 animate-ping rounded-full border border-gold/25 [animation-duration:3s]" aria-hidden />}
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="h-6 w-6" />
              </motion.span>
            ) : (
              <motion.img
                key="avatar"
                src={ORVIA_AVATAR}
                alt=""
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                className="h-10 w-10 object-contain md:h-11 md:w-11"
              />
            )}
          </AnimatePresence>
          {!open && <span className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-elevated bg-emerald-400" aria-hidden />}
        </motion.button>
      </div>

      {/* ───────────── Painel ───────────── */}
      <AnimatePresence>
        {open && (
          <motion.section
            ref={panelRef}
            id="orvia-chat"
            role="dialog"
            aria-label="Chat de suporte ORVIAN"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            style={{ transformOrigin: 'bottom right' }}
            className="fixed inset-x-3 bottom-[88px] top-[84px] z-[60] sm:inset-x-auto sm:right-5 sm:top-auto sm:h-[640px] sm:max-h-[calc(100dvh-170px)] sm:w-[410px] md:bottom-28 md:right-7"
          >
            {/* Mascote saindo pela borda de cima */}
            <OrviaMascot
              mood={chat.mood}
              className="pointer-events-none absolute -top-14 left-2 z-10 h-[108px] w-[98px] sm:-top-16 sm:left-3 sm:h-[124px] sm:w-[112px]"
            />

            <div className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-line-strong bg-surface/95 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)] backdrop-blur-xl">
              {/* Cabeçalho */}
              <header className="relative flex items-center gap-2 border-b border-line py-4 pl-[112px] pr-3 sm:pl-[132px] sm:pr-4">
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_10%_0%,rgba(220,182,124,0.10),transparent_60%)]"
                  aria-hidden
                />
                <div className="relative min-w-0 flex-1">
                  <p className="font-display font-medium leading-tight">Orvia</p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={chat.mood}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      aria-live="polite"
                      className={`flex items-center gap-1.5 text-xs ${chat.mood === 'sucesso' ? 'text-gold' : 'text-ink-3'}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${chat.mood === 'escrevendo' ? 'animate-pulse bg-gold' : chat.mood === 'sucesso' ? 'bg-gold' : 'bg-emerald-400'}`}
                        aria-hidden
                      />
                      {MOOD_LABEL[chat.mood]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <button
                  onClick={chat.restart}
                  className="relative flex h-8 w-8 items-center justify-center rounded-full text-ink-3 hover:bg-white/5 hover:text-ink"
                  aria-label="Reiniciar conversa"
                  title="Reiniciar conversa"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="relative flex h-8 w-8 items-center justify-center rounded-full text-ink-3 hover:bg-white/5 hover:text-ink"
                  aria-label="Fechar chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              {/* Mensagens */}
              <div ref={listRef} className="scrollbar-thin flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-5 sm:px-4" aria-live="polite">
                {chat.messages.map((m, index) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={m.role === 'user' ? 'flex justify-end' : 'flex gap-2.5'}
                  >
                    {m.role === 'assistant' && <img src={ORVIA_AVATAR} alt="" className="mt-1 h-7 w-7 shrink-0 self-start object-contain" />}
                    <div className="min-w-0 max-w-[85%]">
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          m.role === 'user'
                            ? 'rounded-br-md bg-ink text-canvas'
                            : m.end
                              ? 'rounded-tl-md border border-gold/30 bg-gold/[0.06] text-ink'
                              : 'rounded-tl-md border border-line bg-white/[0.03] text-ink'
                        }`}
                      >
                        <RichText text={m.content} />
                      </div>
                      {m.end && <InstagramCard />}
                      {m.actions && m.actions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {m.actions.map((action, i) => (
                            <ActionChip key={i} action={action} onRun={runAction} done={action.type === 'add' && quote.has(action.serviceId)} />
                          ))}
                        </div>
                      )}
                      {/* Depois da última resposta, pergunta se a dúvida foi resolvida */}
                      {m.role === 'assistant' && index === chat.messages.length - 1 && index > 0 && !m.end && !chat.typing && (
                        <ResolvedPrompt
                          onResolved={() => send(RESOLVED_MESSAGE)}
                          onMoreProducts={m.actions?.some((x) => x.type === 'detail') ? undefined : () => void chat.showCatalog()}
                        />
                      )}
                    </div>
                  </motion.div>
                ))}

                {chat.typing && <TypingIndicator />}

                {/* Sugestões rápidas (só no início da conversa) */}
                {chat.messages.length === 1 && !chat.typing && (
                  <div className="flex flex-wrap gap-2 pl-9 pt-1">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="rounded-full border border-line-strong px-3 py-1.5 text-xs text-ink-2 transition hover:border-white/30 hover:text-ink"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Rodapé: encerrar/reiniciar + campo de texto */}
              <div className="border-t border-line p-3">
                <AnimatePresence initial={false}>
                  {chat.ended && (
                    <motion.button
                      key="restart"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={chat.restart}
                      className="mb-2 flex w-full items-center justify-center gap-1.5 overflow-hidden text-xs text-ink-3 transition hover:text-ink"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Iniciar nova conversa
                    </motion.button>
                  )}
                </AnimatePresence>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(input);
                  }}
                >
                  <div className="flex items-end gap-2 rounded-2xl border border-line bg-canvas/60 p-1.5 pl-4 focus-within:border-white/25">
                    <textarea
                      ref={inputRef}
                      id="orvia-input"
                      rows={1}
                      maxLength={1000}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        // Enter envia; Shift+Enter quebra linha.
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          send(input);
                        }
                      }}
                      placeholder={chat.ended ? 'Ficou mais alguma dúvida?' : 'Escreva sua dúvida…'}
                      aria-label="Mensagem para a Orvia"
                      className="max-h-28 flex-1 resize-none bg-transparent py-2 text-base text-ink placeholder:text-ink-3 focus:outline-none sm:text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || chat.typing}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-canvas transition disabled:opacity-30"
                      aria-label="Enviar mensagem"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </div>
                </form>
                <p className="mt-2 text-center text-[10px] text-ink-3">Assistente com IA · pode cometer erros. Valores confirmados pela equipe.</p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
