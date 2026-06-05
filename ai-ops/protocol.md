# Protocolo AI-OPS

Este protocolo define o fluxo mínimo para agentes que atuam no repo Revere.

## Regra central
Execute apenas o escopo explicitamente autorizado. Em caso de dúvida, pare e peça decisão humana.

## Fluxo operacional
1. Leia `AGENTS.md`.
2. Leia a tarefa, issue, spec ou instrução executiva indicada.
3. Leia `ai-ops/security.md`.
4. Identifique:
   - objetivo;
   - escopo permitido;
   - fora do escopo;
   - arquivos permitidos;
   - arquivos protegidos;
   - validação obrigatória;
   - critério de pronto;
   - critério de bloqueio.
5. Se houver conflito, siga a regra mais restritiva.
6. Se houver execução técnica, trabalhe em branch própria.
7. Altere apenas arquivos autorizados.
8. Execute validação canônica.
9. Abra PR com relatório técnico.
10. Aguarde revisão humana.

## O agente pode
- Criar ou editar arquivos dentro do escopo autorizado.
- Sugerir ajustes fora do escopo sem implementá-los.
- Registrar riscos, dúvidas e limitações.
- Preparar PR para revisão.

## O agente não pode
- Alterar produto sem autorização explícita.
- Alterar schema, Firebase, Firestore rules, CI crítica ou dependências sem autorização explícita.
- Alterar `.env*` ou credenciais.
- Criar task registry paralelo sem autorização.
- Criar pasta permanente de reports operacionais.
- Marcar tarefa como concluída sem revisão humana.

## Validação
Use o comando canônico quando disponível:

```bash
./scripts/verify.sh
```

Se a validação não puder ser executada, registre no PR:
- motivo;
- validações alternativas feitas;
- risco residual.

## PR
Todo PR deve explicar:
- o que foi feito;
- tarefa relacionada;
- arquivos alterados;
- validação executada;
- fora do escopo preservado;
- riscos e pontos de atenção;
- decisões pendentes.
