# VIGENTE — Schema v2 (fonte de verdade). Substitui a SPEC-001 (Schema v1, removida).

# SPEC-003 — Firestore Schema v2 para o Site Revere

## Metadados

- **Arquivo:** `specs/SPEC-003-firestore-schema-v2.md`
- **Projeto:** Site Revere
- **Repo:** `revere-governance`
- **Tipo:** SPEC técnica/documental
- **Status:** Aprovada para versionamento
- **Data:** 2026-06-01
- **Responsável pela validação:** Caio Cesar Dos Santos
- **Escopo desta entrega:** documentação do schema Firestore v1
- **Não inclui:** implementação, regras Firestore, backend, Admin ou Storefront

---

## 2. Status

**Aprovada para versionamento.**

Esta SPEC foi validada por Caio e versionada em `revere-governance/specs/SPEC-003-firestore-schema-v2.md`.

A aprovação autoriza apenas o versionamento documental da SPEC no repo de governança. Não autoriza implementação de CRUD, backend, regras Firestore, Admin ou Storefront sem SPEC/tarefa própria.

---

## 3. Objetivo

Definir a primeira versão prática do schema Firestore para o Site Revere, cobrindo as coleções essenciais para operar o MVP da loja online da Revere com:

- catálogo de produtos;
- variações por gramatura;
- tags e categorias;
- kits prontos;
- cupons;
- bairros e frete;
- conteúdo dinâmico da Home e demais áreas editáveis do site;
- usuários/clientes;
- pedidos.

O objetivo principal é criar uma base de dados clara, segura e operacionalmente útil para que a Revere consiga evoluir sem depender de alteração de código para mudanças rotineiras de negócio, como produtos, preços, banners, comunicações, frete, bairros atendidos e conteúdo da Home.

---

## 4. Escopo

Esta SPEC cobre as seguintes coleções:

- `products`
- `productVariants`
- `tags`
- `categories`
- `kitPresets`
- `coupons`
- `neighborhoods`
- `siteContent`
- `users`
- `orders`

Também define:

- propósito de cada coleção;
- campos principais;
- relacionamentos;
- índices prováveis;
- regras de validação;
- impactos no Admin;
- impactos no Backend;
- impactos no Storefront;
- convenções de nomenclatura;
- cuidados de LGPD e dados sensíveis;
- estratégia documental para imagens e arquivos;
- auditoria e histórico de pedidos;
- critérios de aceite;
- decisões fechadas e pontos de detalhamento futuro.

---

## 5. Fora de escopo

Esta SPEC **não** cobre:

- implementação de código;
- criação de regras Firestore;
- criação de Cloud Functions;
- integração com Mercado Pago;
- webhooks de pagamento;
- upload real de imagens no Storage;
- cálculo final de pagamento;
- telas do Admin;
- telas do Storefront;
- autenticação;
- permissões detalhadas por role;
- sistema completo de pontos/fidelidade;
- blog completo;
- landing pages avançadas;
- relatórios financeiros;
- painel de produção/cozinha;
- integração fiscal;
- integração com logística externa.

A estrutura proposta deve deixar espaço para evolução futura, mas sem tentar resolver todos os módulos agora.

---

## 6. Decisões assumidas nesta versão

Estas decisões devem guiar a implementação futura:

1. **Não haverá controle de estoque no MVP; haverá controle manual de visibilidade.**
    - A Revere não controlará quantidade disponível por sistema neste primeiro momento.
    - O Admin precisa permitir ocultar manualmente produtos, variantes ou kits do cliente quando não houver estoque real, quando a produção pausar um item ou quando a venda for suspensa.
    - Um produto só deve aparecer no Storefront se estiver ativo e marcado como visível.
    - Uma variante só deve aparecer como comprável se estiver ativa e marcada como visível.
2. **Produtos inativos, arquivados ou sem condição de venda não devem aparecer.**
    - O Storefront deve exibir apenas produtos efetivamente compráveis.
3. **Preço exibido no card do produto deve usar a menor variante ativa e visível.**
    - Exemplo: “a partir de R$ X”.
    - A menor variante precisa estar ativa, visível e vinculada a um produto ativo.
4. **Filtros do catálogo MVP serão por categoria + tags públicas.**
    - Categoria será a navegação/filtro principal do catálogo.
    - Tags públicas serão usadas como filtros secundários, selos e apoios de decisão.
    - Restrições principais podem ser tratadas como tags do tipo `restriction`.
    - Destaques comerciais podem usar tags e campos como `isFeatured` e `isNew`.
    - Filtros por preço, gramatura e combinações avançadas ficam para fase posterior.
5. **A Home será dinâmica em modelo híbrido por blocos tipados.**
    - A Revere precisa inserir novas informações rapidamente.
    - A operação não pode ficar refém de alteração de código para trocar banners, chamadas, destaques, textos ou seções comerciais.
    - O Admin controla conteúdo, ordem, status, imagens, CTAs, vínculos e janela de publicação.
    - O código controla layout, renderização e identidade visual para manter consistência de marca.
    - A coleção `siteContent` deve suportar blocos tipados para Home, campanhas, avisos, entrega, checkout e destaques comerciais.
6. **Kits customizáveis entram no MVP.**
    - Kits serão um dos principais motores comerciais da Revere e devem favorecer tickets maiores.
    - O cliente deve conseguir montar o próprio kit com múltiplos pratos, respeitando regras mínimas de quantidade.
    - A personalização é parte da proposta da marca, especialmente para clientes com dietas acompanhadas por nutricionista ou necessidades alimentares individuais.
    - Kits prontos e sugeridos continuam possíveis, mas o MVP deve deixar evidente a possibilidade de personalização.
    - Regras de desconto progressivo podem ser aplicadas ao kit/carrinho conforme quantidade de itens, com validação final no Backend.

### 6.1. Convenções de nomenclatura e padronização

Para reduzir ambiguidade entre documentação, Admin, Backend e Storefront, esta SPEC assume as seguintes convenções:

- **Coleções:** nomes em inglês, preferencialmente no plural, como `products`, `productVariants`, `tags`, `categories`, `coupons`, `neighborhoods`, `siteContent`, `users` e `orders`.
- **Campos:** nomes em `camelCase`, como `createdAt`, `updatedAt`, `mainImageId`, `priceCents` e `deliveryFeeCents`.
- **Enums:** valores em `snake_case`, como `manual_unavailable`, `fixed_price`, `scheduled_delivery`, `pending_payment` e `ready_for_delivery`.
- **Slugs:** sempre em lowercase, sem acentos, sem espaços e com hífens. Exemplo: `frango-cremoso-com-pure-de-abobora`.
- **Preços e valores monetários:** sempre em centavos, usando sufixo `Cents`, como `priceCents`, `deliveryFeeCents`, `discountCents` e `totalCents`.
- **Timestamps:** usar nomes claros como `createdAt`, `updatedAt`, `publishedAt`, `startsAt`, `endsAt`, `paidAt`, `confirmedAt` e `cancelledAt`.
- **Relacionamentos:** campos que apontam para outro documento devem usar sufixo `Id`; listas de relacionamentos devem usar sufixo `Ids`, como `productId`, `variantId`, `categoryIds`, `tagIds`, `linkedProductIds` e `kitPresetIds`.
- **Código de cupom:** deve ser normalizado em uppercase, como `BEMVINDO10`.

