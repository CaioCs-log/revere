# Revere Admin — Governance

Este repositório contém o painel administrativo da Revere.

## Fonte de verdade

A fonte de verdade do projeto fica no repo meta:
../revere-governance

Antes de implementar qualquer tarefa, consulte:

- `../revere-governance/features.json`
- `../revere-governance/PROJECT_HISTORY.md`
- `../revere-governance/specs/`
- `../revere-governance/decisions/`
- `../revere-governance/checklists/`

## Escopo deste repo

Este repo é responsável pelo painel administrativo da Revere, incluindo:

- Login administrativo
- Dashboard
- Gestão de catálogo
- Gestão de produtos e variantes
- Gestão de kits
- Gestão de banners e conteúdo do site
- Gestão de bairros, frete e regras operacionais
- Gestão futura de pedidos e clientes

## Fora de escopo

Este repo não deve conter:

- Storefront público
- Backend de webhooks
- Cloud Functions
- Regras finais de pagamento
- Segredos ou credenciais
- Chaves Firebase
- Tokens de Mercado Pago

## Regras operacionais

1. Fazer uma subtarefa por vez.
2. Não implementar feature sem SPEC ou orientação clara.
3. Não commitar arquivos de credenciais.
4. Não rodar `npm audit fix --force`.
5. Antes de commit, rodar os gates locais.
6. Manter commits pequenos e descritivos.

## Gates locais

Antes de finalizar uma tarefa, rodar:
npm run format:check
npm run lint
npm test
npm run build
npm run test:e2e

## Padrão de commit

Use mensagens claras, por exemplo:
feat: add admin placeholder routes
test: add playwright e2e smoke for admin
docs: add admin governance guide

## Regra de segurança

Credenciais devem ficar fora do Git.

Use arquivos locais como:
.env.local
e garanta que estejam ignorados pelo Git.
