/**
 * Conteúdo de cada etapa do simulador de orçamento.
 * Os componentes só leem/escrevem no contexto do orçamento — a navegação
 * entre etapas e o envio ficam no `QuoteBuilder`.
 */
import { useState, type InputHTMLAttributes } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, CheckCircle2, Copy, Instagram, Mail, Monitor, Package, Palette, Workflow, Zap } from 'lucide-react';
import { SEGMENTS } from '../../data/content';
import { SERVICES, URGENCY, formatPackagePrice } from '../../data/services';
import { SITE, whatsappLink } from '../../data/site';
import { buildQuoteMessage, useQuote, type QuoteDetails } from '../../lib/quote';
import { ServiceIcon } from '../ui/ServiceIcon';

/* ───────────────────────────── 1. Serviços ───────────────────────────── */

/** Atalhos da etapa 1 — cada um marca um serviço do catálogo (e um pacote, se indicado). */
const QUICK_PICKS = [
  { label: 'Marca', serviceId: 'identidade-visual', Icon: Palette },
  { label: 'Instagram', serviceId: 'gestao-instagram', Icon: Instagram },
  { label: 'Site', serviceId: 'site-landing', Icon: Monitor },
  { label: 'Automação', serviceId: 'automacao', Icon: Workflow },
  { label: 'Projeto completo', serviceId: 'combos', packageId: 'presenca-completa', Icon: Package, wide: true },
];

