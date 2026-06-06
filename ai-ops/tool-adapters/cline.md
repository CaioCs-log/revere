# Adapter — Cline / Roo-Cline

## Papel recomendado

Use Cline/Roo-Cline dentro do VSCode para:

- leitura guiada de contexto;
- edicao supervisionada em poucos arquivos;
- subagentes com contrato;
- comandos seguros;
- revisao iterativa no editor.

## Configuracao observada

Configuracao local util ja existente:

- leitura autoaprovada;
- edicao autoaprovada desativada;
- comandos seguros autoaprovados;
- comandos amplos desativados;
- MCP habilitado;
- subagentes habilitados;
- modelos OpenRouter gratuitos configurados para plan/act.

## Recomendacao de seguranca

Manter:

- `editFiles=false` em autoaprovacao;
- `executeAllCommands=false`;
- browser autoaprovado desativado;
- uso de MCP supervisionado;
- prompts com allowed/forbidden paths.

## Quando nao usar

Nao usar Cline como executor autonomo para:

- arquivos protegidos;
- segredo/credencial;
- deploy;
- dependencia;
- auth/rules/payment;
- alteracao em multiplos escopos.

## Prompt base

```plain text
Modo: implementacao supervisionada.
Leia AGENTS.md, ai-ops/protocol.md, ai-ops/security.md e a tarefa abaixo.
Use apenas os arquivos permitidos.
Antes de editar, liste o plano curto.
Depois de editar, reporte diff e comandos.
Nao autoaprove edicao fora do escopo.
```
