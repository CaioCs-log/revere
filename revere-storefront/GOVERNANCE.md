# Governance — revere-storefront

Este repositório segue a governança definida no repo meta `revere-governance`.

## Fonte de verdade

Antes de implementar qualquer feature, consultar:

- `../revere-governance/features.json`
- `../revere-governance/PROJECT_HISTORY.md`
- A SPEC correspondente em `../revere-governance/specs/`
- Os checklists em `../revere-governance/checklists/`

## Fluxo obrigatório

Para cada tarefa:

1. Ler a SPEC da feature.
2. Implementar apenas uma subtarefa por vez.
3. Rodar os gates locais:

npm run lint
npm test
npm run build
npm run test:e2e

4. Atualizar evidências no `revere-governance`, quando aplicável.
5. Registrar decisões ou mudanças relevantes no histórico do projeto.

## Critérios mínimos

Nenhuma entrega deve ser considerada concluída sem:

- Lint passando.
- Testes unitários passando.
- Build passando.
- Teste e2e smoke passando.
- Critérios de aceite da SPEC atendidos.

## Regra de escopo

O `revere-storefront` é responsável apenas pela experiência pública da loja Revere.

Não implementar aqui:

- Painel administrativo.
- Webhooks.
- Regras finais de pagamento.
- Validações críticas de preço.
- Lógica autoritativa de pedidos.

Essas responsabilidades pertencem aos repos/admin/backend conforme definido no `revere-governance`.
