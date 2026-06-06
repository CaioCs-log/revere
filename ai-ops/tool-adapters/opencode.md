# Adapter — OpenCode

## Papel recomendado

Use OpenCode como executor local de baixo custo para:

- CRUD simples;
- componentes pequenos;
- testes unitarios basicos;
- refatoracao local pequena;
- ajustes de documentacao.

## Modelos cadastrados no AI-OPS

- DeepSeek V4 Flash Free — executor gratuito principal.
- MiniMax M3 Free — contingencia e segunda opiniao barata.

## Quando nao usar

Nao usar sozinho para:

- schema;
- Firestore Rules;
- auth;
- checkout/pagamento;
- dependencias;
- CI critica;
- decisao de arquitetura;
- arquivos protegidos sem autorizacao.

## Contrato obrigatorio

OpenCode deve receber sempre:

- tarefa;
- arquivos permitidos;
- arquivos proibidos;
- criterio de bloqueio;
- validacao obrigatoria;
- fora do escopo.

## Prompt base

```plain text
Execute apenas a tarefa abaixo no repo Revere.
Leia AGENTS.md e os arquivos indicados.
Voce pode alterar somente:
- ...
Voce nao pode alterar:
- ...
Nao faça push, merge, instalacao de dependencia, schema, Rules ou decisao de negocio.
Se precisar sair do escopo, pare e explique.
Ao final, reporte arquivos alterados e comandos executados.
```
