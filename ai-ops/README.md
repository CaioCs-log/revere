# AI-OPS

Camada de operação por agentes de IA no repo Revere.

## Objetivo

Reduzir ambiguidade para agentes, acelerar execução com escopo fechado e preservar controle humano.

Esta camada não substitui Notion, GitHub Issues, PR review, CI ou decisão humana.

## Modelo vigente

```plain text
Notion = cockpit executivo
GitHub = motor técnico
Psiu/AI-OPS = ponte operacional controlada
PR/CI/diff/gates = prova de execução
Humano = aprovação final
```

## Arquivos principais

- `protocol.md` — fluxo operacional padrão para agentes.
- `security.md` — regras mínimas de segurança.
- `task-template.md` — modelo curto de tarefa técnica.
- `pr-report-template.md` — modelo de relatório técnico para PR.
- `agent-routing.yaml` — matriz versionada de papéis, ferramentas e limites.
- `spec.schema.json` — schema mínimo para metadados automatizáveis de SPECs novas.
- `templates/` — contratos e relatórios usados em rodadas com agentes.
- `tool-adapters/` — instruções curtas por ferramenta/interface.

## Fluxo resumido

1. Ler `AGENTS.md`.
2. Ler a tarefa, issue, SPEC ou instrução executiva indicada.
3. Ler `ai-ops/protocol.md` e `ai-ops/security.md`.
4. Confirmar modo, escopo permitido, fora do escopo e arquivos protegidos.
5. Se houver agente externo, selecionar executor/revisor via `agent-routing.yaml` ou matriz AI-OPS do Notion.
6. Gerar contrato de execução usando `templates/agent-task.md`.
7. Alterar apenas arquivos autorizados.
8. Executar validação canônica e gates do pacote afetado.
9. Abrir PR com relatório claro.
10. Aguardar revisão humana.

## Fluxo SPEC -> agentes

```plain text
SPEC nova ou alterada
-> validação de metadados
-> plano técnico
-> contratos por escopo
-> executor
-> revisor de SPEC
-> revisor técnico/segurança
-> verificador
-> PR
-> aprovação humana
-> atualização Notion/repo
```

## Limites

- Não usar esta pasta como banco transacional de tarefas.
- Não criar relatórios permanentes por status sem autorização.
- Não alterar produto, schema, credenciais, CI crítica ou dependências sem autorização explícita.
- Não automatizar merge, push, deploy ou conclusão de SPEC sem revisão humana.
- Não versionar tokens, chaves ou `.mcp.json` real.

## Fonte executiva

O Notion continua sendo a fonte executiva para backlog, status, decisões e acompanhamento.

O GitHub PR continua sendo a fonte técnica para diff, validação, revisão e aprovação.

## Como expandir com segurança

1. Comece com uma SPEC ou tarefa de risco baixo.
2. Use um executor por escopo.
3. Separe executor, revisor e verificador.
4. Registre evidências no PR.
5. Só libere paralelismo depois de uma rodada validada.
