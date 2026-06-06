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

- Data: 2026-06-06
- Fase atual: pre-MVP com Admin-first M0-M8, Storefront STORE-002, Backend BACK-001 e AI-OPS mínima concluídos.
- Em andamento: estabilização operacional para AI-OPS v2, ENV-001/P-048 e preparação de STORE-003.
- Próximo passo técnico: resolver ENV-001 (Java/JRE), subir Firestore Emulator e revalidar P-048.
- Próximo passo de governança: consolidar AI-OPS v2 para SPECs automatizáveis e cadeia supervisionada de agentes.
- Riscos/travas: Java/JRE ausente para Firestore Emulator; branch `triage/wip-local-p048-store-back` mistura Admin/Storefront/Backend/Governance; dependências com vulnerabilidades auditadas; Admin ainda usa auth mock; Cloud Functions/Storage seguem bloqueados por Blaze.

## Log

### 2026-06-06 — GOV/AI-OPS v2 para SPECs e cadeia supervisionada

- O que foi feito:
  - Criada matriz versionada de agentes e ferramentas em `ai-ops/agent-routing.yaml`.
  - Adicionados adaptadores para Codex, OpenCode, Cline/Roo-Cline, Psiu/Notion e GitHub Actions.
  - Criados templates de contrato, revisão, verificação e frontmatter de SPEC em `ai-ops/templates/`.
  - Criado `ai-ops/spec.schema.json` e script `scripts/validate-spec-metadata.mjs` para validar metadados de SPECs novas/alteradas.
  - Adicionado workflow `.github/workflows/spec-validate.yml`.
  - Atualizados `AGENTS.md`, `ai-ops/protocol.md`, `ai-ops/security.md`, template de PR e `SPEC-TEMPLATE.md`.
  - Criado `revere-governance/docs/project-map.md` como mapa operacional Notion + repo + agentes.
- Próximo passo:
  - Abrir PR de governança, revisar exceções de arquivos protegidos e, após merge, usar essa base para ENV-001/P-048 e próximas SPECs.

### 2026-06-05 — DOC-002 Espelhamento de canônicos do Notion

- O que foi feito:
  - Conferida a árvore real de `revere-governance` antes da escrita.
  - Reespelhadas do Notion as versões canônicas de `SPEC-004`, `ADR-0003` e do topo/status da `SPEC-003`.
  - Criados os arquivos `specs/DESIGN-001-design-system.md`, `specs/COPY-001-home-storefront.md` e `specs/SPEC-RULES-v2-firestore.md`.
  - Atualizado `features.json` para registrar o espelhamento documental concluído em 2026-06-05.
- Próximo passo:
  - Validar o diff documental desta rodada antes de qualquer push ou integração.

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
