# Mapa operacional — Site/Loja Revere

Data: 2026-06-06

## Diagnóstico curto

O Revere está estruturado para pre-MVP com boa base de governança, mas ainda nao esta pronto para producao.

Eixo operacional vigente:

```plain text
Notion = cockpit executivo
GitHub/repo = motor tecnico
AI-OPS = ponte operacional controlada
PR/CI/diff/gates = prova de execucao
Humano = aprovacao final
```

## Camadas do sistema

### 1. Notion global

Responsavel por comportamento e memoria operacional:

- `Minha IA do Notion`: identidade, estilo, memoria global e regra de uso do Sistema Operacional do Psiu.
- `Sistema Operacional do Psiu`: modos de trabalho, projetos recorrentes, planos aprovados e gestao de memorias.
- `Memorias do Psiu`: memorias por escopo, status e prioridade.

Uso recomendado: somente pacote minimo. Leitura ampla apenas em auditoria, reorganizacao, diagnostico ou mudanca estrutural.

### 2. Notion do projeto Revere

Responsavel por estado executivo:

- `Contexto operacional — Site Revere`: contrato de uso do Psiu no projeto.
- `Desenvolver e lançar primeira versão Site/Loja Revere`: raiz operacional e estado canonico.
- `Tarefas BD`: backlog e execucao rastreavel.
- `Historico — Site Revere`: marcos, decisoes e bloqueios.
- `Execucoes Externas`: prompts, retornos e evidencias de agentes.
- `AI-OPS — Agentes do Projeto Revere`: matriz executiva de agentes, custo, risco e escalonamento.
- `Roteador de Contexto`: pacote minimo de leitura por tipo de tarefa.

### 3. Repo/GitHub

Responsavel por verdade tecnica:

- `AGENTS.md`: regra raiz para agentes no monorepo.
- `ai-ops/`: protocolo, seguranca, contratos, matriz local e adaptadores.
- `revere-governance/`: specs, ADRs, historico, features e mapas.
- `.github/`: CI, PR template e validacao de SPEC.
- `scripts/`: comandos canonicos de verificacao.

### 4. Apps

- `revere-storefront/`: loja publica Next.js.
- `revere-admin/`: painel admin Next.js.
- `revere-backend/`: Firebase Functions / dominio TypeScript.

## Estado atual por escopo

### revere-storefront

Estado:

- STORE-000, STORE-001 e STORE-002 concluidas.
- Rotas principais: `/`, `/cardapio`, `/produto/[slug]`.
- Fonte atual de dados: `MockRegistry`.
- Proxima frente natural: STORE-003 — `/kits` e `/kit/[slug]`.

Risco:

- Ainda sem checkout real.
- Dados ainda mockados/registry local.

### revere-admin

Estado:

- Admin-first M0-M8 concluido no padrao atual.
- P-048 integra Firestore real para M3-M6, mas esta bloqueada por ambiente.

Risco:

- Auth ainda mockada como `owner`.
- Firestore Emulator depende de Java/JRE.
- Nao e producao.

### revere-backend

Estado:

- BACK-001 validou dominio puro de preco, desconto, cupom e frete.
- `src/index.ts` ainda e `helloWorld`.

Risco:

- Backend ainda nao e autoridade real de checkout/pagamento.
- Cloud Functions segue bloqueado por Blaze.
- Dependencias precisam rodada SEC/DEPS.

### revere-governance

Estado:

- SPEC-003, SPEC-004, DESIGN-001, COPY-001 e Rules v2 documental estao versionadas.
- `features.json` esta mais atual que o historico antigo.
- ADR-0004 formaliza Notion + GitHub + AI-OPS.

Risco:

- Notion e repo podem divergir se a rodada tecnica nao fechar com PR + registro.

### ai-ops

Estado:

- Camada minima concluida.
- AI-OPS v2 adiciona matriz versionada, adapters, templates e validacao de SPEC.

Risco:

- Nao transformar `ai-ops/` em banco paralelo de tarefas.
- Cadeia de agentes deve ser supervisionada.

## Arquivos ocultos e tool-specific

- `.github/`: workflows e PR template. Deve ser protegido.
- `.vscode/`: configuracao local compartilhada de editor. Hoje e minima.
- `.mcp.json`: configuracao local de MCP; deve continuar ignorada e nunca versionar token real.
- `.agents/`, `.claude/`, `.gemini/`: skills/adapters de ferramentas. Atualmente podem divergir; tratar como tool-specific, nao como fonte superior.
- `.DS_Store`, `.next/`, `node_modules/`, `test-results/`, `playwright-report/`: artefatos locais/gerados, devem permanecer ignorados.

## Agentes e uso recomendado

| Agente/ferramenta | Papel | Uso recomendado | Nao usar para |
| --- | --- | --- | --- |
| Psiu / Notion | Orquestrador executivo | contexto, tarefa, memoria, fechamento | editar codigo diretamente |
| Codex | Executor/revisor tecnico | analise cruzada, seguranca, integracao, diffs sensiveis | tarefa mecanica barata |
| OpenCode + DeepSeek Free | Executor barato | CRUD simples, componentes, testes basicos | schema, auth, Rules, pagamento |
| OpenCode + MiniMax Free | Contingencia | segunda opiniao, docs simples | arbitro final |
| Cline/Roo-Cline | Editor agentico supervisionado | edicao em poucos arquivos, subagentes, comandos seguros | autoedicao ampla |
| GitHub Actions | Prova automatica | lint, test, build, spec validate | decisao humana |
| Humano | Gate final | merge, producao, arquitetura, done | trabalho mecanico repetitivo |

## Lógica de acionamento

```plain text
Pedido simples
-> Psiu / Notion

Pedido de projeto
-> Contexto operacional do projeto + pacote minimo

Nova SPEC
-> validar metadata -> planejar -> gerar contratos

Tarefa tecnica pequena
-> OpenCode/Cline com contrato e revisao

Tarefa sensivel
-> Codex + revisao obrigatoria

PR pronto
-> revisor de SPEC + revisor tecnico + verificador

Conclusao
-> humano aprova -> Notion/repo atualizam estado
```

## Prioridade operacional recomendada

1. Fechar PR da AI-OPS v2.
2. Resolver ENV-001: instalar Java/JRE.
3. Subir Firestore Emulator e revalidar P-048.
4. Decidir destino da branch `triage/wip-local-p048-store-back`.
5. Executar SEC/DEPS para backend `vitest` e cadeia Firebase/uuid.
6. Retomar STORE-003 em branch limpa.

## Regras de parada

Parar e pedir decisao humana quando houver:

- arquivo protegido nao autorizado;
- credenciais;
- deploy/producao;
- billing/Blaze;
- Firestore Rules, Storage ou Functions;
- pricing, frete, agendamento ou kits;
- divergencia entre Notion e repo;
- dois agentes no mesmo arquivo;
- falha de gate nao explicada.
