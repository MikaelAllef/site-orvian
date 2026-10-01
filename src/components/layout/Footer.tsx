/**
 * Chamada final + rodapé com links de serviços e contato.
 */
import { ArrowRight, ArrowUpRight, Instagram, Mail, MessageCircle } from 'lucide-react';
import logo from '../../assets/images/orvian-logo.png';
import { SERVICES } from '../../data/services';
import { SITE, whatsappLink } from '../../data/site';
import { scrollToId } from '../../lib/dom';
import { Reveal } from '../ui/Reveal';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line pt-20 md:pt-24">
      {/* brilho suave atrás da chamada final */}
      <div
        className="pointer-events-none absolute -bottom-40 left-1/2 h-[500px] w-[min(1000px,200vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(239,237,230,0.06),transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        {/* Chamada final */}
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end lg:gap-10">
            <h2 className="font-display fluid-h1 max-w-3xl font-medium text-balance">
              Vamos construir <span className="text-ink-2">sua próxima fase?</span>
            </h2>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button onClick={() => scrollToId('orcamento')} className="btn-primary">
                Fazer orçamento <ArrowRight className="h-4 w-4" />
              </button>
              <a href={whatsappLink('Olá, ORVIAN! Vim pelo site e gostaria de conversar.')} target="_blank" rel="noreferrer" className="btn-ghost">
                WhatsApp
              </a>
            </div>
          </div>
        </Reveal>

        {/* Colunas */}
        <div className="mt-16 grid gap-10 border-t border-line py-12 sm:grid-cols-2 md:mt-24 md:grid-cols-[1.4fr_1fr_1fr] md:py-14">
          <div className="sm:col-span-2 md:col-span-1">
            <img src={logo} alt="ORVIAN" className="h-8 w-auto md:h-9" loading="lazy" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-3">Serviços digitais premium para marcas que querem ser lembradas. {SITE.city}.</p>
          </div>

          <nav aria-label="Serviços">
            <p className="eyebrow">Serviços</p>
            <ul className="mt-5 space-y-2.5 text-sm text-ink-2">
              {SERVICES.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <button onClick={() => scrollToId('servicos')} className="text-left hover:text-ink">
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow">Contato</p>
            <ul className="mt-5 space-y-3 text-sm text-ink-2">
              <li>
                <a href={SITE.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-ink">
                  <Instagram className="h-4 w-4" aria-hidden /> {SITE.instagramHandle} <ArrowUpRight className="h-3 w-3" aria-hidden />
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2 break-all hover:text-ink">
                  <Mail className="h-4 w-4 shrink-0" aria-hidden /> {SITE.email}
                </a>
              </li>
              <li>
                <a href={whatsappLink('Olá, ORVIAN!')} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-ink">
                  <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-line py-8 pb-28 text-xs text-ink-3 sm:flex-row sm:pb-8">
          <p>© {new Date().getFullYear()} ORVIAN Serviços Digitais. Todos os direitos reservados.</p>
          <p className="font-mono uppercase tracking-widest">Design & código por ORVIAN</p>
        </div>
      </div>
    </footer>
  );
}
