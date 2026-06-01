# Revere Backend — Governance

Este repositório contém o backend da Revere, baseado em Firebase Functions com TypeScript.

## Fonte de verdade

A fonte de verdade do projeto fica no repo meta:

```
../revere-governance
```

Antes de implementar qualquer tarefa, consulte:

- `../revere-governance/features.json`
- `../revere-governance/PROJECT_HISTORY.md`
- `../revere-governance/specs/`
- `../revere-governance/decisions/`
- `../revere-governance/checklists/`

## Escopo deste repo

Este repo é responsável pelo backend da Revere, incluindo:

- Firebase Functions
- Endpoints HTTP
- Webhooks
- Validações de payload
- Regras de domínio
- Integrações server-side
- Processamento de pedidos
- Regras finais de preço, frete e agenda
- Futuras integrações com Mercado Pago

## Fora de escopo

Este repo não deve conter:

- Storefront público
- Painel administrativo
- Componentes React
- CSS/Tailwind de interface
- Segredos ou credenciais
- Chaves Firebase
- Tokens de Mercado Pago
- Arquivos `.env`

## Regras operacionais

1. Fazer uma subtarefa por vez.
2. Não implementar feature sem SPEC ou orientação clara.
3. Não commitar arquivos de credenciais.
4. Não rodar `npm audit fix --force`.
5. Antes de commit, rodar os gates locais.
6. Manter commits pequenos e descritivos.
7. Toda validação de entrada deve passar por validators explícitos.
8. Regras críticas de preço, frete, agenda e pagamento devem ser validadas no backend.

## Estrutura esperada

```
src/
  domain/
  validators/
  webhooks/
  http/
```

## Gates locais

Antes de finalizar uma tarefa, rodar:

```bash
npm run lint
npm run build
npm test
```

## Padrão de commit

Use mensagens claras, por exemplo:

```
chore: initialize firebase functions backend
feat: add order payload validator
docs: add backend governance guide
```

## Regra de segurança

Credenciais devem ficar fora do Git.

Use arquivos locais como:

```
.env
.env.local
```

e garanta que estejam ignorados pelo Git.
