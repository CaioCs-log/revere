# revere-governance

Fonte de verdade do projeto Site Revere.

## Estrutura
- features.json: backlog por fase + status + links de evidência
- PROJECT_HISTORY.md: histórico do projeto (mudanças, decisões, validação)
- specs/: especificações (uma por feature)
- decisions/: ADRs (decisões arquiteturais)
- checklists/: DoD e checklist de PR
- prompts/: papéis dos agentes (orchestrator/implementer/reviewer)
- docs/: mapas operacionais e documentação de arquitetura do projeto

## Regra operacional
Antes de iniciar qualquer tarefa em qualquer repo:
1) Ler features.json
2) Ler PROJECT_HISTORY.md
3) Ler a SPEC da feature
4) Ler AGENTS.md e ai-ops/protocol.md quando houver agente externo

## Documentos úteis

- `docs/project-map.md`: mapa atual Notion + repo + agentes + automação.
- `decisions/ADR-0004-ai-ops-notion-github.md`: modelo Notion/GitHub/AI-OPS.
- `specs/SPEC-TEMPLATE.md`: template de SPEC com metadados para automação.