export function StepServices() {
  const { items, add, remove, setPackage } = useQuote();

  return (
    <div>
      <h3 className="font-display text-xl sm:text-2xl">O que sua empresa precisa?</h3>
      <p className="mt-1 text-sm text-ink-3">Toque em um ou mais. Você ajusta os detalhes logo abaixo.</p>

      {/* Atalhos: escolhas amplas que marcam o serviço correspondente */}
      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5" role="group" aria-label="Escolha rápida">
        {QUICK_PICKS.map((pick) => {
          const selected = items.some((i) => i.serviceId === pick.serviceId);
          return (
            <button
              key={pick.label}
              onClick={() => (selected ? remove(pick.serviceId) : add(pick.serviceId, pick.packageId))}
              aria-pressed={selected}
              className={`flex min-h-[88px] flex-col items-start justify-between rounded-2xl border p-4 text-left transition-colors duration-300 ${
                selected ? 'border-ink bg-ink text-canvas' : 'border-line text-ink hover:border-line-strong hover:bg-white/[0.03]'
              } ${pick.wide ? 'col-span-2 sm:col-span-1' : ''}`}
            >
              <pick.Icon className={`h-5 w-5 ${selected ? 'text-canvas' : 'text-ink-2'}`} strokeWidth={1.5} aria-hidden />
              <span className="mt-3 text-sm font-medium">{pick.label}</span>
            </button>
          );
        })}
      </div>

      <p className="eyebrow mt-8">Ou escolha em detalhe</p>
      <ul className="mt-3 grid gap-2.5">
        {SERVICES.map((service) => {
          const item = items.find((i) => i.serviceId === service.id);
          return (
            <li
              key={service.id}
              className={`rounded-2xl border transition-colors ${item ? 'border-white/25 bg-white/[0.035]' : 'border-line hover:border-line-strong'}`}
            >
              <button
                onClick={() => (item ? remove(service.id) : add(service.id))}
                className="flex w-full items-center gap-3 p-4 text-left sm:gap-4"
                aria-pressed={Boolean(item)}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${item ? 'border-ink bg-ink text-canvas' : 'border-line-strong'}`}
                >
                  {item && <Check className="h-3.5 w-3.5" />}
                </span>
                <ServiceIcon name={service.icon} className="hidden h-5 w-5 shrink-0 text-ink-2 sm:block" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{service.title}</span>
                  <span className="block text-xs text-ink-3">{service.short}</span>
                </span>
              </button>

              {/* Seleção de pacote (aparece quando o serviço está marcado) */}
              <AnimatePresence initial={false}>
                {item && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-2 px-4 pb-4 pl-[52px] sm:pl-[88px]" role="radiogroup" aria-label={`Pacote de ${service.title}`}>
                      {service.packages.map((pkg) => (
                        <button
                          key={pkg.id}
                          role="radio"
                          aria-checked={item.packageId === pkg.id}
                          onClick={() => setPackage(service.id, pkg.id)}
                          className={`rounded-full border px-3.5 py-1.5 text-left text-xs transition ${
                            item.packageId === pkg.id ? 'border-ink bg-ink text-canvas' : 'border-line-strong text-ink-2 hover:text-ink'
                          }`}
                        >
                          {pkg.name}
                          {SITE.showPrices && <span className="ml-1.5 opacity-60">{formatPackagePrice(pkg)}</span>}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ───────────────────────────── 2. Projeto ───────────────────────────── */

export function StepProject() {
  const { details, setDetails } = useQuote();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display text-xl sm:text-2xl">Conte sobre sua empresa</h3>
        <p className="mt-1 text-sm text-ink-3">Isso ajuda a ORVIAN a chegar na proposta certa logo de primeira.</p>
      </div>

      <fieldset>
        <legend className="text-sm text-ink-2">Segmento do seu negócio</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {SEGMENTS.map((segment) => (
            <button
              key={segment}
              aria-pressed={details.segment === segment}
              onClick={() => setDetails({ segment })}
              className={`rounded-full border px-4 py-2 text-sm transition ${details.segment === segment ? 'border-ink bg-ink text-canvas' : 'border-line-strong text-ink-2 hover:text-ink'}`}
            >
              {segment}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm text-ink-2">Prazo</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2" role="radiogroup">
          {URGENCY.map((option) => {
            const checked = details.urgency === option.id;
            return (
              <button
                key={option.id}
                role="radio"
                aria-checked={checked}
                onClick={() => setDetails({ urgency: option.id })}
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${checked ? 'border-white/30 bg-white/[0.05]' : 'border-line hover:border-line-strong'}`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${checked ? 'border-ink' : 'border-line-strong'}`}
                >
                  {checked && <motion.span layoutId="urgency-dot" className="h-2.5 w-2.5 rounded-full bg-ink" />}
                </span>
                <span>
                  <span className="flex items-center gap-1.5 font-medium">
                    {option.id === 'expresso' && <Zap className="h-3.5 w-3.5" aria-hidden />}
                    {option.label}
                  </span>
                  <span className="text-xs text-ink-3">{option.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="block">
        <span className="text-sm text-ink-2">Detalhes, referências ou objetivo (opcional)</span>
        <textarea
          id="quote-notes"
          rows={4}
          maxLength={2000}
          value={details.notes}
          onChange={(e) => setDetails({ notes: e.target.value })}
          className="field mt-3 resize-none"
          placeholder="Ex.: quero renovar a marca da minha clínica e começar a postar 3x por semana…"
        />
      </label>
    </div>
  );
}

/* ───────────────────────────── 3. Contato ───────────────────────────── */

type ContactField = 'name' | 'email' | 'phone' | 'company';
export type ContactErrors = Partial<Record<ContactField | 'consent', string>>;

/** Máscara de telefone brasileiro: (11) 98765-4321. */
function maskPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Valida a etapa de contato. Retorna as mensagens de erro (vazio = ok). */
export function validateContact(d: QuoteDetails): ContactErrors {
  const errors: ContactErrors = {};
  if (d.name.trim().length < 2) errors.name = 'Informe seu nome';
  if (!/^\S+@\S+\.\S+$/.test(d.email)) errors.email = 'E-mail inválido';
  if (d.phone.replace(/\D/g, '').length < 10) errors.phone = 'Informe o WhatsApp com DDD';
  if (!d.consent) errors.consent = 'Precisamos da sua autorização para entrar em contato';
  return errors;
}

/** Campo de texto com rótulo e mensagem de erro acessível. */
function Field({ field, label, error, ...input }: { field: ContactField; label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const { details, setDetails } = useQuote();
  const id = `quote-${field}`;
  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm text-ink-2">{label}</span>
      <input
        {...input}
        id={id}
        value={details[field]}
        onChange={(e) => setDetails({ [field]: field === 'phone' ? maskPhone(e.target.value) : e.target.value })}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`field mt-2 ${error ? '!border-red-400/60' : ''}`}
      />
      {error && (
        <span id={`${id}-error`} className="mt-1.5 block text-xs text-red-300">
          {error}
        </span>
      )}
    </label>
  );
}

interface StepContactProps {
  errors: ContactErrors;
  /** Campo-isca anti-spam (deve ficar vazio). */
  honeypot: string;
  onHoneypot: (value: string) => void;
}

export function StepContact({ errors, honeypot, onHoneypot }: StepContactProps) {
  const { details, setDetails } = useQuote();

  return (
    <div>
      <h3 className="font-display text-xl sm:text-2xl">Para onde enviamos sua proposta?</h3>
      <p className="mt-1 text-sm text-ink-3">Seus dados são usados apenas para este orçamento.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field field="name" label="Nome *" autoComplete="name" placeholder="Seu nome" error={errors.name} />
        <Field field="company" label="Empresa / marca" autoComplete="organization" placeholder="Opcional" />
        <Field field="email" label="E-mail *" type="email" autoComplete="email" placeholder="voce@empresa.com" error={errors.email} />
        <Field field="phone" label="WhatsApp *" type="tel" inputMode="tel" autoComplete="tel" placeholder="(11) 90000-0000" error={errors.phone} />
      </div>

      {/* Honeypot: invisível para pessoas, robôs costumam preencher. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={honeypot}
        onChange={(e) => onHoneypot(e.target.value)}
        className="absolute -left-[9999px] h-px w-px opacity-0"
        aria-hidden
      />

      {/* Consentimento (LGPD) */}
      <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-ink-2">
        <input
          id="quote-consent"
          type="checkbox"
          checked={details.consent}
          onChange={(e) => setDetails({ consent: e.target.checked })}
          aria-invalid={Boolean(errors.consent)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#efede6]"
        />
        <span>
          Autorizo a ORVIAN a usar meus dados para entrar em contato sobre este orçamento.
          {errors.consent && <span className="mt-1 block text-xs text-red-300">{errors.consent}</span>}
        </span>
      </label>
    </div>
  );
}

/* ───────────────────────────── 4. Concluído ───────────────────────────── */

export function StepDone({ protocol, onRestart }: { protocol: string; onRestart: () => void }) {
  const { items, details } = useQuote();
  const [copied, setCopied] = useState(false);
  const message = buildQuoteMessage(items, details, protocol);

  const copyProtocol = () => {
    navigator.clipboard
      ?.writeText(protocol)
      .then(() => setCopied(true))
      .catch(() => {});
  };

  return (
    <div className="flex flex-col items-center py-4 text-center sm:py-6" role="status">
      <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.45, duration: 0.8 }}>
        <CheckCircle2 className="h-14 w-14 text-ink sm:h-16 sm:w-16" strokeWidth={1.2} aria-hidden />
      </motion.div>
      <h3 className="font-display mt-6 text-2xl sm:text-3xl">Orçamento registrado!</h3>
      <p className="mt-3 max-w-md text-ink-2">
        Obrigado, {details.name.split(' ')[0]}. A ORVIAN retorna em {SITE.responseTime}. Para agilizar, envie o resumo direto pelo WhatsApp.
      </p>

      <button
        onClick={copyProtocol}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 font-mono text-sm"
        aria-label={`Copiar protocolo ${protocol}`}
      >
        {protocol} {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>

      <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
        <a href={whatsappLink(message)} target="_blank" rel="noreferrer" className="btn-primary">
          Enviar pelo WhatsApp <ArrowRight className="h-4 w-4" />
        </a>
        <a href={`mailto:${SITE.email}?subject=${encodeURIComponent('Orçamento ' + protocol)}&body=${encodeURIComponent(message)}`} className="btn-ghost">
          <Mail className="h-4 w-4" /> Por e-mail
        </a>
      </div>

      <button onClick={onRestart} className="mt-8 text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">
        Fazer novo orçamento
      </button>
    </div>
  );
}