Observação de naming: a coleção `kitPresets` foi aprovada por Caio como nome final antes do versionamento no repo.

### 6.2. LGPD e dados sensíveis

Esta SPEC envolve dados pessoais e operacionais que exigem cuidado de LGPD desde o desenho do schema.

Dados que exigem atenção no MVP:

- **Dados pessoais do cliente:** nome, e-mail, telefone e identificador de autenticação.
- **Endereço:** CEP, rua, número, complemento, bairro, cidade, estado e referência de entrega.
- **Telefone:** usado para contato operacional e suporte, devendo ter acesso restrito.
- **Data de nascimento:** deve ter finalidade clara antes de ser obrigatória.
- **Histórico de pedidos:** revela hábitos de consumo, frequência, ticket, endereço e preferências.
- **Dados de pagamento:** a Revere deve armazenar apenas referências necessárias do provedor, como `preferenceId`, `paymentId`, `externalReference`, status e datas. Dados sensíveis de cartão não devem ser armazenados no Firestore.
- **Observações do cliente e notas internas:** campos livres podem conter dados pessoais ou sensíveis e precisam de orientação de uso.

Dados sensíveis preparados para fase futura, mas **não coletados pela loja Revere no MVP**:

- **Restrições alimentares:** podem revelar informações sensíveis sobre saúde, alergias, intolerâncias ou preferências ligadas à condição pessoal do cliente.
- **Preferências alimentares sensíveis:** podem compor perfil do cliente e devem ser tratadas com cautela.

No MVP, restrições alimentares, dados de dieta individual e preferências sensíveis não entram no schema de `users`. Caso passem a ser coletados no futuro, devem ter fluxo próprio, consentimento explícito e validação técnica/jurídica.

Regras documentais:

- O cliente deve aceitar termos e política de privacidade, registrados em `termsAcceptedAt` e `privacyAcceptedAt`.
- Acesso a dados pessoais, endereços, pedidos e pagamento deve ser limitado por role e necessidade operacional.
- Dados públicos do Storefront devem ser separados de dados administrativos e pessoais.
- O Storefront público não deve expor dados de usuários, pedidos, notas internas, pagamento ou campos administrativos.
- O Admin deve exibir apenas o necessário para operação, suporte, entrega e auditoria.
- Qualquer uso futuro de restrições alimentares para recomendação, segmentação ou comunicação deve ser validado antes de implementação.

### 6.3. Imagens e arquivos

Esta SPEC prevê imagens no MVP, mas não depende de Firebase Storage neste primeiro momento.

Decisões documentais:

- No MVP, imagens serão tratadas como assets estáticos ou referências lógicas, sem depender de Firebase Storage.
- Produtos podem começar com placeholders visuais premium de marca enquanto fotos reais ainda não existirem.
- Banners, Home e kits podem usar imagens editoriais, institucionais, ilustrações ou imagens geradas por IA, desde que não induzam o cliente a acreditar que são fotos exatas dos pratos.
- Imagens realistas só devem ser usadas como foto do produto quando representarem o produto real.
- Quando a produção iniciar e as fotos reais forem captadas, elas substituirão gradualmente os placeholders.
- Firebase Storage continua preparado para próxima versão, quando billing/Blaze e estratégia de arquivos forem destravados.
- Não haverá biblioteca de mídia complexa no MVP.
- `imageIds`, `mainImageId` e `imageId` são referências lógicas a imagens ou arquivos.
- `imageAlt` e `mainImageAlt` devem apoiar acessibilidade e clareza editorial.
- `imageMode` deve indicar o tipo de imagem usada: `real_photo`, `brand_placeholder`, `editorial` ou `illustration`.
- A versão mínima do site deve rodar e captar valor enquanto a evolução para o site ideal segue em paralelo.

---

## 7. Coleções

### 7.1. `products`

Representa o produto base vendido pela Revere.

Exemplos:

- Frango cremoso com purê de abóbora
- Escondidinho funcional
- Bowl proteico
- Sopa low carb

O produto contém informações comerciais, editoriais, nutricionais simplificadas e de organização. O preço final não fica diretamente no produto; ele fica nas variantes.

**Tipo de documento:** produto base.

**ID recomendado:** ID automático do Firestore.

**Campo público recomendado:** `slug`.

### 7.2. `productVariants`

Representa as variações comerciais de um produto, principalmente por gramatura, porção ou formato.

Exemplos:

- 300g
- 360g
- 410g
- Porção família

A variante concentra preço, gramatura e visibilidade comercial.

**Tipo de documento:** variante de produto.

**ID recomendado:** ID automático do Firestore.

### 7.3. `tags`

Representa marcações flexíveis para filtros, comunicação, selos e organização.

Exemplos:

- Proteico
- Low carb
- Sem glúten
- Sem lactose
- Vegetariano
- Mais vendido
- Novo

Tags são mais flexíveis que categorias e podem ser combinadas em múltiplos produtos.

**Tipo de documento:** tag.

**ID recomendado:** ID automático do Firestore.

### 7.4. `categories`

Representa agrupamentos principais do catálogo.

Exemplos:

- Pratos
- Sopas
- Kits
- Linha leve
- Linha performance
- Linha família

Categorias ajudam na navegação principal, organização do cardápio e estrutura editorial.

**Tipo de documento:** categoria.

**ID recomendado:** ID automático do Firestore.

### 7.5. `kitPresets`

Representa kits prontos configuráveis pelo Admin.

Exemplos:

- Kit Semana Leve — 7 refeições
- Kit Performance — 10 refeições
- Kit Família — 15 refeições
- Kit Low Carb — 7 refeições

O kit preset é uma composição comercial sugerida. Ele pode conter produtos/variantes pré-selecionados e regras próprias de preço ou desconto.

**Tipo de documento:** kit pronto.

**ID recomendado:** ID automático do Firestore.

### 7.6. `coupons`

Representa cupons promocionais aplicáveis no checkout.

Exemplos:

- `BEMVINDO10`
- `REVERE15`
- `FRETEGRATIS`
- `PRIMEIRACOMPRA`

O cupom deve ser sempre validado no Backend antes de afetar o preço final do pedido.

**Tipo de documento:** cupom.

**ID recomendado:** ID automático do Firestore.

**Campo único recomendado:** `code`.

### 7.7. `neighborhoods`

Representa bairros atendidos em Blumenau e suas regras de frete.

Exemplos:

- Centro
- Velha
- Garcia
- Itoupava Norte
- Escola Agrícola

A coleção permite ao Admin controlar onde a Revere entrega, taxa fixa por bairro, disponibilidade, dias e turnos.

**Tipo de documento:** bairro atendido.

**ID recomendado:** ID automático do Firestore.

### 7.8. `siteContent`

Representa conteúdos editáveis do site.

Esta coleção é estratégica porque a Home precisa ser dinâmica e prática. A Revere deve conseguir publicar novas informações sem depender de alteração no código.

Exemplos de conteúdo:

- banner principal da Home;
- chamadas comerciais;
- seções de destaque;
- cards institucionais;
- avisos operacionais;
- informações de entrega;
- texto do checkout;
- campanhas sazonais;
- blocos “Como funciona”;
- destaques de produtos, kits ou categorias.

