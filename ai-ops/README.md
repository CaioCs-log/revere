# AI-OPS

Camada mínima de operação por agentes de IA no repo Revere.

## Objetivo
Reduzir ambiguidade para agentes, melhorar revisão humana e manter o controle operacional do projeto.

Esta camada não substitui o Notion, GitHub Issues, PR review, CI ou decisão humana.

## Arquivos
- `protocol.md` — fluxo operacional padrão para agentes.
- `security.md` — regras mínimas de segurança.
- `task-template.md` — modelo de tarefa técnica quando necessário.
- `pr-report-template.md` — modelo de relatório técnico para PR.

## Fluxo resumido
1. Ler `AGENTS.md`.
2. Ler a tarefa, issue ou spec indicada.
3. Ler `ai-ops/protocol.md` e `ai-ops/security.md`.
4. Confirmar escopo permitido e fora do escopo.
5. Alterar apenas arquivos autorizados.
6. Executar validação canônica.
7. Abrir PR com relatório claro.
8. Aguardar revisão humana.

## Limites
- Não usar esta pasta como banco transacional de tarefas.
- Não criar relatórios permanentes por status.
- Não criar regras específicas por ferramenta sem necessidade.
- Não alterar produto, schema, credenciais ou CI crítica sem autorização explícita.

## Fonte executiva
O Notion continua sendo a fonte executiva para backlog, status, decisões e acompanhamento.

O GitHub PR continua sendo a fonte técnica para diff, validação, revisão e aprovação.
