# ADR-0004 — Modelo operacional Notion + GitHub + AI-OPS

## Status

Aceita

## Contexto

O projeto Site/Loja Revere passou a operar com uma camada AI-OPS mínima para organizar o trabalho entre Notion, GitHub e agentes de IA.

A evolução recente mostrou que o Notion sozinho é excelente para contexto executivo, decisões, tarefas e histórico, mas não deve substituir o GitHub como fonte técnica de execução, versionamento, diff, revisão, CI e merge.

Também ficou claro que o GitHub sozinho não resolve a gestão operacional do projeto, porque decisões, prioridades, recursos reutilizáveis, status executivo e histórico de projeto continuam mais claros no Notion.

A camada AI-OPS foi criada para reduzir ambiguidade entre esses dois mundos, mantendo controle humano e rastreabilidade.

## Decisão

Adotar o seguinte modelo operacional:

```plain text
Notion = cockpit executivo
GitHub = motor técnico
Psiu/AI-OPS = ponte operacional controlada
```

### Papel do Notion

O Notion é a fonte principal para:

- objetivos;
- projetos;
- tarefas;
- decisões executivas;
- histórico operacional;
- recursos e documentação reutilizável;
- priorização;
- próximos passos;
- registro de fechamento.

### Papel do GitHub

O GitHub é a fonte principal para:

- specs versionadas;
- ADRs;
- branches;
- commits;
- pull requests;
- diffs;
- CI;
- revisão técnica;
- merge;
- evidência técnica da execução.

### Papel da AI-OPS

A AI-OPS opera como camada de protocolo entre Notion e GitHub.

Ela deve:

- transformar decisões em escopo executável;
- verificar o estado real do repo;
- criar branches e PRs pequenos;
- registrar validação;
- preservar escopo;
- manter aprovação humana como gate;
- atualizar o Notion depois da execução.

## Fluxo padrão

```plain text
Notion define intenção e escopo
↓
Psiu verifica o GitHub
↓
Psiu prepara contrato ou plano
↓
Caio autoriza quando necessário
↓
Psiu executa em branch
↓
GitHub registra PR, diff e CI
↓
Caio/Psiu revisam
↓
Merge quando aprovado
↓
Psiu atualiza Notion, tarefa, projeto e recursos
```

## Regras operacionais

- Nenhuma alteração relevante deve ir direto para `main`.
- Mudanças técnicas devem passar por branch e PR.
- Tarefas de produto exigem escopo explícito e autorização própria.
- Specs e ADRs são contratos técnicos e devem ser versionados no GitHub.
- Documentos criados a partir de tarefas ou projetos, quando forem reutilizáveis, devem ser registrados no Notion em Recursos / Wiki.
- PRs devem registrar escopo, validação, riscos e fora do escopo preservado.
- Agentes não devem marcar tarefas como concluídas sem revisão humana.
- Se houver conflito entre uma instrução tool-specific e `AGENTS.md`, prevalece `AGENTS.md` ou a regra mais restritiva.

## Consequências positivas

- Reduz duplicação entre conversa, Notion e GitHub.
- Aumenta rastreabilidade técnica.
- Evita que decisões fiquem soltas em chat.
- Permite verificar o repo real antes de planejar.
- Dá ao Caio uma visão executiva sem perder evidência técnica.
- Permite que Psiu opere o projeto com mais autonomia, mas ainda com gates claros.

## Riscos e mitigação

### Risco: Notion e GitHub ficarem desalinhados

Mitigação:
- toda execução relevante deve fechar com atualização mínima no Notion;
- PR deve referenciar tarefa ou decisão executiva sempre que possível.

### Risco: excesso de burocracia

Mitigação:
- manter PRs pequenos;
- evitar documentos longos para microajustes;
- usar Recursos / Wiki apenas para documentos reutilizáveis.

### Risco: agente extrapolar escopo

Mitigação:
- usar `AGENTS.md` e `ai-ops/protocol.md`;
- registrar fora do escopo no PR;
- manter revisão humana como gate.

### Risco: tool-specific instructions conflitarem com AI-OPS

Mitigação:
- tratar `.agents/`, `.claude/`, `.gemini/` e similares como especializações;
- manter `AGENTS.md` como fonte oficial agnóstica;
- auditar conflitos quando surgirem.

## Fora de escopo

Esta ADR não autoriza:

- automação total Notion ↔ GitHub;
- execução autônoma sem revisão;
- múltiplos agentes em paralelo;
- alteração de produto sem tarefa e autorização;
- alteração de schema, Firebase, Firestore rules, Storage ou CI crítica.

## Critério de revisão

Esta decisão deve ser revisada depois de novos pilotos AI-OPS, especialmente antes de liberar duas frentes paralelas ou usar agentes em tarefas de produto.

## Revisão 2026-06-06 — AI-OPS v2

A camada mínima foi mantida, mas a próxima expansão passa a exigir:

- SPECs novas com metadados automatizáveis;
- matriz versionada de agentes em `ai-ops/agent-routing.yaml`;
- contratos explícitos por executor;
- separação entre executor, revisor e verificador;
- validação de SPEC via `node scripts/validate-spec-metadata.mjs --changed`;
- cadeia de agentes apenas supervisionada, sem merge, push, deploy ou status `done` automático.