**Tipo de documento:** conteúdo editável do site.

**ID recomendado:** chave semântica controlada ou ID automático com campo `key`.

Exemplos de `key`:

- `homeHero`
- `homeHighlights`
- `homeHowItWorks`
- `deliveryInfo`
- `checkoutNotice`
- `campaignBanner`

### 7.9. `users`

Representa usuários/clientes autenticados.

A coleção armazena dados mínimos de perfil, preferências, endereços e informações úteis para compra recorrente.

**Tipo de documento:** usuário/cliente.

**ID recomendado:** UID do Firebase Auth.

### 7.10. `orders`

Representa pedidos feitos pelo cliente.

O pedido deve armazenar snapshot de itens, preços, frete, cupom, cliente e entrega no momento da compra. Ele não pode depender apenas dos dados atuais do catálogo, porque produtos, preços, nomes e regras podem mudar depois.

**Tipo de documento:** pedido.

**ID recomendado:** ID automático do Firestore.

---

## 8. Campos principais por coleção

### 8.1. `products`

```tsx
{
  name: string
  slug: string
  shortDescription: string
  description: string
  status: "draft" | "active" | "inactive" | "archived"
  isVisible: boolean

  productType: "frozen_meal" | "frozen_snack" | "other"

  categoryIds: string[]
  tagIds: string[]

  imageIds: string[]
  mainImageId: string | null
  mainImageAlt: string | null
  imageMode: "real_photo" | "brand_placeholder" | "editorial" | "illustration"

  ingredients: string[]
  allergens: string[]
  nutritionalHighlights: string[]

  storageInstructions: string
  consumptionInstructions: string

  isFeatured: boolean
  isNew: boolean
  sortOrder: number

  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  updatedBy: string
}
```

**Regras práticas:**

- Produto ativo só pode aparecer no Storefront se `isVisible = true` e se tiver ao menos uma variante ativa e visível.
- Produto com `isVisible = false` não deve aparecer no catálogo público.
- Produto `inactive`, `archived` ou `draft` não deve aparecer no Storefront.
- Produto fora de estoque real deve ser ocultado manualmente pelo Admin.
- O preço exibido no card deve ser calculado a partir da menor variante ativa e visível.
- Informações nutricionais detalhadas podem evoluir para estrutura própria no futuro.

### 8.2. `productVariants`

```tsx
{
  productId: string

  name: string
  sku: string
  status: "draft" | "active" | "inactive" | "archived"

  portionLabel: string
  weightGrams: number

  priceCents: number
  compareAtPriceCents: number | null

  isVisible: boolean

  minQuantity: number
  maxQuantity: number | null

  isDefault: boolean
  sortOrder: number

  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  updatedBy: string
}
```

**Regras práticas:**

- Variante ativa precisa pertencer a produto existente.
- Variante só aparece como comprável se estiver ativa e `isVisible = true`.
- Variante com `isVisible = false` deve ficar invisível para o cliente.
- Não haverá controle de quantidade/estoque no MVP.
- Quando um prato ou gramatura não puder ser vendido, o Admin deve ocultar manualmente a variante ou o produto.
- O preço deve ser salvo em centavos.
- O Backend deve recalcular preço final; o frontend não é fonte confiável.

### 8.3. `tags`

