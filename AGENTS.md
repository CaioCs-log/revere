# Revere — Monorepo

Monorepo do Site/Loja Revere. Cada pasta de topo é um app/escopo:
- revere-storefront/  → Next.js (loja)
- revere-admin/       → Next.js (painel admin)
- revere-backend/     → Firebase Functions (TypeScript)
- revere-governance/  → fonte de verdade: specs/, decisions/ (ADRs),
                        checklists/, prompts/, PROJECT_HISTORY, features

## Estado atual (importante)
- Admin-first: M0–M5 concluídos e validados. Próximo: M6 Kits.
- Cloud Functions e Storage BLOQUEADOS até upgrade Blaze. NÃO implemente
  nada que dependa de Functions/Storage sem aviso explícito.
- SPECs vigentes em revere-governance/specs/:
  - SPEC-003-firestore-schema-v2.md (schema vigente)
  - SPEC-002-firestore-rules-v1.md (Rules v1; Rules v2 ainda é proposta)
  - SPEC-001 arquivada em specs/historical/
  - SPEC-004 (admin-first CRUD) ainda NÃO versionada — ver P-044

## Como trabalhar
- Atue sempre dentro do pacote relevante (revere-admin, etc.).
- Gates obrigatórios antes de PR (rode dentro do pacote alterado):
  - npm run format:check
  - npm run lint
  - npm run test
  - npm run build
  - npm run test:e2e   (Playwright)
- Mudança só de docs em revere-governance não exige os gates de app.
- 1 escopo por PR. PRs pequenos e revisáveis.
- Critérios de aceite vêm da SPEC referenciada na tarefa.

## Segurança (não negociável)
- Nunca commitar segredos: .env.local, service accounts, chaves Firebase/MP.
- Não relaxar Firestore Rules.

## Limites de decisão (NÃO decidir sozinho)
- Arquitetura, modelo de dados, regras de frete/agendamento/pricing de kits.
- Alterar SPEC ou ADR só via tarefa explícita.
- Não tocar em billing, deploy de produção ou credenciais.

## Entregável de cada tarefa
- PR com: o que foi feito, gates rodados e resultado, pontos de atenção.
