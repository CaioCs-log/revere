# ADR-0003 — Pricing, kits e cupons

## Status

Aceita — requer retificação documental das faixas de desconto dos kits.

## Contexto

A ADR-0003 registra a estratégia inicial de precificação, kits e cupons da Revere. Após o fechamento da SPEC-003 — Firestore Schema v2, as faixas oficiais de desconto progressivo dos kits customizáveis foram definidas e devem prevalecer sobre qualquer redação anterior da ADR.

A versão vigente do schema define que o desconto progressivo inicial dos kits customizáveis será:

- 5% para 7 a 9 pratos;
- 8% para 10 a 14 pratos;
- 10% para 15 ou mais pratos.

Essas faixas substituem qualquer menção anterior a desconto progressivo de 5% a 15%.

## Decisão

Retificar a ADR-0003 para alinhar a política de desconto dos kits customizáveis à SPEC-003.

A regra oficial passa a ser:

| Quantidade de pratos | Desconto |
| --- | --- |
| 7 a 9 pratos | 5% |
| 10 a 14 pratos | 8% |
| 15 ou mais pratos | 10% |

Diretrizes complementares:

- O kit customizável inicial começa com mínimo de 7 unidades.
- O cliente pode montar livremente o kit e repetir pratos.
- A regra de desconto progressivo do MVP se aplica a refeições congeladas (`frozen_meal`), especialmente gramaturas como 300g, 360g, 410g e futuras equivalentes.
- Produtos futuros como snacks congelados ficam fora dessa regra até nova decisão.
- O Backend deve validar quantidade, composição, visibilidade dos itens, preço final e desconto aplicado.
- O Storefront pode exibir a progressão de desconto, mas não é fonte final de verdade para cálculo de preço.

## Consequências

- A SPEC-003 permanece como fonte vigente para schema e regra de desconto.
- A ADR-0003 passa a ficar coerente com Playbook, SPEC-003 e SPEC-004.
- Qualquer implementação futura de kits no Admin, Storefront ou Backend deve usar 5%, 8% e 10%, não 15%.
- Alterações futuras nas faixas de desconto devem ser registradas em nova decisão ou revisão formal da ADR.
