/**
 * Seção "Soluções" (logo após o Hero).
 * Explica em segundos o que a ORVIAN faz: quatro áreas que, juntas, formam a
 * presença digital da empresa — e o argumento de ter um único parceiro.
 */
import { ArrowRight } from 'lucide-react';
import { SOLUTION_AREAS } from '../../data/content';
import { scrollToId } from '../../lib/dom';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

export default function Solutions() {
  return (
    <section id="solucoes" aria-labelledby="solucoes-title" className="relative py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Soluções"
          id="solucoes-title"
          title={
            <>
              Tudo o que sua empresa precisa para construir <span className="text-ink-2">uma presença digital forte.</span>
            </>
          }
        />

        {/* Quatro áreas — colunas editoriais separadas por linhas finas */}
        <ol className="mt-12 grid border-t border-line sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
          {SOLUTION_AREAS.map((area, i) => (
            <li key={area.key} className={`border-b border-line lg:border-b-0 ${i % 2 === 1 ? 'sm:border-l' : ''} ${i > 0 ? 'lg:border-l' : ''}`}>
              <Reveal delay={i * 0.06} className="h-full">
                <article className="group relative h-full px-0 py-8 sm:px-6 lg:px-7 lg:py-10">
                  {/* Linha que se preenche no hover */}
                  <span
                    className="absolute inset-x-0 -top-px h-px origin-left scale-x-0 bg-ink transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100"
                    aria-hidden
                  />
                  <p className="font-mono text-xs text-ink-3 transition-colors duration-300 group-hover:text-ink">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="font-display mt-8 text-2xl font-medium uppercase tracking-[0.08em] lg:mt-12">{area.title}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-2">{area.text}</p>
                  <p className="mt-6 text-xs text-ink-3">{area.items.join(' · ')}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>

        {/* Posicionamento: um único parceiro */}
        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-panel border border-line bg-surface/60 p-6 md:mt-16 md:flex-row md:items-center md:p-8">
            <div className="max-w-2xl">
              <p className="font-display text-xl font-medium text-balance md:text-2xl">Você não precisa contratar quatro fornecedores diferentes.</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">
                Marca, presença, digital e automação com uma só direção, a mesma linguagem visual e um único ponto de contato.
              </p>
            </div>
            <button onClick={() => scrollToId('servicos')} className="btn-ghost group shrink-0">
              Conhecer os serviços
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
