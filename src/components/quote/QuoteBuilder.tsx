/**
 * Seção "Orçamento online": assistente em 4 etapas
 * (Serviços → Projeto → Contato → Pronto) com resumo ao lado.
 *
 * O envio tenta o servidor (`/api/quote`); se ele não responder — por exemplo
 * numa prévia estática — gera um protocolo local e segue para o WhatsApp.
 */
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { formatRange } from '../../data/services';
import { SITE } from '../../data/site';
import { EASE_OUT } from '../../lib/motion';
import { useQuote } from '../../lib/quote';
import { SectionHeading } from '../ui/SectionHeading';
import QuoteSummary from './QuoteSummary';
import { StepContact, StepDone, StepProject, StepServices, validateContact, type ContactErrors } from './QuoteSteps';

const STEPS = ['O que precisa', 'Sua empresa', 'Contato', 'Proposta'] as const;
const LAST_FORM_STEP = 2;
const DONE_STEP = 3;

/** Protocolo curto e legível, ex.: ORV-K3J9QZ. */
const localProtocol = () => 'ORV-' + Date.now().toString(36).slice(-6).toUpperCase();

export default function QuoteBuilder() {
  const quote = useQuote();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = avançando, -1 = voltando (anima o slide)
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sending, setSending] = useState(false);
  const [protocol, setProtocol] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    // Se o topo do formulário saiu da tela (comum no celular), volta até ele.
    const box = document.getElementById('quote-box');
    if (box && box.getBoundingClientRect().top < 80) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const submit = async () => {
    const found = validateContact(quote.details);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSending(true);
    let id = localProtocol();
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: quote.items, details: quote.details, totals: quote.totals, website: honeypot }),
      });
      if (res.ok) id = (await res.json()).protocol ?? id;
    } catch {
      // Sem servidor: mantém o protocolo local.
    }
    setProtocol(id);
    setSending(false);
    goTo(DONE_STEP);
  };

  const next = () => {
    if (step === 0 && quote.items.length === 0) return;
    if (step === LAST_FORM_STEP) void submit();
    else goTo(step + 1);
  };

  const restart = () => {
    quote.reset();
    setErrors({});
    goTo(0);
  };

  return (
    <section id="orcamento" className="relative border-y border-line bg-surface/40 py-20 md:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" aria-hidden />

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Orçamento online"
          title={
            <>
              Monte seu projeto <span className="text-ink-2">em menos de 3 minutos.</span>
            </>
          }
          intro="Escolha o que sua empresa precisa, conte sobre o negócio e receba uma proposta personalizada. Você vê a estimativa na hora."
        />

        {/* Indicador de progresso */}
        <ol className="mt-10 flex items-center gap-2 md:mt-12" aria-label="Etapas do orçamento">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
              <button
                disabled={i > step || step === DONE_STEP}
                onClick={() => goTo(i)}
                className={`flex items-center gap-2 text-sm transition disabled:cursor-default ${i <= step ? 'text-ink' : 'text-ink-3'}`}
                aria-current={i === step ? 'step' : undefined}
                aria-label={`Etapa ${i + 1}: ${label}`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs transition ${
                    i < step ? 'border-ink bg-ink text-canvas' : i === step ? 'border-ink' : 'border-line-strong'
                  }`}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <span className="relative h-px flex-1 bg-line-strong" aria-hidden>
                  <motion.span
                    className="absolute inset-y-0 left-0 bg-ink"
                    animate={{ width: i < step ? '100%' : '0%' }}
                    transition={{ duration: 0.6, ease: EASE_OUT }}
                  />
                </span>
              )}
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-6 md:mt-10 lg:grid-cols-[1fr_380px]">
          {/* Formulário */}
          <div
            id="quote-box"
            className="relative min-h-[460px] scroll-mt-24 overflow-hidden rounded-[1.5rem] border border-line bg-canvas/60 p-4 sm:rounded-[2rem] sm:p-6 md:p-8"
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
              >
                {step === 0 && <StepServices />}
                {step === 1 && <StepProject />}
                {step === 2 && <StepContact errors={errors} honeypot={honeypot} onHoneypot={setHoneypot} />}
                {step === DONE_STEP && <StepDone protocol={protocol} onRestart={restart} />}
              </motion.div>
            </AnimatePresence>

            {step < DONE_STEP && (
              <>
                {/* Total compacto no celular (o resumo completo fica abaixo do formulário) */}
                {SITE.showPrices && quote.items.length > 0 && (
                  <div className="mt-8 flex items-center justify-between gap-3 rounded-2xl border border-line bg-white/[0.03] px-4 py-3 text-sm lg:hidden">
                    <span className="text-ink-2">{quote.items.length} serviço(s)</span>
                    <span className="text-right font-display text-base">
                      {formatRange(quote.totals.oneOff.min, quote.totals.oneOff.max)}
                      {quote.totals.monthly.max > 0 && (
                        <span className="block text-xs text-ink-3 sm:inline"> + {formatRange(quote.totals.monthly.min, quote.totals.monthly.max, true)}</span>
                      )}
                    </span>
                  </div>
                )}

                {/* Navegação */}
                <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
                  <button onClick={() => goTo(step - 1)} disabled={step === 0} className="btn-ghost disabled:invisible">
                    <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Voltar</span>
                  </button>
                  <button onClick={next} disabled={(step === 0 && quote.items.length === 0) || sending} className="btn-primary">
                    {sending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                    {step === LAST_FORM_STEP ? 'Enviar orçamento' : 'Continuar'}
                    {!sending && <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </>
            )}
          </div>

          <QuoteSummary />
        </div>
      </div>
    </section>
  );
}
