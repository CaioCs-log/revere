# PR Checklist — Site Revere

Antes de considerar um PR pronto:

## Funcional
- [ ] A feature segue exatamente a SPEC
- [ ] Não existe mudança não solicitada (scope creep)

## Qualidade
- [ ] ESLint OK
- [ ] Typecheck OK
- [ ] Tests OK
- [ ] Build OK

## UX
- [ ] Loading / Empty / Error states
- [ ] Mobile-first (390px) OK
- [ ] Tablet (768px) OK
- [ ] Desktop (1024px) OK

## Comércio (quando aplicável)
- [ ] Preço final e desconto são validados no backend
- [ ] Cupom e primeira compra têm regras claras e testadas
- [ ] Frete por bairro OK
- [ ] Lead time e agenda OK

## Segurança / LGPD
- [ ] Não gravar mais dados do que o necessário
- [ ] Nenhum dado sensível exposto no cliente
- [ ] Nenhum segredo commitado
