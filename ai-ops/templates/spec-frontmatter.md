# SPEC metadata block

Use este bloco no topo de novas SPECs que devam entrar na esteira AI-OPS.

```yaml
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
```
