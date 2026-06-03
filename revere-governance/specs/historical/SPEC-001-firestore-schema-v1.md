SPEC — Firestore Schema v1 (Site Revere)

1. Contexto

O Site Revere precisa de um modelo de dados que permita:
Catálogo escalável (até ~50 pratos) com filtros/tags e conteúdo rico (nutrição + “porquê dos ingredientes”).
Produtos com variações de gramatura e preços distintos.
Kits: customizável (pode repetir prato) e kits prontos (sem alterações).
Checkout com frete fixo por bairro, frete grátis acima de X, agendamento (dia da semana + turno, lead time 5 dias).
Pagamento Mercado Pago (Pix + cartão), pedido só “confirmado” após confirmação.
Admin com autonomia (catálogo, banners, regras, frete, cupom etc.)
Preparar base para fidelidade (pontos por valor gasto).
Referências:
Fundacional — Revere (Notion)
Modelo de negócio — Revere (Notion)
Brand Book — Revere (Notion)
Cardápio de Lançamento — Revere (Notion)

2. Objetivo

Definir um schema Firestore mínimo, escalável e admin-first, com:
Coleções e documentos base
Campos e tipos
Índices necessários
Diretrizes de leitura/escrita (alto nível)
Regras “não-negociáveis” (preço/desconto/frete calculados com validação server-side)

3. Escopo

Inclui:
Coleções para catálogo, variações, kits, conteúdo do site, bairros/frete, cupons, usuários e pedidos.
Estrutura para agendamento e cálculo de descontos (dados, não lógica).
Campos para status de pagamento e integração de gateway.

Não inclui:

Implementação das regras do Firestore (firestore.rules) (será SPEC própria).
Implementação de Functions e endpoints (será SPEC própria).
Painel Admin (será SPEC própria).

4. Regras de negócio (impacto no schema)

Regra: preço/desconto/frete final é validado no backend
O frontend pode exibir estimativas, mas o valor final do pedido é calculado/validado via backend (Functions/endpoint).
O schema do pedido guarda:
valores calculados
insumos usados para cálculo (cupom, primeira compra, kit discount tier etc.)
rastreabilidade/auditoria (timestamps, ids de transação)

Regra: Kits com desconto progressivo por quantidade
7 → 5%
10 → 7%
15 → 10%
20 → 13%
20 → 15%

Regra: entrega e agenda
Cliente escolhe dia da semana + turno
Lead time: 5 dias
Entrega: apenas Blumenau
Frete: fixo por bairro (lista)
Regra: primeira compra
Desconto aplicado automaticamente na primeira compra (definido em config).
Checkout aceita cupom (influenciadoras) com regras.

5. UX / UI (impacto no schema)
   Cardápio precisa filtrar por tags/restrições/objetivos/linhas.
   Página de produto precisa renderizar:
   descrição curta + longa
   nutrição
   “porquê dos ingredientes”
   imagens
   variações de gramatura e preço
   Admin precisa editar quase tudo sem código:
   catálogo, banners, conteúdos home, regras, bairros, cupons etc.

6. Dados (Firestore)

Convenções gerais:

IDs: autoId do Firestore (exceto documentos “singleton” tipo config).
Campos de auditoria:
createdAt (Timestamp)
updatedAt (Timestamp)
archivedAt (Timestamp | null) quando fizer sentido
isActive (boolean) quando fizer sentido
“Soft delete” preferido (desativar/arquivar) ao invés de apagar.

6.1. Coleção: products

