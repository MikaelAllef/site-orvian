/**
 * Página única da ORVIAN Serviços Digitais.
 * Ordem das seções = jornada do cliente:
 * proposta → soluções → serviços → como funciona → orçamento → confiança → dúvidas.
 */
import { useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import Solutions from './components/sections/Solutions';
import Process from './components/sections/Process';
import Manifesto from './components/sections/Manifesto';
import FAQ from './components/sections/FAQ';
import Services from './components/services/Services';
import QuoteBuilder from './components/quote/QuoteBuilder';
import ChatWidget from './components/chat/ChatWidget';
import { QuoteProvider } from './lib/quote';

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const openChat = () => setChatOpen(true);

  return (
    <QuoteProvider>
      {/* Atalho de acessibilidade para quem navega pelo teclado */}
      <a
        href="#solucoes"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-canvas"
      >
        Pular para o conteúdo
      </a>

      <Header />
      <main>
        <Hero />
        <Solutions />
        <Services />
        <Process />
        <QuoteBuilder />
        <Manifesto />
        <FAQ onOpenChat={openChat} />
      </main>
      <Footer />

      <ChatWidget open={chatOpen} setOpen={setChatOpen} />
    </QuoteProvider>
  );
}
