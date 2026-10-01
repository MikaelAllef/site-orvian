#!/usr/bin/env bash
# Envia um orçamento de exemplo direto para o n8n (sem passar pelo site).
# Uso: ./testar-webhook.sh <URL_DO_WEBHOOK> <CHAVE_SECRETA>
#  - Para testar no editor do n8n, use a "Test URL" e clique em "Listen for test event" antes.
#  - Depois de ativar o fluxo, use a "Production URL".
set -euo pipefail
URL="${1:?Informe a URL do webhook}"
SECRET="${2:?Informe a chave secreta (a mesma do .env: QUOTE_WEBHOOK_SECRET)}"
DIR="$(cd "$(dirname "$0")" && pwd)"

curl -sS -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "X-Orvian-Secret: $SECRET" \
  --data @"$DIR/exemplo-orcamento.json"
echo