Representa o “prato/produto base” (sem preço por gramatura aqui; isso fica nas variantes).
Doc: products/{productId}
Campos:
slug (string, único) — ex: "strogonoff-saudavel"
name (string) — ex: "Strogonoff saudável de frango"
shortDescription (string)
longDescription (string)
whyIngredients (string) — texto do “porquê dos ingredientes”
nutrition (map)
servingSize (string) ex: "360g"
calories (number)
proteinG (number)
carbsG (number)
fatG (number)
ingredients (string) — lista completa (texto)
allergens (string[]) — ex: ["lactose"]
Observação: tabela completa pode evoluir; este é v1 mínimo.
images (array de map)
{ url: string, alt: string, order: number }
tags (string[]) — nomes ou ids (v1: nomes simples)
categories (map)
line (string) — "Leve" | "Padrão" | "Performance" (ou valores do admin)
objective (string[]) — ex: ["Equilíbrio", "Performance"]
restrictions (string[]) — ex: ["Sem lactose", "Low carb"]
isActive (boolean)
sortOrder (number) — para ordenação manual no cardápio
createdAt (Timestamp)
updatedAt (Timestamp)
Notas
Tags/categorias podem virar IDs relacionais no v2; no v1, strings facilitam.

6.2. Coleção: productVariants

Variações (gramatura) e preço por variação.
Doc: productVariants/{variantId}
Campos:
productId (string, ref lógica)
sku (string, opcional) — ex: "STROG-360"
label (string) — ex: "360g (Padrão)"
grams (number) — ex: 360
priceCents (number) — ex: 2890
compareAtPriceCents (number | null) — opcional
isActive (boolean)
createdAt (Timestamp)
updatedAt (Timestamp)
Index sugerido
productId + isActive (para listar variantes do produto)

6.3. Coleção: kitsPreset

Kits prontos (não editáveis).
Doc: kitsPreset/{kitId}
Campos:
slug (string, único)
name (string)
description (string)
items (array)
{ productId: string, variantId: string, quantity: number }
basePriceCents (number) — opcional (se quiser preço fixo)
isActive (boolean)
createdAt (Timestamp)
updatedAt (Timestamp)
Nota
Kit customizável não precisa de coleção própria: ele vira “um carrinho com regra de desconto”.

6.4. Coleção: coupons

Cupons para influenciadoras/campanhas.
Doc: coupons/{couponId}
Campos:
code (string, uppercase, único) — ex: "REVEREX10"
description (string)
type (string) — "percent" | "fixed_cents" | "free_shipping"
value (number) — percent (0–100) ou cents
minSubtotalCents (number | null)
maxDiscountCents (number | null)
startsAt (Timestamp | null)
endsAt (Timestamp | null)
usageLimitTotal (number | null)
usageLimitPerUser (number | null)
isActive (boolean)
createdAt (Timestamp)
updatedAt (Timestamp)

6.5. Coleção: neighborhoods
Bairros e taxa fixa de frete.
Doc: neighborhoods/{neighborhoodId}
Campos:
name (string, único) — ex: "Itoupava Seca"
feeCents (number) — ex: 1200
isActive (boolean)
sortOrder (number)
createdAt (Timestamp)
updatedAt (Timestamp)

6.6. Coleção: siteContent
Conteúdo editável do site (banners, seções home, etc.).  
Sugestão: usar documentos “singleton” por chave.
Doc: siteContent/home
Campos:
heroBanners (array)
{ title: string, subtitle: string, imageUrl: string, ctaText: string, ctaHref: string, isActive: boolean, order: number }
sections (array)
{ type: string, title: string, body: string, isActive: boolean, order: number }
updatedAt (Timestamp)
Doc: siteContent/legal
privacyPolicyMd (string)
termsMd (string)
updatedAt (Timestamp)

6.7. Coleção: config

Configurações do negócio (singleton docs).
Doc: config/commerce
Campos:
freeShippingThresholdCents (number | null)
firstPurchaseDiscount (map)
type (string) — "percent" | "fixed_cents" | "none"
value (number)
isActive (boolean)
kitDiscountTiers (array)
{ minQty: number, percent: number }
ex: [ {7,5}, {10,7}, {15,10}, {20,13}, {21,15} ]
updatedAt (Timestamp)
Doc: config/delivery
leadTimeDays (number) — inicial: 5
turnos (string[]) — ex: ["Manhã", "Tarde", "Noite"]
daysOfWeekEnabled (number[]) — ex: [1,2,3,4,5] (1=segunda)
updatedAt (Timestamp)

