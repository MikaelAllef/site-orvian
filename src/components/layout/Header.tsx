/**
 * Cabeçalho fixo.
 * - Vira uma "pílula de vidro" ao rolar a página.
 * - Destaca o link da seção visível (IntersectionObserver).
 * - Mostra o contador do orçamento, que pulsa a cada serviço adicionado.
 * - No celular, os links vão para um menu recolhível.
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Menu, ShoppingBag, X } from 'lucide-react';
import logo from '../../assets/images/orvian-logo.png';
import { useQuote } from '../../lib/quote';
import { scrollToId } from '../../lib/dom';

const NAV = [
  { id: 'servicos', label: 'Serviços' },
  { id: 'orcamento', label: 'Orçamento' },
  { id: 'processo', label: 'Como funciona' },
  { id: 'faq', label: 'Dúvidas' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState('');
  const { items, lastAdded } = useQuote();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // A seção "ativa" é a que cruza a faixa central da tela.
    const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActiveId(e.target.id)), {
      rootMargin: '-45% 0px -50% 0px',
    });
    // Observa também as seções fora do menu, para nenhum link ficar "preso" ativo.
    ['topo', 'solucoes', ...NAV.map((n) => n.id)].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  const goTo = (id: string) => {
    setMenuOpen(false);
    scrollToId(id);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4 md:px-6">
      <div
        className={`mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 rounded-full border px-4 transition-[background-color,border-color,box-shadow] duration-500 md:h-16 md:px-6 ${
          scrolled || menuOpen ? 'glass !bg-[#0c0d12]/85 shadow-float' : 'border-transparent'
        }`}
      >
        <a
          href="#topo"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="ORVIAN — voltar ao início"
          className="shrink-0"
        >
          <img src={logo} alt="ORVIAN" className="h-6 w-auto md:h-7" />
        </a>

        {/* Navegação desktop */}
        {/* Navegação desktop — sublinhado animado no hover e na seção ativa */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Principal">
          {NAV.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => goTo(item.id)}
                aria-current={isActive ? 'true' : undefined}
                className={`group relative py-2 text-[13px] tracking-wide transition-colors duration-300 ${isActive ? 'text-ink' : 'text-ink-2 hover:text-ink'}`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-0 bottom-0.5 h-px origin-left bg-current transition-transform duration-500 ease-[var(--ease-out-expo)] ${
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                  aria-hidden
                />
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Contador do orçamento — só aparece quando há algo no orçamento */}
          <AnimatePresence>
            {items.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                onClick={() => goTo('orcamento')}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:bg-white/5"
                aria-label={`Seu orçamento: ${items.length} serviço(s)`}
              >
                <ShoppingBag className="h-4 w-4" strokeWidth={1.6} />
                <motion.span
                  key={lastAdded} // nova chave = pequena animação a cada adição
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 font-mono text-[10px] font-semibold text-canvas"
                >
                  {items.length}
                </motion.span>
              </motion.button>
            )}
          </AnimatePresence>

          <button onClick={() => goTo('orcamento')} className="btn-primary group hidden !min-h-10 !px-5 !py-2 !text-[13px] sm:inline-flex">
            Fazer orçamento
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
          </button>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong lg:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="menu-mobile"
            aria-label="Principal"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass mx-auto mt-2 max-w-7xl rounded-3xl !bg-[#0c0d12]/95 p-2 lg:hidden"
          >
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => goTo(item.id)}
                className="block w-full rounded-2xl px-4 py-3.5 text-left text-ink-2 hover:bg-white/5 hover:text-ink"
              >
                {item.label}
              </button>
            ))}
            <button onClick={() => goTo('orcamento')} className="btn-primary mt-2 w-full sm:hidden">
              Fazer orçamento
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
