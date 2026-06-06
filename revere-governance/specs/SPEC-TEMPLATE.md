---
id: SPEC-000
title: Titulo curto da SPEC
status: draft
owner: Caio
source:
  notion: ""
  issue: ""
  adr: ""
scope:
  allowed_paths:
    - revere-storefront/src/**
  forbidden_paths:
    - revere-governance/specs/**
    - revere-governance/decisions/**
    - firestore.rules
    - .env*
gates:
  - npm run format:check
  - npm run lint
  - npm run test
  - npm run build
agents:
  orchestrator: Psiu / Notion
  executor: OpenCode DeepSeek Free
  spec_reviewer: Codex
  code_reviewer: Codex
  verifier: GitHub Actions
human_approval_required:
  - protected_files
  - architecture
  - pricing
  - production_deploy
stop_conditions:
  - escopo fora de allowed_paths
  - necessidade de schema ou Rules
  - falha repetida de gate
---

# SPEC — <TÍTULO DA FEATURE>

> Para SPECs novas, mantenha o frontmatter AI-OPS acima preenchido. Ele permite validação automática e geração de contratos para agentes. SPECs legadas podem continuar sem frontmatter até serem migradas em rodada própria.

## 1) Contexto
- Por que isso existe (1–3 linhas)
- Referências (Notion / decisões / links)

## 2) Objetivo
- O que precisa estar verdadeiro quando terminar

## 3) Escopo
### Inclui
- ...
### Não inclui
- ...

## 4) Regras de negócio
- Regra 1
- Regra 2
- Exemplos (inputs/outputs)

## 5) UX / UI
- Páginas/rotas afetadas
- Componentes
- Estados: loading / empty / error
- Responsividade: comportamento esperado em mobile/tablet/desktop

## 6) Dados (Firestore)
- Coleções afetadas
- Campos (nome, tipo, obrigatório?)
- Índices necessários
- Regras de segurança (alto nível)

## 7) Segurança / LGPD
- Quais dados pessoais são coletados
- Minimização (coletar o mínimo)
- Riscos e mitigação

## 8) Critérios de aceitação (checklist)
- [ ] Critério 1
- [ ] Critério 2

## 9) Testes obrigatórios
- Unit:
- Integração:
- E2E smoke:
