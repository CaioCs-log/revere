# Adapter — GitHub Actions

## Papel recomendado

GitHub Actions e o agente automatico de prova tecnica:

- instala dependencias;
- roda lint;
- roda format check;
- roda testes;
- roda build;
- valida metadados de SPEC;
- bloqueia PRs quebrados.

## Nao decide

GitHub Actions nao decide:

- arquitetura;
- negocio;
- pricing;
- frete;
- deploy de producao;
- conclusao de tarefa.

## Checks recomendados

- CI por pacote.
- Validacao de SPECs novas/alteradas.
- Audit de dependencias em workflow separado.
- Protecao de branch exigindo PR e checks.