```tsx
{
  name: string
  slug: string
  status: "active" | "inactive"

  type: "nutrition" | "restriction" | "commercial" | "preference" | "operational"

  description: string | null
  color: string | null

  showInFilters: boolean
  showInProductCard: boolean

  sortOrder: number

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Regras práticas:**

- No MVP, tags públicas serão usadas como filtros secundários e selos no card do produto.
- Tags do tipo `restriction` podem representar restrições principais como apoio de navegação, sem coletar restrições individuais do cliente.
- Tags inativas não devem aparecer publicamente.
- Tags podem ser usadas como selos no card do produto.

### 8.4. `categories`

```tsx
{
  name: string
  slug: string
  status: "active" | "inactive"

  description: string | null
  parentCategoryId: string | null

  imageId: string | null

  showInMenu: boolean
  showInHome: boolean

  sortOrder: number

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Regras práticas:**

- Categorias ajudam a organizar o catálogo.
- Para o MVP, a estrutura pode começar simples, sem hierarquia.
- `parentCategoryId` fica preparado para evolução.
- Categorias inativas não devem aparecer no menu público.

### 8.5. `kitPresets`

```tsx
{
  name: string
  slug: string
  status: "draft" | "active" | "inactive" | "archived"

  shortDescription: string
  description: string

  imageId: string | null
  imageAlt: string | null
  imageMode: "real_photo" | "brand_placeholder" | "editorial" | "illustration"

  kitType: "fixed" | "suggested" | "customizable"

  eligibleProductTypes: Array<"frozen_meal" | "frozen_snack" | "other">
  allowRepeatedItems: boolean

  items: Array<{
    productId: string
    variantId: string
    quantity: number
  }>

  minItems: number
  maxItems: number | null

  pricingMode: "sum_items" | "fixed_price"
  fixedPriceCents: number | null

  discountTiers: Array<{
    minItems: number
    maxItems: number | null
    discountPercent: number
  }>

  grantsFreeShipping: boolean

  isFeatured: boolean
  sortOrder: number

  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  updatedBy: string
}
```

**Regras práticas:**

- Kit ativo deve conter apenas produtos e variantes ativos e visíveis.
- Kit com item inativo ou invisível não deve aparecer como comprável, salvo regra futura.
- No MVP, kits `fixed`, `suggested` e `customizable` são permitidos.
- Kits customizáveis entram no MVP porque a personalização é parte central da proposta comercial e nutricional da Revere.
- Kit customizável inicial começa com mínimo de 7 unidades.
- O cliente pode comprar quantidades acima do mínimo, montar livremente e repetir pratos.
- Desconto progressivo inicial:
    - 5% para 7 a 9 pratos;
    - 8% para 10 a 14 pratos;
    - 10% para 15 ou mais pratos.
- Para o MVP, entram nos kits customizáveis com desconto progressivo apenas produtos do tipo `frozen_meal`, especialmente refeições de 300g, 360g, 410g e futuras gramaturas equivalentes.
- Produtos futuros como snacks congelados ficam fora dos kits customizáveis com desconto progressivo até nova decisão.
- O Backend deve validar quantidade mínima, quantidade máxima, repetição de itens, tipo de produto permitido, visibilidade dos itens, preço final e regras de desconto.
- A comunicação do Storefront deve deixar clara a oportunidade de personalização do kit.

### 8.6. `coupons`

```tsx
{
  code: string
  status: "draft" | "active" | "inactive" | "expired" | "archived"

  description: string | null

  discountType: "percentage" | "fixed_amount" | "free_shipping"
  discountPercent: number | null
  discountAmountCents: number | null

  appliesTo: {
    productIds: string[]
    categoryIds: string[]
    kitPresetIds: string[]
    firstPurchaseOnly: boolean
  }

  minimumSubtotalCents: number | null
  maximumDiscountCents: number | null

  usageLimitTotal: number | null
  usageLimitPerUser: number | null
  usageCount: number

  startsAt: Timestamp | null
  endsAt: Timestamp | null

  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  updatedBy: string
}
```

**Regras práticas:**

- Cupom deve ser validado no Backend.
- Cupom não deve ser aplicado apenas pelo Storefront.
- `usageCount` pode exigir transação para evitar inconsistência.
- Código deve ser normalizado em uppercase.

### 8.7. `neighborhoods`

```tsx
{
  name: string
  slug: string
  city: string
  state: string

  status: "active" | "inactive"

  deliveryFeeCents: number
  freeShippingMinimumCents: number | null

  deliveryDays: Array<
    "monday" |
    "tuesday" |
    "wednesday" |
    "thursday" |
    "friday" |
    "saturday" |
    "sunday"
  >

  deliveryWindows: Array<{
    label: string
    startTime: string
    endTime: string
    active: boolean
  }>

  minimumLeadTimeDays: number

  sortOrder: number

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Exemplo de `deliveryWindows`:**

```tsx
[
  {
    label: "Manhã",
    startTime: "08:00",
    endTime: "12:00",
    active: true
  },
  {
    label: "Tarde",
    startTime: "13:00",
    endTime: "18:00",
    active: true
  }
]
```

**Regras práticas:**

- Para o MVP, `city = "Blumenau"` e `state = "SC"`.
- O lead time mínimo atual é de 5 dias.
- Bairro inativo não deve aparecer no checkout.
- O Admin deve conseguir alterar o valor mínimo para frete grátis.
- Regra inicial: pedidos acima de R$ 199,00 têm frete grátis, representado como `freeShippingMinimumCents = 19900`.
- Kits prontos ou campanhas específicas também poderão conceder frete grátis por regra promocional própria.
- O Backend deve validar bairro, frete, data, turno, subtotal mínimo e promoções de frete grátis.

### 8.8. `siteContent`

```tsx
{
  key: string
  status: "draft" | "published" | "inactive" | "archived"

  type:
    | "home_hero"
    | "home_how_it_works"
    | "home_product_highlight"
    | "home_kit_highlight"
    | "home_category_highlight"
    | "campaign_banner"
    | "notice"
    | "delivery_info"
    | "checkout_notice"
    | "final_cta"
    | "faq_preview"
    | "social_proof"
    | "generic"

  title: string | null
  subtitle: string | null
  body: string | null

  imageId: string | null
  imageAlt: string | null
  imageMode: "real_photo" | "brand_placeholder" | "editorial" | "illustration"
  ctaLabel: string | null
  ctaHref: string | null

  linkedProductIds: string[]
  linkedCategoryIds: string[]
  linkedKitPresetIds: string[]

  displayRules: {
    startsAt: Timestamp | null
    endsAt: Timestamp | null
    priority: number
    showOnHome: boolean
    showOnCheckout: boolean
    showOnCatalog: boolean
  }

  metadata: Record<string, unknown>

  publishedAt: Timestamp | null

  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  updatedBy: string
}
```

**Regras práticas:**

- A Home deve seguir modelo híbrido por blocos tipados.
- O Admin deve permitir alterar banners, seções, campanhas, chamadas, imagens, CTAs, produtos, categorias, kits, ordem, status e janela de publicação sem mexer no código.
- O layout visual e a identidade de marca continuam controlados pelo código.
- Blocos essenciais da v1: `home_hero`, `home_how_it_works`, `home_product_highlight`, `home_kit_highlight`, `delivery_info` e `final_cta`.
- Blocos opcionais preparados na v1: `campaign_banner`, `notice`, `home_category_highlight`, `faq_preview`, `social_proof`, `checkout_notice` e `generic`.
- Conteúdo `draft`, `inactive` ou `archived` não deve aparecer publicamente.
- Conteúdo publicado pode ter janela de exibição por data.
- `priority` permite ordenar blocos da Home.
- `linkedProductIds`, `linkedCategoryIds` e `linkedKitPresetIds` permitem criar seções dinâmicas sem código.
- O Storefront deve ter fallback para não quebrar caso algum conteúdo esteja incompleto.

### 8.9. `users`

```tsx
{
  authUid: string

  name: string
  email: string
  phone: string | null

  birthDate: string | null

  pointsBalance: number
  referralCode: string | null
  referredBy: string | null

  defaultAddressId: string | null

  addresses: Array<{
    id: string
    label: string
    recipientName: string
    phone: string
    zipCode: string
    street: string
    number: string
    complement: string | null
    neighborhoodId: string
    neighborhoodName: string
    city: string
    state: string
    reference: string | null
    active: boolean
  }>

  marketingOptIn: boolean
  termsAcceptedAt: Timestamp | null
  privacyAcceptedAt: Timestamp | null

  role: "customer" | "admin" | "owner"

  status: "active" | "inactive" | "blocked"

  createdAt: Timestamp
  updatedAt: Timestamp
  lastLoginAt: Timestamp | null
}
```

**Regras práticas:**

- ID do documento deve ser o UID do Firebase Auth.
- Cliente não deve conseguir alterar `role`.
- No MVP, a Revere coletará apenas dados necessários para conta, compra, entrega e relacionamento: nome, e-mail, telefone, data de aniversário, endereços, histórico de compras, pontos e indicação.
- Cupons do cliente devem ser tratados como benefício aplicado, relação derivada ou regra validada pela coleção `coupons`, não como dado sensível armazenado diretamente no perfil do usuário no MVP.
- CPF, RG e documentos equivalentes ficam fora do MVP.
- Restrições alimentares e preferências sensíveis não serão coletadas diretamente pela Revere no MVP.
- Atendimentos nutricionais personalizados pertencem à frente de Nutrição do Grupo, fora do escopo transacional da loja Revere.
- Para o MVP, endereços embutidos no usuário reduzem complexidade.

### 8.10. `orders`

```tsx
{
  orderNumber: string

  userId: string | null
  customer: {
    name: string
    email: string
    phone: string
  }

  status:
    | "pending_payment"
    | "confirmed"
    | "in_production"
    | "ready_for_delivery"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "refunded"

  payment: {
    provider: "mercado_pago"
    method: "pix" | "credit_card" | "unknown"
    status: "pending" | "approved" | "rejected" | "cancelled" | "refunded"
    preferenceId: string | null
    paymentId: string | null
    externalReference: string | null
    paidAt: Timestamp | null
  }

  items: Array<{
    type: "product_variant" | "kit_preset"
    productId: string | null
    variantId: string | null
    kitPresetId: string | null
    name: string
    variantName: string | null
    quantity: number
    unitPriceCents: number
    subtotalCents: number
    imageId: string | null
  }>

  coupon: {
    code: string | null
    discountType: "percentage" | "fixed_amount" | "free_shipping" | null
    discountCents: number
  }

  pricing: {
    itemsSubtotalCents: number
    discountCents: number
    deliveryFeeCents: number
    totalCents: number
  }

  delivery: {
    type: "scheduled_delivery"
    neighborhoodId: string
    neighborhoodName: string
    address: {
      zipCode: string
      street: string
      number: string
      complement: string | null
      city: string
      state: string
      reference: string | null
    }
    scheduledDate: string
    scheduledWindow: {
      label: string
      startTime: string
      endTime: string
    }
    minimumLeadTimeDaysApplied: number
  }

  notes: {
    customerNote: string | null
    internalNote: string | null
  }

  statusHistory: Array<{
    from: string | null
    to: string
    changedAt: Timestamp
    changedBy: string | null
    reason: string | null
  }>

  audit: {
    createdBy: string | null
    updatedBy: string | null
    cancelledBy: string | null
    cancellationReason: string | null
  }

  createdAt: Timestamp
  updatedAt: Timestamp
  confirmedAt: Timestamp | null
  cancelledAt: Timestamp | null
}
```

**Regras práticas:**

- Pedido deve guardar snapshot de produto, variante, preço, cliente, endereço, frete e cupom.
- Mudanças futuras no catálogo não devem alterar pedidos antigos.
- Pedido nasce como `pending_payment` quando o cliente inicia checkout/pagamento.
- Após pagamento aprovado por webhook do Mercado Pago, o pedido entra automaticamente como `confirmed`, pronto para produção.
- O frontend nunca deve marcar pedido como pago ou confirmado.
- O Admin tem autonomia para alterar status e corrigir exceções operacionais, sempre com registro em `statusHistory` e auditoria.
- Cancelamento pelo cliente fica fora do MVP; solicitações devem passar pelos canais de atendimento.
- Cancelamento deve registrar motivo, responsável e data.
- `statusHistory` fica na v1 como array simples embutido no pedido, garantindo rastreabilidade mínima.
- O número amigável do pedido deve seguir o formato `REV-2026-000001`.

---

## 9. Relacionamentos

### 9.1. Produto e variantes

- `products/{productId}`
- `productVariants/{variantId}.productId`

Regras:

- Um produto pode ter várias variantes.
- Uma variante pertence a um único produto.
- Produto sem variante ativa e visível não deve aparecer no Storefront.

### 9.2. Produto, categorias e tags

- `products.categoryIds[]` aponta para `categories`.
- `products.tagIds[]` aponta para `tags`.

Regras:

- Produto pode ter múltiplas tags.
- Produto pode ter uma ou mais categorias.
- Tags e categorias inativas não devem aparecer como filtros públicos.

### 9.3. Kits e produtos/variantes

- `kitPresets.items[].productId` aponta para `products`.
- `kitPresets.items[].variantId` aponta para `productVariants`.

Regras:

- Kit pode conter múltiplos produtos/variantes.
- Backend deve validar se todos os itens estão ativos e visíveis.
- Kit com item inativo ou invisível não deve aparecer como comprável, salvo regra futura.

### 9.4. Cupons e escopo de aplicação

- `coupons.appliesTo.productIds[]` aponta para `products`.
- `coupons.appliesTo.categoryIds[]` aponta para `categories`.
- `coupons.appliesTo.kitPresetIds[]` aponta para `kitPresets`.

Regras:

- Cupom sem restrições pode aplicar no carrinho inteiro.
- Cupom com restrição deve ser validado item a item no Backend.

### 9.5. Usuários e pedidos

- `orders.userId` aponta para `users/{authUid}` quando o cliente estiver autenticado.

Regras:

- Um usuário pode ter vários pedidos.
- Pedido mantém snapshot do cliente mesmo se o perfil mudar.

### 9.6. Pedidos e bairros

- `orders.delivery.neighborhoodId` aponta para `neighborhoods`.
- `orders.delivery.neighborhoodName` mantém snapshot.

Regras:

- Backend deve validar bairro ativo antes de criar pedido.
- Pedido mantém snapshot do bairro e frete aplicado.

### 9.7. Conteúdo do site

- `siteContent` é lido pelo Storefront conforme `status`, `type`, `key` e `displayRules`.

Regras:

- Apenas conteúdo publicado deve aparecer publicamente.
- Conteúdo pode ser ordenado por prioridade.
- Conteúdo pode ter janela de exibição por data.
- Home deve ser montada a partir de blocos editáveis sempre que possível.

---

## 10. Índices prováveis

Os índices abaixo devem ser confirmados durante a implementação conforme as queries reais.

### 10.1. `products`

```
products:
- status ASC, sortOrder ASC
- status ASC, isFeatured DESC, sortOrder ASC
- status ASC, slug ASC
```

Possíveis queries:

- listar produtos ativos;
- listar produtos em destaque;
- buscar produto por slug;
- ordenar catálogo.

### 10.2. `productVariants`

```
productVariants:
- productId ASC, status ASC, sortOrder ASC
- productId ASC, status ASC, priceCents ASC
- sku ASC
- status ASC, updatedAt DESC
```

Possíveis queries:

- listar variantes ativas de um produto;
- encontrar menor variante ativa disponível;
- buscar variante por SKU;
- listar variantes no Admin.

### 10.3. `tags`

```
tags:
- status ASC, sortOrder ASC
- status ASC, type ASC, sortOrder ASC
- slug ASC
```

Possíveis queries:

- listar tags ativas;
- listar tags por tipo;
- buscar tag por slug.

### 10.4. `categories`

```
categories:
- status ASC, sortOrder ASC
- status ASC, showInMenu ASC, sortOrder ASC
- status ASC, showInHome ASC, sortOrder ASC
- slug ASC
```

Possíveis queries:

- listar categorias ativas;
- montar menu;
- montar blocos da Home;
- buscar categoria por slug.

### 10.5. `kitPresets`

```
kitPresets:
- status ASC, sortOrder ASC
- status ASC, isFeatured DESC, sortOrder ASC
- status ASC, slug ASC
```

Possíveis queries:

- listar kits ativos;
- listar kits em destaque;
- buscar kit por slug.

### 10.6. `coupons`

```
coupons:
- code ASC
- status ASC, updatedAt DESC
- status ASC, startsAt ASC, endsAt ASC
```

Possíveis queries:

- validar cupom por código;
- listar cupons no Admin;
- filtrar cupons por status e validade.

### 10.7. `neighborhoods`

```
neighborhoods:
- status ASC, sortOrder ASC
- city ASC, status ASC, sortOrder ASC
- slug ASC
```

Possíveis queries:

- listar bairros ativos no checkout;
- buscar bairro por slug;
- listar bairros no Admin.

### 10.8. `siteContent`

```
siteContent:
- key ASC
- status ASC, type ASC
- status ASC, type ASC, displayRules.priority ASC
- status ASC, publishedAt DESC
```

Possíveis queries:

- buscar conteúdo por chave;
- montar seções dinâmicas da Home;
- listar banners publicados;
- listar avisos ativos.

### 10.9. `users`

```
users:
- email ASC
- status ASC, createdAt DESC
```

Possíveis queries:

- buscar usuário por e-mail;
- listar usuários por status;
- ver clientes recentes.

### 10.10. `orders`

```
orders:
- createdAt DESC
- status ASC, createdAt DESC
- userId ASC, createdAt DESC
- delivery.scheduledDate ASC, status ASC
- orderNumber ASC
- payment.status ASC, createdAt DESC
```

Possíveis queries:

- listar pedidos recentes;
- filtrar por status;
- listar pedidos de um cliente;
- listar pedidos por data de entrega;
- buscar pedido por número.

---

## 11. Regras de validação

### 11.1. Regras gerais

- `createdAt` deve ser definido na criação.
- `updatedAt` deve ser atualizado em alterações.
- Campos obrigatórios não devem ser salvos vazios.
- Campos monetários devem ser inteiros em centavos.
- Slugs devem ser lowercase, sem acentos, sem espaços e com hífens.
- Status deve ser controlado por enum.
- Dados publicados no Storefront devem passar por validação mais restrita que rascunhos.

### 11.2. `products`

- `name` obrigatório.
- `slug` obrigatório e único.
- Produto ativo deve ter descrição curta.
- Produto ativo deve ter descrição completa.
- Produto ativo deve ter pelo menos uma categoria.
- Produto só deve aparecer publicamente se estiver ativo, visível e tiver pelo menos uma variante ativa e visível.
- Produto com `isVisible = false` não deve aparecer.
- Produto `draft`, `inactive` ou `archived` não deve aparecer.

### 11.3. `productVariants`

- `productId` obrigatório.
- `sku` obrigatório e único.
- `weightGrams` deve ser maior que 0.
- `priceCents` deve ser maior que 0.
- `compareAtPriceCents`, quando informado, deve ser maior que `priceCents`.
- `isVisible` deve controlar se a variante aparece ou não para o cliente.
- Variante com `isVisible = false` não deve aparecer como comprável.
- Não haverá validação de quantidade/estoque no MVP.

### 11.4. `tags`

- `name` obrigatório.
- `slug` obrigatório e único.
- `type` obrigatório.
- Tag inativa não deve aparecer publicamente.

### 11.5. `categories`

- `name` obrigatório.
- `slug` obrigatório e único.
- Categoria inativa não deve aparecer no menu público.
- `parentCategoryId`, quando informado, deve apontar para categoria existente.

### 11.6. `kitPresets`

- Kit ativo precisa de nome, slug e descrição.
- Kit ativo precisa de pelo menos um item quando for `fixed` ou `suggested`.
- Kit `customizable` precisa ter regras claras de quantidade mínima e máxima.
- Cada item pré-definido deve ter `productId`, `variantId` e `quantity`.
- `quantity` deve ser maior que 0.
- Kit ativo só pode conter itens ativos e visíveis.
- Se `pricingMode = fixed_price`, `fixedPriceCents` deve ser maior que 0.
- Se `pricingMode = sum_items`, o Backend deve recalcular o preço.
- Kit customizável deve ter preço e desconto validados no Backend, nunca apenas no Storefront.

### 11.7. `coupons`

- `code` obrigatório, único e uppercase.
- `discountType` obrigatório.
- Percentual deve ser maior que 0 e menor ou igual a 100.
- Valor fixo deve ser maior que 0.
- Cupom expirado, inativo ou arquivado não deve ser aplicado.
- Cupom deve ser validado no Backend.

### 11.8. `neighborhoods`

- `name` obrigatório.
- `city` obrigatório.
- `state` obrigatório.
- Para o MVP, cidade deve ser Blumenau.
- Para o MVP, UF deve ser SC.
- `deliveryFeeCents` deve ser maior ou igual a 0.
- Bairro ativo precisa de pelo menos um dia e um turno ativo.
- Lead time mínimo atual deve ser 5 dias, salvo decisão futura.

### 11.9. `siteContent`

- `key` obrigatório.
- `type` obrigatório.
- Conteúdo publicado precisa ter campos mínimos conforme o tipo.
- Conteúdo com CTA precisa ter `ctaLabel` e `ctaHref`.
- Conteúdo fora da janela de exibição não deve aparecer publicamente.
- Conteúdo `draft`, `inactive` ou `archived` não deve aparecer publicamente.

### 11.10. `users`

- ID do documento deve ser igual ao UID do Firebase Auth.
- `authUid` deve ser igual ao ID do documento.
- `email` obrigatório.
- `role` não pode ser alterado pelo cliente.
- Endereço usado em pedido deve apontar para bairro ativo.

### 11.11. `orders`

- Pedido deve ter pelo menos 1 item.
- Cada item deve ter quantidade maior que 0.
- Cada item deve ter preço unitário em centavos.
- Subtotal do item deve ser `quantity * unitPriceCents`.
- Total deve ser calculado pelo Backend.
- Data de entrega deve respeitar lead time.
- Turno deve estar ativo para o bairro.
- Pedido não deve ser marcado como pago pelo frontend.
- Confirmação de pagamento deve vir de webhook validado do Mercado Pago.
- Cancelamento deve registrar motivo e responsável.
- Transições críticas de status devem preservar rastreabilidade mínima.

---

## 12. Impactos no Admin

O Admin precisará permitir operação prática das principais entidades.

### 12.1. Produtos e variantes

O Admin deverá permitir:

- criar e editar produtos;
- ativar, inativar e arquivar produtos;
- gerenciar categorias e tags associadas;
- gerenciar ingredientes, alergênicos e destaques;
- criar e editar variantes;
- definir preço por variante;
- controlar visibilidade/disponibilidade manual;
- definir variante padrão;
- visualizar se o produto está apto ou não para aparecer no Storefront.

Alertas necessários:

- produto ativo sem variante ativa;
- produto ativo oculto ou sem variante visível;
- produto ativo sem categoria;
- variante sem preço;
- variante sem gramatura.

### 12.2. Kits

O Admin deverá permitir:

- criar kits prontos;
- criar kits sugeridos;
- criar kits customizáveis;
- selecionar produtos/variantes permitidos;
- definir quantidade mínima e máxima;
- definir se o cliente pode repetir pratos;
- escolher tipo de kit;
- configurar preço fixo ou soma dos itens;
- configurar regras de desconto progressivo quando aplicável;
- ativar/inativar.

### 12.3. Cupons

O Admin deverá permitir:

- criar cupom;
- configurar tipo de desconto;
- configurar validade;
- configurar limites;
- restringir por produto, categoria ou kit;
- ativar/inativar.

### 12.4. Bairros e frete

O Admin deverá permitir:

- cadastrar bairros;
- configurar taxa fixa;
- configurar frete grátis por subtotal;
- alterar o valor mínimo para frete grátis;
- aplicar frete grátis em kits prontos ou campanhas específicas;
- configurar dias de entrega;
- configurar turnos;
- configurar lead time.

### 12.5. Conteúdo dinâmico do site

O Admin deverá permitir:

- editar hero da Home;
- criar banners de campanha;
- editar seções de destaque;
- selecionar produtos, categorias ou kits para destaque;
- publicar/despublicar blocos;
- ordenar seções;
- programar exibição por data;
- editar avisos de checkout e entrega.

Esta área é crítica para evitar dependência de código em mudanças comerciais e de comunicação.

### 12.6. Pedidos

O Admin deverá permitir:

- listar pedidos;
- filtrar por status;
- filtrar por data de entrega;
- visualizar detalhes;
- acompanhar pagamento;
- alterar qualquer status quando necessário;
- corrigir exceções operacionais;
- adicionar observação interna;
- cancelar pedido com motivo.

Para o MVP, o Admin terá autonomia total sobre a gestão operacional do pedido. Ainda assim, alterações sensíveis devem ficar registradas em `statusHistory` e nos campos de auditoria para preservar rastreabilidade.

O pagamento aprovado continua vindo preferencialmente do webhook/Backend, mas o Admin pode corrigir casos excepcionais com responsabilidade operacional.

---

## 13. Impactos no Backend

O Backend deverá proteger as regras críticas.

### 13.1. Preço

O Backend deverá:

- recalcular preço dos itens;
- buscar variantes ativas;
- ignorar variantes indisponíveis;
- validar se produto/variante está ativo e visível;
- aplicar cupom;
- calcular desconto progressivo de kits/carrinho quando aplicável;
- calcular frete;
- calcular total final.

### 13.2. Disponibilidade

O Backend deverá:

- impedir compra de produto inativo;
- impedir compra de produto invisível;
- impedir compra de variante inativa;
- impedir compra de variante invisível;
- impedir compra de kit com item inativo ou invisível;
- validar composição de kits customizáveis, incluindo quantidade mínima, quantidade máxima, repetição de itens e itens permitidos.

Não haverá controle automático de quantidade/estoque no MVP. A disponibilidade comercial será controlada manualmente pelo Admin por status e visibilidade.

### 13.3. Entrega

O Backend deverá:

- validar bairro ativo;
- calcular frete pelo bairro;
- validar frete grátis por subtotal mínimo configurável;
- aplicar frete grátis promocional quando um kit pronto/campanha conceder esse benefício;
- validar data;
- validar lead time de 5 dias;
- validar turno ativo.

### 13.4. Cupons

O Backend deverá:

- validar código;
- validar status;
- validar período;
- validar limite de uso;
- validar subtotal mínimo;
- validar escopo;
- calcular desconto.

### 13.5. Pedido

O Backend deverá:

- criar snapshot do pedido;
- gerar número amigável no formato `REV-2026-000001`;
- salvar status inicial como `pending_payment`;
- integrar com Mercado Pago em SPEC futura;
- ao receber confirmação de pagamento por webhook, atualizar o pedido para `confirmed`;
- registrar cada mudança relevante em `statusHistory`;
- garantir idempotência nas operações críticas;
- impedir que o frontend confirme pagamento diretamente;
- permitir que o Admin faça ajustes manuais quando necessário, mantendo auditoria;
- registrar cancelamentos com motivo e responsável.

---

## 14. Impactos no Storefront

### 14.1. Catálogo

O Storefront deverá:

- listar apenas produtos ativos, visíveis e compráveis;
- esconder produtos sem variante ativa e visível;
- esconder produtos inativos, arquivados ou rascunhos;
- exibir preço “a partir de” pela menor variante ativa e visível;
- exibir tags e categorias conforme configuração.

### 14.2. Página de produto

O Storefront deverá:

- buscar produto por `slug`;
- listar apenas variantes ativas e visíveis;
- não permitir compra de variante invisível ou inativa;
- exibir ingredientes, alergênicos e instruções;
- exibir preço da variante selecionada.

### 14.3. Filtros

No MVP, o catálogo usará filtros simples e operáveis:

- categoria como navegação/filtro principal;
- tags públicas como filtros secundários;
- restrições principais como tags do tipo `restriction`;
- destaques comerciais por tags, `isFeatured` e `isNew`.

Ficam para fase posterior:

- filtro por preço;
- filtro por gramatura;
- filtros avançados por objetivo alimentar;
- combinações complexas de filtros;
- recomendação personalizada baseada em preferências/restrições do cliente.

### 14.3.1. Kits customizáveis

O Storefront deverá permitir, no MVP:

- apresentar kits como uma compra central da experiência;
- permitir que o cliente monte um kit com múltiplos pratos;
- respeitar quantidade mínima e máxima definida no Admin;
- permitir repetição de pratos quando a regra comercial permitir;
- exibir quanto falta para atingir a quantidade mínima ou próxima faixa de desconto, se houver;
- validar visualmente a composição antes de enviar ao Backend;
- enviar composição final para validação de preço, visibilidade e regras no Backend.

### 14.4. Home dinâmica

O Storefront deverá:

- montar a Home a partir de blocos publicados em `siteContent`;
- respeitar prioridade dos blocos;
- respeitar janela de publicação;
- permitir banners e campanhas dinâmicas;
- permitir destaques de produtos, categorias e kits;
- ter fallback para conteúdo ausente;
- evitar dependência de código para mudanças rotineiras da Home.

### 14.5. Checkout

O Storefront deverá:

- listar bairros ativos;
- exibir frete estimado;
- permitir seleção de data e turno;
- aplicar cupom de forma preliminar;
- enviar tudo para validação final no Backend;
- criar/iniciar pedido como `pending_payment` apenas no fluxo de checkout/pagamento;
- nunca marcar pedido como pago ou confirmado diretamente.

---

## 15. Critérios de aceite

Esta SPEC será considerada aceita quando:

- [ ]  O arquivo `specs/SPEC-003-firestore-schema-v2.md` existir no repo `revere-governance`.
- [ ]  A SPEC listar todas as coleções mínimas:
    - [ ]  `products`
    - [ ]  `productVariants`
    - [ ]  `tags`
    - [ ]  `categories`
    - [ ]  `kitPresets`
    - [ ]  `coupons`
    - [ ]  `neighborhoods`
    - [ ]  `siteContent`
    - [ ]  `users`
    - [ ]  `orders`
- [ ]  Cada coleção tiver propósito claro.
- [ ]  Cada coleção tiver campos principais propostos.
- [ ]  Campos monetários estiverem definidos em centavos.
- [ ]  MVP estiver definido sem controle automático de estoque.
- [ ]  Produto/variante invisível estiver definido como não exibível.
- [ ]  Produto inativo/arquivado/rascunho estiver definido como não exibível.
- [ ]  Preço público do card estiver definido como menor variante ativa e visível.
- [ ]  Pedido armazenar snapshot de itens, preço, cliente e entrega.
- [ ]  Schema contemplar frete fixo por bairro.
- [ ]  Schema contemplar agenda de entrega por dia/turno.
- [ ]  Schema contemplar lead time mínimo.
- [ ]  Schema contemplar produtos com variantes por gramatura.
- [ ]  Schema contemplar cupons com validade, limite e tipo de desconto.
- [ ]  Schema contemplar kits prontos.
- [ ]  Schema contemplar Home dinâmica via `siteContent`.
- [ ]  SPEC incluir seção de convenções de nomenclatura.
- [ ]  SPEC incluir seção de LGPD e dados sensíveis.
- [ ]  SPEC incluir estratégia documental para imagens e arquivos.
- [ ]  MVP estiver definido com assets estáticos/referências lógicas, sem dependência inicial de Firebase Storage.
- [ ]  SPEC diferenciar foto real, placeholder de marca, imagem editorial e ilustração.
- [ ]  SPEC reforçar auditoria, snapshot e histórico futuro de pedidos.
- [ ]  SPEC registrar claramente as decisões pendentes antes de implementação.
- [ ]  SPEC separar responsabilidades de Admin, Backend e Storefront.
- [ ]  SPEC deixar explícito que preço final, cupom, frete e pedido devem ser validados no Backend.
- [ ]  SPEC registrar que filtros do MVP estão definidos como categoria + tags públicas, com filtros avançados para fase posterior.
- [ ]  SPEC não implementar código.
- [ ]  SPEC não criar regras Firestore.
- [ ]  SPEC não criar backend.
- [ ]  SPEC ser revisada antes de qualquer implementação real.

---

## 16. Decisões fechadas e pontos de detalhamento futuro

### 16.1. Filtros

Decisão fechada em 2026-06-01:

- O MVP usará categoria + tags públicas.
- Categoria será a navegação/filtro principal.
- Tags serão filtros secundários e também poderão aparecer como selos nos cards.
- Restrições principais entram como tags do tipo `restriction`.
- Destaques comerciais podem usar tags, `isFeatured` e `isNew`.
- Filtros por preço, gramatura, objetivo alimentar avançado e recomendação personalizada ficam para fase posterior.

### 16.2. Home dinâmica

Decisão fechada em 2026-06-01:

- A Home será dinâmica em modelo híbrido por blocos tipados.
- O Admin poderá controlar conteúdo, imagem, CTA, produtos, kits, categorias vinculadas, ordem, status e janela de publicação.
- O layout visual continua controlado pelo código para preservar identidade, responsividade e consistência de marca.
- Blocos essenciais da v1: `home_hero`, `home_how_it_works`, `home_product_highlight`, `home_kit_highlight`, `delivery_info` e `final_cta`.
- Blocos opcionais preparados na v1: `campaign_banner`, `notice`, `home_category_highlight`, `faq_preview`, `social_proof`, `checkout_notice` e `generic`.
- Ordenação será controlada por `displayRules.priority`.
- Agendamento será controlado por `displayRules.startsAt` e `displayRules.endsAt`.
- Não haverá editor livre total nem layout builder complexo no MVP.

### 16.3. Estoque

Decisão fechada em 2026-06-01:

- Não haverá controle automático de estoque no MVP.
- Não haverá controle de quantidade disponível por prato/variante.
- Não haverá reserva temporária durante checkout/pagamento.
- Não haverá baixa automática de estoque após pagamento.
- O Admin deverá conseguir deixar produtos, variantes ou kits invisíveis para o cliente.
- Quando um prato estiver sem estoque real, com produção suspensa ou com venda pausada, Caio/equipe poderá retirar manualmente do cardápio público.
- A disponibilidade comercial será controlada por `status` e `isVisible`.

### 16.4. Kits

Decisões fechadas em 2026-06-01:

- Kits customizáveis entram no MVP.
- Kits serão um dos carros-chefe comerciais da Revere e devem favorecer tickets maiores.
- O cliente deve conseguir montar o próprio kit, escolhendo pratos conforme preferência, rotina e eventual acompanhamento nutricional.
- Kits prontos e sugeridos continuam possíveis, mas não substituem a personalização.
- A personalização deve ser evidente na experiência de compra, pois está alinhada à proposta de alimentação adaptada às necessidades individuais.
- Kit customizável inicial começa com mínimo de 7 unidades.
- O cliente pode comprar quantidades acima do mínimo, montar livremente e repetir pratos.
- Desconto progressivo inicial:
    - 5% para 7 a 9 pratos;
    - 8% para 10 a 14 pratos;
    - 10% para 15 ou mais pratos.
- O desconto progressivo dos kits customizáveis é focado em refeições congeladas, especialmente 300g, 360g, 410g e futuras gramaturas equivalentes.
- Apenas produtos do tipo `frozen_meal` entram nos kits customizáveis com desconto progressivo no MVP.
- Produtos futuros como snacks congelados ficam fora dessa regra até nova decisão.
- A lógica de desconto deve ser uniforme para simplificar a estratégia de precificação interna.
- O Admin deverá conseguir configurar regras de kit, quantidade mínima/máxima, itens permitidos, possibilidade de repetição, faixas de desconto e frete grátis promocional.
- A validação final de preço, descontos, itens visíveis e regras do kit deve acontecer no Backend.

### 16.5. Nutrição, LGPD e frente de Nutrição

Decisões fechadas em 2026-06-01:

- Elaine é o braço técnico da Revere.
- Elaine é responsável por acompanhar e validar processos de produção, tabelas nutricionais e informações técnicas da frente nutricional.
- Todas as tabelas nutricionais de cada prato devem passar por validação técnica da nutricionista antes de publicação.
- Conteúdos estratégicos que envolvam nutrição, alegações sensíveis, benefícios, restrições, alergênicos ou comunicação técnica também devem passar por aprovação da nutricionista.
- A Revere pode tracionar consultas e atendimentos da frente de Nutrição do Grupo, mas atendimento nutricional personalizado é uma frente separada e fora do escopo transacional do MVP da loja.
- A loja Revere não deve prometer recomendação nutricional individualizada dentro do fluxo de compra do MVP.
- Dados coletados no MVP: nome, telefone, e-mail, data de aniversário, endereços necessários para entrega, histórico de compras, pontos e link/código de indicação.
- Cupons do cliente serão tratados como benefício aplicado, relação derivada ou regra validada pela coleção `coupons`, não como dado sensível armazenado diretamente no perfil do usuário no MVP.
- CPF, RG e documentos equivalentes não serão coletados no MVP.
- Restrições alimentares e dados de dieta individual não serão coletados pela loja Revere no MVP; se essa necessidade surgir, deve ser tratada em fluxo próprio, com consentimento e validação jurídica/técnica.
- O MVP deve ser minimamente operável: vender, coletar o mínimo necessário e permitir operação real, enquanto o projeto completo evolui em paralelo.

### 16.6. Pedidos

Decisões fechadas em 2026-06-01:

- Pedido nasce como `pending_payment`.
- `draft` fica fora do MVP.
- Carrinho ainda não é pedido.
- Pedido só nasce quando o cliente inicia checkout/pagamento.
- Após pagamento aprovado por webhook/Backend, o pedido entra automaticamente como `confirmed`, pronto para produção.
- Não haverá etapa operacional obrigatória entre pagamento aprovado e confirmação para produção no MVP.
- `statusHistory` entra na v1 como array simples embutido no documento do pedido.
- Pagamento confirmado apenas por webhook/Backend, salvo correção manual excepcional pelo Admin.
- Frontend nunca marca pedido como pago ou confirmado.
- Cancelamento pelo cliente fica fora do MVP; o cliente deve solicitar cancelamento pelos canais de atendimento.
- Admin tem autonomia total para alterar status e corrigir exceções, sempre com registro de histórico/auditoria.
- Número amigável do pedido aprovado no formato `REV-2026-000001`.

---

## 17. Observações finais

Esta SPEC deve ser usada como base para a próxima etapa documental e técnica do projeto.

Antes de implementar qualquer CRUD real, recomenda-se revisar especialmente:

- configuração de frete grátis por subtotal, kit e campanha;
- regras finas de kits customizáveis;
- workflow de aprovação técnica da Elaine;
- privacidade/LGPD dos dados mínimos coletados;
- permissões internas do Admin;
- integração futura com pontos, cupons e indicação.

A prioridade do schema v1 é permitir um MVP seguro, operável e flexível, evitando que a Revere fique dependente de código para mudanças comerciais rotineiras.

A versão mínima deve lançar o quanto antes, vender, captar valor e coletar as primeiras informações, enquanto a evolução para o site ideal segue em paralelo de forma planejada.