6.8. Coleção: users

Perfil complementar do usuário (Auth é no Firebase Auth; aqui é perfil e dados extras).
Doc: users/{uid}
Campos:
uid (string)
email (string)
displayName (string | null)
phone (string | null)
birthDate (string | null) — formato YYYY-MM-DD (mais simples que Timestamp p/ datas sem hora)
dietaryRestrictions (string[]) — ex: ["Sem lactose", "Sem glúten"]
createdAt (Timestamp)
updatedAt (Timestamp)
Subcoleção: users/{uid}/addresses/{addressId}
label (string) — ex: “Casa”, “Trabalho”
recipientName (string)
street (string)
number (string)
complement (string | null)
neighborhoodId (string)
city (string) — “Blumenau”
state (string) — “SC”
zip (string | null) — opcional
reference (string | null)
isDefault (boolean)
createdAt (Timestamp)
updatedAt (Timestamp)

6.9. Coleção: orders

Pedido é a entidade central do e-commerce.
Doc: orders/{orderId}
Campos:
orderNumber (number) — opcional (se quiser sequência; pode ser gerado no backend)
userId (string | null) — null se guest (mas você quer login, então tende a ser sempre set)
status (string) — "draft" | "pending_payment" | "paid" | "preparing" | "out_for_delivery" | "delivered" | "cancelled"
items (array)
{ productId: string, variantId: string, nameSnapshot: string, gramsSnapshot: number, unitPriceCents: number, quantity: number }
pricing (map)
subtotalCents (number)
discountCents (number)
shippingCents (number)
totalCents (number)
applied (map)
couponCode (string | null)
firstPurchaseDiscountApplied (boolean)
kitTierApplied (map | null)
minQty (number)
percent (number)
delivery (map)
addressSnapshot (map) — snapshot do endereço no momento do pedido
neighborhoodNameSnapshot (string)
slot (map)
dayOfWeek (number) — 1..7
turno (string)
date (string) — YYYY-MM-DD (data concreta escolhida)
payment (map)
provider (string) — "mercado_pago"
status (string) — "not_started" | "pending" | "approved" | "rejected" | "refunded" | "cancelled"
mp (map)
preferenceId (string | null)
paymentId (string | null)
merchantOrderId (string | null)
updatedAt (Timestamp | null)
notes (string | null)
createdAt (Timestamp)
updatedAt (Timestamp)
Índices sugeridos
userId + createdAt desc (histórico do cliente)
status + createdAt desc (painel admin)
payment.status + createdAt desc (monitoramento pagamento)

6.10. Coleção: adminUsers (opcional v1)

Se quiser separar papéis admin sem depender só de claims.
Doc: adminUsers/{uid}
uid (string)
role (string) — "owner" | "editor" | "viewer"
createdAt (Timestamp)
updatedAt (Timestamp)

7. Segurança / LGPD (diretrizes de schema)

users.birthDate e dietaryRestrictions são dados pessoais/sensíveis em contexto alimentar. Diretrizes:
coletar somente se necessário (você pediu, então ok)
nunca expor esses campos publicamente
acesso restrito ao próprio usuário e ao admin quando necessário
Endereço do usuário:
armazenar em subcoleção por usuário
gravar snapshot no pedido para rastreio (mesmo que usuário altere depois)

8. Critérios de aceitação (checklist)

Existem coleções e campos para catálogo, variantes, kits, cupons, bairros, config, usuários e pedidos

orders guarda snapshots necessários (nome/gramas/preço/endereço) para consistência histórica

Existe config/commerce com tiers de kit + frete grátis + primeira compra

Existe config/delivery com lead time e turnos

Índices sugeridos foram listados para as principais telas (admin e cliente)

Diretriz “preço final validado no backend” está explícita

9. Testes obrigatórios (para quando implementar)
   Unit:
   validação de schema (Zod/Valibot) para orders e coupons
   Integração:
   criação de order + cálculo final no backend
   E2E smoke:
   navegar catálogo → produto → carrinho → checkout (sem pagamento real)
