# Project History — Site Revere

## Fonte de verdade (marca e negócio)

- Fundacional — Revere (Notion)
- Modelo de negócio — Revere (Notion)
- Brand Book — Revere (Notion)
- Cardápio de Lançamento — Revere (Notion)

## Decisões fixas (não-negociáveis)

- Stack: Next.js (storefront e admin) + Firebase (Auth + Functions) + Firestore + Cloud Run
- Repos separados: revere-storefront / revere-admin / revere-backend
- Repo meta: revere-governance (SPECs + features + histórico)
- Entrega: Blumenau, frete fixo por bairro (lista)
- Agendamento: dia da semana + turno, lead time 5 dias
- Pagamento: Mercado Pago (Pix + cartão), pagamento no checkout
- Produtos: variações por gramatura (um produto com variações)
- Kits: customizável (pode repetir prato) + kits prontos
- Desconto kit: 5% de 7 a 9, 8% de 10 a 14, 10% para 15+
- Desconto primeira compra: automático
- Cupom: campo no checkout
- Dados do cliente: data de nascimento (sem restrições alimentares no MVP)
- Testes desde o dia 1

## Estado atual (atualize sempre que encerrar uma tarefa)

- Data: 2026-06-01
- Fase atual: FASE 2 (Firebase Setup) / FASE 4.1 (Firestore Schema Design)
- Em andamento: Finalização da documentação base de governança
- Próximo passo: Iniciar FASE 4.2 (Admin-first CRUD) após validação técnica do schema
- Riscos/travas: nenhum

## Log

### 2026-06-03 — F2.1 Consolidar governança (3b36edd)

- O que foi feito:
  - Submodule revere-governance sincronizado ao commit blessed 3b36edd.
  - SPEC-001 arquivada em `specs/historical/SPEC-001-firestore-schema-v1.md`.
  - SPEC-003 presente e F006=done em 3b36edd confirmados.
- Próximo passo:
  - Remover gitlink e consolidar conteúdo no monorepo (F2.2).

### 2026-06-01 — SPEC-003 Versionada

- O que foi feito:
  - SPEC-003 — Firestore Schema v1 versionada documentalmente.
  - Escopo: Definição completa das coleções `products`, `productVariants`, `tags`, `categories`, `kitPresets`, `coupons`, `neighborhoods`, `siteContent`, `users` e `orders`.
  - Decisões consolidadas: kit customizável com desconto progressivo (5%/8%/10%), frete grátis > R$ 199, Home dinâmica por blocos tipados, e snapshot de pedidos.
  - Saneamento da estrutura de governança na raiz concluído.
- Próximo passo:
  - Iniciar implementação do CRUD no Admin seguindo a SPEC-003.

### 2026-06-01 — Sincronização de Governança

- O que foi feito:
  - Fase 1 de governança formalmente concluída.
  - Criado arquivo `.gitignore`.
  - Populado `features.json` com o backlog inicial (F001 a F007).
  - Histórico sincronizado com o estado real do projeto.
  - Confirmada existência de: `SPEC-TEMPLATE`, `DoD`, `PR_CHECKLIST`, `Roles`.
  - Confirmado versionamento de: `ADR-0001`, `ADR-0002`, `ADR-0003`, `SPEC-001`, `SPEC-002`.
- Próximo passo:
  - Aguardar validação final da SPEC-003 no Notion antes de criar `specs/SPEC-003-firestore-schema-v2.md`.

### 2026-05-31 — SPEC-002 (Firestore Rules + roles)
- O que foi feito:
  - Criada a SPEC-002 com regras de acesso (público/cliente/admin) e estratégia de admin via adminUsers/{uid}
- Próximo passo:
  - Commitar a SPEC-002
  - Iniciar FASE 2 (Firebase dev + prod) ou criar SPEC-003 (Mercado Pago flow)
