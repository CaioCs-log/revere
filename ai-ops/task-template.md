# Template de tarefa AI-OPS

Use este modelo quando uma tarefa técnica precisar ser enviada para execução no repo.

Este arquivo não é um banco de tarefas.

```plain text
# Task

ID:
Título:
Fonte executiva:
Objetivo:
Modo:
Tipo de tarefa:
Risco:
Escopo permitido:
Fora do escopo:
Arquivos permitidos:
Arquivos protegidos:
Validação obrigatória:
Critério de pronto:
Critério de bloqueio:
Critério de escalonamento:
Executor sugerido:
Revisor sugerido:
Verificador sugerido:
```

## Regras de uso
- Preencha o escopo de forma explícita.
- Liste o que está fora do escopo.
- Inclua critério de bloqueio.
- Inclua critério de escalonamento quando o risco for médio ou alto.
- Separe executor, revisor e verificador.
- Não autorize produto, schema, CI crítica ou dependências por omissão.
- Se a tarefa vier do Notion, inclua o link ou ID executivo.
- Se a tarefa vier de SPEC automatizável, inclua o `id` da SPEC e os `allowed_paths`.

Para tarefas mais detalhadas, use `templates/agent-task.md`.
