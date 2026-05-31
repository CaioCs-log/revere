# Definition of Done (DoD) — Site Revere

Uma tarefa/feature só pode ser marcada como **done** em `features.json` quando:

## 1) SPEC + Aceite
- [ ] Existe SPEC para a feature (em `specs/`)
- [ ] Todos os critérios de aceite da SPEC foram atendidos
- [ ] A implementação não criou escopo “extra” fora do que está na SPEC

## 2) Qualidade (gates)
- [ ] Lint (ESLint) sem erros
- [ ] Typecheck (TypeScript) sem erros
- [ ] Tests (unit) passando
- [ ] Build passando (Next build / Functions build)

## 3) UX / Responsividade
- [ ] Estados de loading/empty/error implementados
- [ ] Responsivo verificado em 390px, 768px, 1024px (mínimo)

## 4) Segurança / Dados
- [ ] Nenhuma chave/segredo em commit
- [ ] Regras críticas (preço, desconto, frete) validadas no backend quando aplicável
- [ ] Dados pessoais (ex.: data de nascimento) tratados com cuidado (mínimo necessário)

## 5) Evidências e histórico
- [ ] `features.json` atualizado (status + evidências)
- [ ] `PROJECT_HISTORY.md` atualizado (o que foi feito + como validar + pendências)
