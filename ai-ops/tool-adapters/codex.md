# Adapter — Codex

## Papel recomendado

Use Codex para:

- analise cruzada Notion + repo;
- revisao tecnica e seguranca;
- implementacao sensivel;
- consolidacao de diffs;
- criacao de PRs revisaveis;
- validacao de gates.

## Quando nao usar

Evite Codex como primeira escolha para tarefa mecanica, barata e isolada que OpenCode consiga executar com contrato fechado.

## Configuracao operacional

- Sempre iniciar lendo `AGENTS.md`, `ai-ops/protocol.md` e `ai-ops/security.md`.
- Usar branch/worktree isolado quando a branch atual estiver suja ou for de triagem.
- Nao fazer merge, push, deploy ou marcar `done` sem humano.
- Registrar comandos e limitacoes no PR.

## Prompt base

```plain text
Atue no repo Revere como executor/revisor Codex.
Leia AGENTS.md, ai-ops/protocol.md, ai-ops/security.md e a SPEC/tarefa indicada.
Escopo permitido: ...
Fora do escopo: ...
Arquivos protegidos autorizados: ...
Valide com: ...
Pare se: ...
Ao final, reporte diff, gates, riscos e pendencias.
```
