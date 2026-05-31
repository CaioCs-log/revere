# Project History — Site Revere

## Fonte de verdade (marca e negócio)
- Fundacional — Revere (Notion)
- Modelo de negócio — Revere (Notion)
- Brand Book — Revere (Notion)
- Cardápio de Lançamento — Revere (Notion)

## Decisões fixas (não-negociáveis)
- Stack: Next.js (storefront e admin) + Firebase (Auth + Functions) + Firestore + Cloud Run
- Repos separados: revere-storefront / revere-admin / revere-backend
- Repo meta: revere-governance (SPECs + features + histórico)
- Entrega: Blumenau, frete fixo por bairro (lista)
- Agendamento: dia da semana + turno, lead time 5 dias
- Pagamento: Mercado Pago (Pix + cartão), pagamento no checkout
- Produtos: variações por gramatura (um produto com variações)
- Kits: customizável (pode repetir prato) + kits prontos
- Desconto kit: 7=5%, 10=7%, 15=10%, 20=13%, >20=15%
- Desconto primeira compra: automático
- Cupom: campo no checkout
- Dados do cliente: data de nascimento + restrições alimentares
- Testes desde o dia 1

## Estado atual (atualize sempre que encerrar uma tarefa)
- Data: 2026-05-31
- Fase atual: FASE 1 (Governança)
- Em andamento: Preencher arquivos base do revere-governance
- Próximo passo: criar features.json + SPEC-TEMPLATE + checklists + roles
- Riscos/travas: nenhum

## Log
### 2026-05-31 — Bootstrap do revere-governance
- O que foi feito:
  - Git init local e commit inicial com estrutura de pastas/arquivos
- Próximo passo:
  - Preencher os templates e iniciar o features.json
