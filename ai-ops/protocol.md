# Protocolo AI-OPS

Este protocolo define o fluxo mínimo para agentes que atuam no repo Revere.

## Regra central
Execute apenas o escopo explicitamente autorizado. Em caso de dúvida, pare e peça decisão humana.

## Modelo operacional

```plain text
Notion = cockpit executivo
GitHub = motor técnico
Psiu/AI-OPS = ponte operacional controlada
PR/CI/diff/gates = prova de execução
Humano = aprovação final
```

Agentes aceleram execução, mas não substituem aprovação humana para decisões de arquitetura, segurança, credenciais, produção, regras comerciais ou conclusão formal de SPEC/tarefa.

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
6. Se houver execução com agente, consulte `ai-ops/agent-routing.yaml` e gere contrato explícito.
7. Se houver execução técnica, trabalhe em branch própria.
8. Altere apenas arquivos autorizados.
9. Execute validação canônica.
10. Abra PR com relatório técnico.
11. Aguarde revisão humana.

## Fluxo para SPEC automatizável

1. SPEC nasce ou é atualizada com metadados no frontmatter.
2. `scripts/validate-spec-metadata.mjs` valida estrutura mínima.
3. Orquestrador cria plano e tarefas por escopo.
4. Cada tarefa recebe contrato em formato de `templates/agent-task.md`.
5. Executor atua apenas no escopo autorizado.
6. Revisor de SPEC confere aderência ao contrato técnico.
7. Revisor técnico/segurança confere bugs, riscos e segredos.
8. Verificador roda gates e registra evidência.
9. PR fica aguardando aprovação humana.
10. Notion/repo são atualizados apenas após decisão humana.

Estados recomendados para SPEC:

```plain text
draft
ready-for-planning
planned
in-progress
verification
pending-human-approval
done
blocked
```

O agente pode conduzir até `pending-human-approval`. `done` exige aprovação humana.

## O agente pode
- Criar ou editar arquivos dentro do escopo autorizado.
- Sugerir ajustes fora do escopo sem implementá-los.
- Registrar riscos, dúvidas e limitações.
- Preparar PR para revisão.
- Criar contratos de execução para outros agentes.
- Recomendar executor/revisor com base em `agent-routing.yaml` ou matriz AI-OPS do Notion.

## O agente não pode
- Alterar produto sem autorização explícita.
- Alterar schema, Firebase, Firestore rules, CI crítica ou dependências sem autorização explícita.
- Alterar `.env*` ou credenciais.
- Criar task registry paralelo sem autorização.
- Criar pasta permanente de reports operacionais.
- Marcar tarefa como concluída sem revisão humana.
- Acionar outro agente sem contrato explícito.
- Fazer merge, push, deploy ou atualização de produção sem autorização.
- Usar LLM gratuito como árbitro final para decisão sensível.

## Roteamento de agentes

Use `ai-ops/agent-routing.yaml` como matriz versionada mínima.

Regra prática:

- Psiu/Notion: contexto, roteamento, memória e registro.
- OpenCode/DeepSeek: execução barata de baixo risco.
- OpenCode/MiniMax: contingência e segunda opinião barata.
- Cline/Roo-Cline: edição supervisionada no VSCode.
- Codex: revisão, segurança, integração, análise cruzada e mudanças sensíveis.
- GitHub Actions: prova automática de gates.
- Humano: aprovação final e decisões irreversíveis.

Quando houver risco médio ou alto, separe executor, revisor e verificador.

## Critérios de parada

Pare e peça decisão humana se:

- o escopo real exceder `allowed_paths`;
- a tarefa tocar arquivo protegido não autorizado;
- houver necessidade de credencial, token, billing ou deploy;
- surgir conflito entre Notion, repo, SPEC ou AGENTS;
- a solução exigir arquitetura, schema, pricing, frete, kit, checkout, pagamento, Rules, Storage ou Functions;
- dois agentes precisarem editar o mesmo arquivo;
- gates falharem por causa não compreendida;
- o executor tentar concluir sem evidência.

## Validação
Use o comando canônico:

```bash
bash scripts/verify.sh
```

Este padrão funciona mesmo quando o arquivo não está com permissão executável no checkout local. Se o arquivo estiver executável, `./scripts/verify.sh` também pode ser usado.

Se a validação não puder ser executada, registre no PR:
- motivo;
- validações alternativas feitas;
- risco residual.

Para SPECs novas/alteradas, rode também:

```bash
node scripts/validate-spec-metadata.mjs --changed
```

## PR
Todo PR deve explicar:
- o que foi feito;
- tarefa relacionada;
- arquivos alterados;
- validação executada;
- fora do escopo preservado;
- riscos e pontos de atenção;
- decisões pendentes.
