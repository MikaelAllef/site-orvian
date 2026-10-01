# ORVIAN · Serviços Digitais

Site de orçamentos da ORVIAN: catálogo de serviços, simulador de orçamento em 4 etapas e chat de suporte com a assistente **Orvia** (IA Gemini, com respostas locais de reserva).

**Stack:** React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · Motion · Netlify Functions (Express no ambiente local)

---

## Como rodar

```bash
npm install
cp .env.example .env      # preencha GEMINI_API_KEY e QUOTE_WEBHOOK_URL (ambos opcionais)
npm run dev               # http://localhost:3000
```

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor + front com recarga automática |
| `npm run build` | Gera a pasta `dist/` para produção |
| `npm start` | Sobe o servidor Node de produção (alternativa ao Netlify) |
| `npm run typecheck` | Checagem de tipos (TypeScript strict, sem variáveis não usadas) |
| `npm run format` | Formata o código com Prettier |

---

## Deploy no Netlify

O `netlify.toml` já configura tudo: build `npm run build`, publicação de `dist/` e as funções de `netlify/functions/` (`/api/chat` e `/api/quote`).

1. Publique pelo **Git** (GitHub/GitLab conectado ao Netlify) ou pela **Netlify CLI** (`npx netlify deploy --prod`). Arrastar a pasta `dist/` no painel publica só o visual — as funções (chat com IA e envio ao n8n) não sobem assim.
2. **Site configuration → Environment variables:** `GEMINI_API_KEY`, `QUOTE_WEBHOOK_URL`, `QUOTE_WEBHOOK_SECRET` (todas opcionais; sem elas o chat usa respostas locais e o orçamento não vai ao n8n).
3. **Trigger deploy** após mudar variáveis.

Diferenças em relação ao servidor local:
- Não existe `orcamentos.jsonl` (o disco do Netlify é somente leitura): **o registro oficial é a planilha preenchida pelo n8n**.
- O limite de requisições por IP vale por instância da função — é proteção básica, não absoluta.
- Erros das funções aparecem em **Logs → Functions**.
- O selo "Powered by Netlify" que aparece em *Deploy Previews* vem do Netlify, não do site: desligue em **Site configuration → Deploy Previews → Netlify Drawer**.

---

## Estrutura

```
netlify.toml               configuração de deploy (build, funções, cabeçalhos)
netlify/functions/         API em produção: chat.mts, quote.mts
api/core.ts                lógica da API (validação, IA, envio ao n8n) — usada pelo Netlify e pelo server.ts
server.ts                  servidor local (Express): mesma API + entrega do front
public/
  videos/                  vídeos do topo (hero-1/2 .mp4 + .webm) e poster
src/
  main.tsx                 ponto de entrada
  App.tsx                  ordem das seções da página
  index.css                tokens de design (cores, fontes) e componentes CSS
  data/                    ← CONTEÚDO (editar aqui, sem mexer em layout)
    services.ts            catálogo: serviços, pacotes, preços, prazos
    site.ts                contatos (WhatsApp, e-mail, Instagram) e opções
    content.ts             FAQ, etapas, diferenciais, segmentos
    serviceImages.ts       liga cada serviço à sua imagem
  lib/                     lógica sem interface
    quote.tsx              estado do orçamento (Context) e cálculos
    assistant.ts           "cérebro" da Orvia (compartilhado com o servidor)
    dom.ts / motion.ts     utilitários e curva de animação padrão
  hooks/
    useDialog.ts           Esc, foco preso e trava de rolagem em janelas
  components/
    layout/                Header, Footer
    sections/              Hero (+ HeroVideo: vídeo em capítulos), Solutions, Process, Manifesto, FAQ
    services/              grade, card, modal de pacotes, cálculo da grade
    quote/                 simulador: etapas, resumo, preço animado
    chat/                  widget, mascote, peças visuais, lógica (useChat)
    ui/                    Reveal, SectionHeading, ServiceIcon
  assets/images/           logo, mascote Orvia, imagens dos serviços
```

---

## Onde editar

| O quê | Arquivo |
|---|---|
| **Serviços, pacotes, valores e prazos** | `src/data/services.ts` — espelha a planilha *Base Leads* (coluna `sheetId` = "ID"); itens sem ID são fictícios |
| WhatsApp, e-mail, Instagram, mostrar/ocultar preços | `src/data/site.ts` |
| FAQ, etapas, diferenciais | `src/data/content.ts` |
| Respostas e prompt da Orvia | `src/lib/assistant.ts` |
| Cores, tipografia, raios, sombras, durações | `src/index.css` (bloco `@theme`) |
| Capítulos do vídeo do topo (nome e tempo) | `src/components/sections/HeroVideo.tsx` (`CHAPTERS`) |
| Áreas da seção Soluções e passos do Como funciona | `src/data/content.ts` |
| Vídeos do topo | `public/videos/hero-1.mp4` e `hero-2.mp4` — substitua mantendo os nomes (troque ou apague também os `.webm`) |
| Imagens dos serviços | `src/assets/images/servicos/<id-do-serviço>.webp` |
| Aparências da Orvia | `src/assets/images/orvia-*.png` |

Tudo (cards, simulador e chatbot) lê o catálogo de `services.ts`: alterou lá, o site inteiro acompanha.

---

## Chat "Orvia"

- **Com `GEMINI_API_KEY`:** responde com IA usando o catálogo como contexto e sugere ações (adicionar serviço, abrir orçamento, WhatsApp).
- **Sem chave, ou se a IA falhar:** respostas locais por intenção (preços, prazos, pagamento, serviços…). Funciona até sem servidor.
- **Aparências:** `ola` (abertura) → `escrevendo` (gerando resposta) → `ajudando` (respondeu) → `sucesso` (encerrou, com convite para o Instagram).

## Orçamentos

`POST /api/quote` valida os dados, recalcula os itens pelo catálogo (nunca confia em valores do navegador), gera o protocolo `ORV-XXXXXX`, envia o pedido para o **fluxo do n8n** (`QUOTE_WEBHOOK_URL`, protegido por `QUOTE_WEBHOOK_SECRET`).

O fluxo (pasta `n8n/`) classifica o lead com IA, salva na planilha **Leads**, avisa no Telegram e manda e-mail de confirmação ao cliente. Passo a passo em [`n8n/README.md`](n8n/README.md).

Proteções: limite de requisições por IP, campo-isca anti-robô (honeypot), aceite de contato (LGPD) e chave secreta no webhook. Rodando localmente, o servidor também guarda uma cópia em `orcamentos.jsonl` (dados pessoais — está no `.gitignore`).

## Boas práticas adotadas

- **Conteúdo separado de layout** (`src/data/`): textos e preços mudam sem tocar em componentes.
- **Lógica separada de interface** (`lib/`, `useChat`, `gridLayout`): mais fácil de testar e reaproveitar.
- **TypeScript strict** com `noUnusedLocals`/`noUnusedParameters`: código morto não compila.
- **Acessibilidade:** foco visível, navegação por teclado, Esc fecha janelas, foco preso em modais, `aria-*` nos controles, respeito a "reduzir movimento", botão para pausar o vídeo.
- **Performance:** imagens WebP com `loading="lazy"`, vídeos em 1080p comprimidos, vídeo pausa fora da tela e não toca sozinho em "economia de dados".
- **Responsivo:** testado em 360, 390, 768, 1024 e 1440 px, sem rolagem horizontal.
