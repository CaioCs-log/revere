# SPEC-004 — Admin-first CRUD (Site Revere)

> SPEC documental para guiar a implementação da Fase 4.2 — Admin-first CRUD do Site Revere. Este documento transforma a SPEC-003 versionada em plano operacional para o `revere-admin`, antes de qualquer implementação de código.

## Metadados
- **Projeto:** Site Revere
- **Tipo:** SPEC técnica/documental
- **Status:** M0 concluído e validado; aguardando refinamento final de M1/M2 antes do prompt oficial de implementação
- **Data:** 2026-06-01
- **Responsável pela validação:** Caio Cesar Dos Santos
- **Fonte base:** SPEC-003 — Firestore Schema v1 versionada no `revere-governance`
- **Commit base da SPEC-003:** `240f481 docs: add firestore schema v1 spec`
- **Escopo desta entrega:** planejamento e contrato de execução da Fase 4.2 no `revere-admin`
- **Não inclui:** implementação, regras Firestore, Cloud Functions, Storage, checkout, Mercado Pago, Storefront ou Backend

---

## 1. Título
**SPEC-004 — Admin-first CRUD para o Site Revere**

---

## 2. Status
**M0 — Fundação do Admin concluído e validado; próximo passo é refinar M1 — Categorias e M2 — Tags antes da implementação.**

Esta SPEC organiza a próxima frente do projeto: transformar o schema Firestore v1 em módulos operacionais do Admin.

Caio/Psiu validaram esta SPEC como base de planejamento da Fase 4.2. O M0 foi implementado pelo Agente CLI (commits `2c8f390` e `b03199c`) e aprovado pela QA do Agente Raptor VSCode em 2026-06-01. Antes do prompt oficial de M1, ainda falta aplicar o refinamento documental P-025 para categorias/tags. Continuam fora de escopo CRUDs não citados, checkout, pagamento, Cloud Functions, Storage ou regras Firestore finais.

---

## 3. Objetivo
Definir a sequência, escopo, critérios de aceite e limites da implementação Admin-first CRUD do Site Revere.

O objetivo é garantir que o Admin seja a primeira camada operacional real do projeto, permitindo que a Revere gerencie catálogo, categorias, tags, frete, kits, conteúdo dinâmico e pedidos sem depender de alteração de código para mudanças rotineiras.

A lógica desta SPEC segue a regra operacional do Playbook:

> Se o Admin não consegue mexer, a operação fica refém do código.

---

## 4. Contexto
A SPEC-003 já foi validada e versionada no `revere-governance` como:

revere-governance/specs/SPEC-003-firestore-schema-v1.md

Commit:

240f481 docs: add firestore schema v1 spec

A partir dela, a Fase 4.2 deve implementar primeiro o Admin, começando por uma fundação segura e avançando por módulos pequenos.

Premissas atuais:
- `revere-admin` é o app do painel administrativo.
- O projeto usa Next.js, App Router, TypeScript, Vitest e Playwright.
- Firestore e Authentication já existem.
- Cloud Functions e Storage seguem bloqueados até Blaze/billing.
- No MVP, imagens usam referências lógicas/placeholders, sem upload real.
- Validações críticas de preço, desconto, frete, cupom e pagamento serão responsabilidade futura do Backend.
- O Admin pode escrever dados operacionais no Firestore, mas não deve substituir validações críticas do Backend em produção.

---

## 5. Escopo
Esta SPEC cobre a implementação planejada dos seguintes módulos:
- **M0 — Fundação do Admin**
- **M1 — Categorias**
- **M2 — Tags**
- **M3 — Produtos**
- **M4 — Variantes**
- **M5 — Bairros e frete**
- **M6 — Kits**
- **M7 — Conteúdo dinâmico**
- **M8 — Pedidos**

Também define:
- ordem recomendada de implementação;
- dependências entre módulos;
- critérios de aceite;
- limites do MVP;
- riscos;
- próximos prompts para agentes;
- o que fica para fases posteriores.

---

## 6. Fora de escopo
Esta SPEC **não** cobre:
- implementação de checkout;
- integração com Mercado Pago;
- webhooks de pagamento;
- Cloud Functions;
- regras Firestore finais;
- upload real de imagens;
- biblioteca de mídia;
- sistema completo de usuários/clientes;
- fidelidade, pontos e indicação;
- cupons no Admin como módulo principal;
- relatórios financeiros;
- painel de produção/cozinha;
- Storefront;
- deploy;
- configuração de billing/Blaze;
- scripts de migração de dados;
- carga oficial do cardápio.

---

## 7. Ordem de implementação recomendada
A Fase 4.2 deve ser implementada em módulos pequenos, um por vez.

Ordem recomendada:
1. **M0 — Fundação do Admin**
2. **M1 — Categorias**
3. **M2 — Tags**
4. **M3 — Produtos**
5. **M4 — Variantes**
6. **M5 — Bairros e frete**
7. **M6 — Kits**
8. **M7 — Conteúdo dinâmico**
9. **M8 — Pedidos**

Racional:
- M0 desbloqueia padrões de autenticação, layout, Firestore, formulários e auditoria.
- M1 e M2 criam a base de organização do catálogo.
- M3 e M4 criam o núcleo comercial do catálogo.
- M5 destrava a base operacional de entrega.
- M6 materializa o motor comercial dos kits.
- M7 permite Home e comunicação dinâmica sem depender de código.
- M8 fecha o ciclo operacional, mas só terá valor completo após checkout/backend.

---

## 8. Módulos

### 8.1. M0 — Fundação do Admin
**Objetivo:** criar a base técnica e operacional do painel antes de qualquer CRUD específico.

Escopo:
- shell/layout do Admin;
- navegação principal;
- proteção de rotas;
- leitura de usuário autenticado;
- verificação de `role` administrativa;
- acesso permitido apenas para `admin` e `owner`;
- camada inicial de acesso ao Firestore;
- padrões de formulário;
- validação com Zod;
- estados de loading, empty e error;
- padrão de auditoria com `createdAt`, `updatedAt`, `createdBy` e `updatedBy`;
- helper compartilhado de slug (normalização lowercase, sem acento, com hífen, e geração a partir do `name`) reutilizável por M1, M2 e demais módulos;
- convenção de exclusão lógica por `status` (sem delete físico) reutilizável pelos CRUDs;
- componentes base reutilizáveis para módulos CRUD.

Critérios de aceite:
- somente `admin` e `owner` acessam rotas administrativas;
- usuário comum não acessa Admin;
- rotas protegidas redirecionam ou bloqueiam corretamente;
- CRUDs futuros conseguem reutilizar camada de Firestore;
- formulários têm estados de loading, erro e sucesso;
- auditoria é preenchida de forma consistente;
- gates locais passam.

Fora de escopo:
- login visual final;
- gestão completa de usuários;
- permissões refinadas por módulo;
- Cloud Functions;
- regras Firestore finais.

### 8.2. M1 — Categorias
**Coleção:** `categories`

Objetivo: permitir ao Admin criar e organizar as categorias principais do catálogo.

Campos principais:
- `name`
- `slug`
- `status`
- `description`
- `parentCategoryId`
- `imageId`
- `showInMenu`
- `showInHome`
- `sortOrder`
- `createdAt`
- `updatedAt`

Escopo MVP:
- CRUD de categorias (listar, criar, editar, inativar);
- ordenação (`sortOrder`);
- controle de exibição no menu (`showInMenu`) e na Home (`showInHome`);
- estrutura preparada para hierarquia futura, mas sem exibir hierarquia no MVP.

Critérios de aceite:
- `name` obrigatório;
- `slug` obrigatório e único;
- **Padronização de `slug`:** usar helper compartilhado de normalização (minúsculas, sem acentos, hífens), com sugestão automática a partir do `name` e edição manual permitida;
- **Default conservador de `status`:** novos registros nascem em estado conservador (ex.: inativo ou `draft`) até publicação explícita;
- **Precedência de inativo:** categoria inativa ou `archived` prevalece sobre `showInMenu` e `showInHome`. Se inativa, não aparece no Storefront, independentemente das flags;
- **Inativação sem delete físico:** no MVP não há exclusão física; inativar é o caminho para remover um item, preservando histórico e integridade referencial;
- **Hierarquia adiada:** `parentCategoryId` existe no schema, mas fica oculto/bloqueado na UI do MVP;
- `sortOrder` controla ordem;
- `showInMenu` e `showInHome` são editáveis e independentes;
- gates locais passam.

### 8.3. M2 — Tags
**Coleção:** `tags`

Objetivo: permitir ao Admin gerenciar tags públicas e operacionais para filtros, selos e organização interna.

Campos principais:
- `name`
- `slug`
- `status`
- `type`
- `description`
- `color`
- `showInFilters`
- `showInProductCard`
- `sortOrder`
- `createdAt`
- `updatedAt`

Tipos:

"nutrition" | "restriction" | "commercial" | "preference" | "operational"

Escopo MVP:
- CRUD de tags (listar, criar, editar, inativar);
- tags funcionam como rótulos informativos/selos;
- configuração independente se aparece como filtro (`showInFilters`) e se aparece como selo no card (`showInProductCard`);
- tipo obrigatório (`type`);
- cor opcional (`color`);
- status default conservador.

Critérios de aceite:
- `name` obrigatório;
- `slug` obrigatório e único;
- **Padronização de `slug`:** usar helper compartilhado de normalização (minúsculas, sem acentos, hífens), com sugestão automática a partir do `name` e edição manual permitida;
- **Texto de ajuda para `type`:** explicar que o tipo (`restriction`, `preference`, `nutrition`, etc.) serve como rótulo/selo informativo, e não como personalização funcional do cliente no MVP;
- **Independência de exibição:** `showInFilters` e `showInProductCard` são flags independentes;
- **Default conservador de `status`:** novos registros nascem em estado conservador (ex.: inativo ou `draft`) até publicação explícita;
- **Precedência de inativo:** tag inativa ou `archived` prevalece sobre `showInFilters` e `showInProductCard`. Se inativa, não aparece no Storefront, independentemente das flags;
- **Inativação sem delete físico:** no MVP não há exclusão física; inativar é o caminho para remover um item, preservando histórico e integridade referencial;
- `color` opcional e validada como hex quando informada;
- gates locais passam.

### 8.4. M3 — Produtos
**Coleção:** `products`

Objetivo: permitir ao Admin cadastrar e manter produtos base do catálogo.

Campos principais:
- `name`
- `slug`
- `shortDescription`
- `description`
- `status`
- `isVisible`
- `productType`
- `categoryIds`
- `tagIds`
- `imageIds`
- `mainImageId`
- `mainImageAlt`
- `imageMode`
- `ingredients`
- `allergens`
- `nutritionalHighlights`
- `storageInstructions`
- `consumptionInstructions`
- `isFeatured`
- `isNew`
- `sortOrder`
- auditoria

Dependências:
- M1 Categorias;
- M2 Tags.

Escopo MVP:
- CRUD de produtos;
- seleção de categorias;
- seleção de tags;
- visibilidade manual;
- status;
- controle de destaque;
- campos nutricionais simplificados;
- imagem por referência lógica/placeholder;
- sem upload real.

Critérios de aceite:
- produto exige `name` obrigatório;
- produto ativo exige `name`, `slug`, descrição curta, descrição completa e pelo menos uma categoria;
- `slug` obrigatório e único;
- **Padronização de `slug`:** usar o helper compartilhado de normalização definido no M0 (minúsculas, sem acentos, hífens), com sugestão automática a partir do `name` e edição manual permitida;
- **Default conservador de `status`:** novos produtos nascem em estado conservador (ex.: `draft` ou `inactive`) até publicação explícita;
- **Precedência de status/visibilidade:** produto `draft`, `inactive` ou `archived` não aparece publicamente, mesmo que `isVisible = true`;
- `isVisible = false` oculta o produto;
- **Inativação sem delete físico:** no MVP não há exclusão física de produtos; remover da experiência pública deve ser feito por `status` e/ou `isVisible`, preservando histórico, relações com variantes, pedidos e auditoria;
- `imageMode` obrigatório;
- Admin enxerga alerta para produto ativo sem variante ativa/visível;
- campos monetários não ficam no produto;
- gates locais passam.

### 8.5. M4 — Variantes
**Coleção:** `productVariants`

Objetivo: permitir ao Admin cadastrar as variações comerciais de um produto, principalmente por gramatura e preço.

Campos principais:
- `productId`
- `name`
- `sku`
- `status`
- `portionLabel`
- `weightGrams`
- `priceCents`
- `compareAtPriceCents`
- `isVisible`
- `minQuantity`
- `maxQuantity`
- `isDefault`
- `sortOrder`
- auditoria

Dependência:
- M3 Produtos.

Escopo MVP:
- CRUD de variantes vinculado ao produto;
- preço em centavos;
- gramatura;
- SKU;
- visibilidade manual;
- status;
- variante padrão;
- ordenação.

Critérios de aceite:
- `productId` obrigatório;
- variante exige nome/identificação comercial clara para o Admin;
- `sku` obrigatório e único;
- `weightGrams > 0`;
- `priceCents > 0`;
- `compareAtPriceCents > priceCents` quando informado;
- **Default conservador de `status`:** novas variantes nascem em estado conservador (ex.: `draft` ou `inactive`) até publicação explícita;
- **Precedência de status/visibilidade:** variante `draft`, `inactive` ou `archived` não deve aparecer como comprável, mesmo que `isVisible = true`;
- variante invisível não deve ser comprável;
- **Inativação sem delete físico:** no MVP não há exclusão física de variantes; remover uma gramatura/preço da venda deve ser feito por `status` e/ou `isVisible`, preservando histórico, vínculo com produto, pedidos e auditoria;
- produto precisa conseguir calcular/exibir menor variante ativa e visível;
- gates locais passam.

### 8.6. M5 — Bairros e frete
**Coleção:** `neighborhoods`

Objetivo: permitir ao Admin controlar bairros atendidos, taxa de entrega, frete grátis, dias, turnos e lead time.

Campos principais:
- `name`
- `slug`
- `city`
- `state`
- `status`
- `deliveryFeeCents`
- `freeShippingMinimumCents`
- `deliveryDays`
- `deliveryWindows`
- `minimumLeadTimeDays`
- `sortOrder`
- `createdAt`
- `updatedAt`

Escopo MVP:
- CRUD de bairros;
- cidade padrão Blumenau;
- UF padrão SC;
- taxa fixa por bairro;
- frete grátis por mínimo de pedido;
- valor inicial `19900`;
- dias de entrega;
- janelas/turnos de entrega;
- lead time inicial de 5 dias.

Critérios de aceite:
- `city = "Blumenau"` no MVP;
- `state = "SC"` no MVP;
- `deliveryFeeCents >= 0`;
- bairro ativo exige pelo menos 1 dia de entrega;
- bairro ativo exige pelo menos 1 turno ativo;
- `freeShippingMinimumCents` editável;
- lead time padrão 5 dias;
- bairro inativo não aparece no checkout;
- gates locais passam.

### 8.7. M6 — Kits
**Coleção:** `kitPresets`

Objetivo: permitir ao Admin criar kits prontos, sugeridos e customizáveis.

Campos principais:
- `name`
- `slug`
- `status`
- `shortDescription`
- `description`
- `imageId`
- `imageAlt`
- `imageMode`
- `kitType`
- `eligibleProductTypes`
- `allowRepeatedItems`
- `items`
- `minItems`
- `maxItems`
- `pricingMode`
- `fixedPriceCents`
- `discountTiers`
- `grantsFreeShipping`
- `isFeatured`
- `sortOrder`
- auditoria

Tipos:

"fixed" | "suggested" | "customizable"

Dependências:
- M3 Produtos;
- M4 Variantes.

Escopo MVP:
- criar kits prontos;
- criar kits sugeridos;
- criar kits customizáveis;
- mínimo de 7 unidades para customizáveis;
- repetição permitida;
- apenas `frozen_meal` para desconto progressivo no MVP;
- desconto progressivo:
	- 5% para 7 a 9 pratos;
	- 8% para 10 a 14 pratos;
	- 10% para 15 ou mais pratos;
- configuração de frete grátis promocional por kit;
- preço fixo ou soma dos itens.

Critérios de aceite:
- kit ativo exige nome, slug e descrição;
- kit `fixed` ou `suggested` exige itens;
- kit `customizable` exige `minItems = 7`;
- `discountTiers` devem seguir 5/8/10%;
- apenas `frozen_meal` elegível no MVP;
- kit ativo só pode referenciar produtos/variantes ativos e visíveis;
- tela deve sinalizar que preço/desconto final serão validados no Backend;
- gates locais passam.

### 8.8. M7 — Conteúdo dinâmico
**Coleção:** `siteContent`

Objetivo: permitir ao Admin editar conteúdo dinâmico do site, especialmente Home, banners, avisos e destaques.

Campos principais:
- `key`
- `status`
- `type`
- `title`
- `subtitle`
- `body`
- `imageId`
- `imageAlt`
- `imageMode`
- `ctaLabel`
- `ctaHref`
- `linkedProductIds`
- `linkedCategoryIds`
- `linkedKitPresetIds`
- `displayRules`
- `metadata`
- `publishedAt`
- auditoria

Tipos principais:

"home_hero"
"home_how_it_works"
"home_product_highlight"
"home_kit_highlight"
"home_category_highlight"
"campaign_banner"
"notice"
"delivery_info"
"checkout_notice"
"final_cta"
"faq_preview"
"social_proof"
"generic"

Dependências:
- M1 Categorias;
- M3 Produtos;
- M6 Kits.

Escopo MVP:
- CRUD de blocos de conteúdo;
- hero da Home;
- banners;
- destaques de produtos;
- destaques de kits;
- avisos;
- informações de entrega;
- CTA final;
- prioridade/ordem;
- janela de publicação;
- vínculos com produtos, categorias e kits.

Critérios de aceite:
- `key` obrigatório;
- `type` obrigatório;
- conteúdo publicado precisa ter campos mínimos conforme o tipo;
- CTA exige `ctaLabel` e `ctaHref`;
- janela de publicação é respeitada;
- apenas `published` aparece publicamente;
- `priority` controla ordenação;
- blocos essenciais da v1 estão disponíveis;
- gates locais passam.

### 8.9. M8 — Pedidos
**Coleção:** `orders`

Objetivo: permitir ao Admin acompanhar pedidos, visualizar detalhes e alterar status manualmente com histórico/auditoria.

Escopo MVP:
- listagem de pedidos;
- filtro por status;
- filtro por data de entrega;
- detalhe do pedido;
- visualização do snapshot;
- visualização de cliente, itens, preço, frete, cupom e entrega;
- alteração manual de status;
- registro em `statusHistory`;
- observação interna;
- cancelamento com motivo.

Status:

"pending_payment"
"confirmed"
"in_production"
"ready_for_delivery"
"out_for_delivery"
"delivered"
"cancelled"
"refunded"

Critérios de aceite:
- lista filtrável por status;
- lista filtrável por data de entrega;
- detalhe exibe snapshot do pedido;
- mudança de status grava: `from`; `to`; `changedAt`; `changedBy`; `reason`;
- cancelamento exige motivo;
- frontend nunca marca pagamento como aprovado por conta própria;
- tela deixa claro quando confirmação deveria vir do Backend/webhook;
- gates locais passam.

---

## 9. MVP vs depois

### 9.1. Entra no MVP
- Fundação do Admin;
- categorias;
- tags;
- produtos;
- variantes;
- bairros/frete;
- kits prontos, sugeridos e customizáveis;
- conteúdo dinâmico;
- pedidos em modo operacional;
- placeholders/referências lógicas de imagem;
- auditoria mínima;
- status e visibilidade manual;
- validação client-side/admin com Zod;
- testes e gates por módulo.

### 9.2. Fica para depois
- upload real de imagens;
- Firebase Storage;
- biblioteca de mídia;
- Cloud Functions;
- validação final de preço no Backend;
- integração Mercado Pago;
- webhooks;
- módulo completo de cupons;
- módulo completo de usuários/clientes;
- fidelidade, pontos e indicação;
- workflow de aprovação nutricional da Elaine;
- filtros avançados;
- categorias hierárquicas reais;
- recomendações personalizadas;
- snacks congelados nos kits com desconto;
- painel de produção/cozinha;
- relatórios financeiros.

---

## 10. Critérios gerais de aceite
Cada módulo só será aceito quando:
- [ ] estiver alinhado à SPEC-003;
- [ ] estiver alinhado a esta SPEC-004;
- [ ] não alterar escopo de negócio sem aprovação;
- [ ] não recriar governança na raiz;
- [ ] alterar apenas o repo permitido;
- [ ] tiver estados de loading, empty e error;
- [ ] tiver validação de formulário;
- [ ] preencher auditoria quando aplicável;
- [ ] proteger dados administrativos;
- [ ] funcionar em 390px, 768px e 1024px;
- [ ] passar em `format:check`;
- [ ] passar em `lint`;
- [ ] passar em testes unitários;
- [ ] passar em build;
- [ ] passar em e2e smoke quando aplicável;
- [ ] entregar relatório final com arquivos alterados, comandos, gates, riscos e próximo passo.

---

## 11. Riscos

### 11.1. Validação crítica sem Backend
Enquanto Cloud Functions/Blaze estiverem bloqueados, o Admin pode cadastrar dados, mas não substitui validações finais de produção.

Risco:
- preço, desconto, cupom, frete e pedido ficarem confiando demais no frontend/Admin.

Mitigação:
- marcar claramente que validações finais de preço/frete/cupom/pedido pertencem ao Backend futuro;
- não liberar checkout real sem Backend validando.

### 11.2. Kits customizáveis
Kits são estratégicos, mas complexos.

Risco:
- divergência de regra entre Admin, Storefront e Backend.

Mitigação:
- começar com regras explícitas;
- manter desconto 5/8/10%;
- permitir apenas `frozen_meal` no MVP;
- centralizar validação final no Backend futuramente.

### 11.3. Imagens
MVP sem Storage exige cuidado editorial.

Risco:
- placeholders confundirem o cliente ou gerarem retrabalho.

Mitigação:
- usar `imageMode`;
- diferenciar foto real, placeholder, editorial e ilustração;
- não simular foto exata de prato quando a foto real ainda não existir.

### 11.4. Escopo grande demais
Fase 4.2 tem muitos módulos.

Risco:
- tentar implementar tudo de uma vez.

Mitigação:
- uma tarefa por módulo;
- uma branch/commit por entrega;
- validação central por Psiu/Caio;
- gates obrigatórios.

---

## 12. Dependências

### 12.1. Já concluídas
- SPEC-003 criada no Notion;
- decisões de schema fechadas;
- SPEC-003 versionada no `revere-governance`;
- saneamento estrutural da raiz concluído;
- `revere-admin` criado e com base técnica inicial.

### 12.2. Ainda pendentes
- validação desta SPEC-004 por Caio/Psiu;
- retorno do M0 pelo Agente CLI — recebido em 2026-06-01 com commits `2c8f390` e `b03199c`; QA do Raptor VSCode concluída em 2026-06-01 (P-026) e M0 marcado como concluído;
- retorno do Agente Raptor VSCode sobre prontidão do `revere-admin` — validado em 2026-06-01: gates passaram, rotas base existem e ainda não há CRUD/camada de dados real;
- retorno do Agente Gemini Cloud sobre plano Cloud/Firebase — validado em 2026-06-01: M0 pode avançar com Firestore/Auth e sem Storage/Functions; checkout, pagamento e validações críticas dependem de Blaze/Cloud Functions;
- retorno do Agente Gemini Cloud sobre Firebase Emulators — validado em 2026-06-01: M0 deve priorizar Auth Emulator e Firestore Emulator para desenvolvimento local seguro; Storage Emulator é opcional/futuro, pois upload real está fora do escopo;
- billing/Blaze para Cloud Functions e Storage;
- decisão posterior de quando iniciar upload real de imagens;
- decisão posterior de quando implementar Backend de validação crítica.

---

## 13. Estratégia de execução com agentes

### 13.1. Agente CLI
Usar para implementação controlada de cada módulo no `revere-admin`.

Regra:
- um módulo por prompt;
- um repo por rodada;
- relatório final obrigatório;
- commit somente quando autorizado no prompt.

### 13.2. Agente Raptor VSCode
Usar para auditoria, QA, leitura de código, revisão leve e validação de gates.

Regra:
- preferencialmente somente leitura;
- não implementar sem autorização explícita;
- ideal para checar se o agente CLI respeitou escopo.

### 13.3. Agente Notion
Usar para documentação, refinamento de SPEC, decomposição de tarefas e atualização de Central/Playbook.

Regra:
- não alterar decisões de negócio sozinho;
- não criar novas SPECs sem autorização;
- não atuar em repositórios.

### 13.4. Agente Gemini Cloud
Usar para plano Firebase/Cloud, billing, regiões, APIs, Storage, Functions e riscos de custo.

Regra:
- consultivo até Caio liberar billing/Blaze;
- não executar mudanças automaticamente.

---

## 14. Próxima implementação recomendada
M0 foi concluído e validado (QA do Raptor VSCode, 2026-06-01). A próxima implementação recomendada continua sendo:

M1 — Categorias  (em seguida M2 — Tags)

Antes de executar M1, aplicar P-025 — refinamento final de clareza da SPEC-004 para M1/M2, especialmente default de status, precedência de inativo, política sem delete físico, slug compartilhado e `parentCategoryId` oculto no MVP.

O M0 entregue preparou:
- estrutura de rotas protegidas;
- layout administrativo;
- navegação;
- camada Firestore;
- conexão segura com Auth Emulator e Firestore Emulator em ambiente local;
- padrão de formulários;
- validação;
- auditoria;
- componentes base.

Com o refinamento aplicado e o Agente CLI com créditos novamente, M1 Categorias entra primeiro, seguido de M2 Tags, cada um com QA do Raptor antes de avançar.

---

## 15. Checklist de validação desta SPEC
Esta SPEC será considerada pronta para guiar implementação quando:
- [x] Caio validar a decomposição M0–M8.
- [x] Psiu validar os retornos do Raptor VSCode e Gemini Cloud.
- [x] A Central de Pendências apontar M0 como próxima tarefa operacional.
- [x] O Playbook refletir a ordem M0–M8.
- [x] O primeiro prompt de implementação do M0 estiver preparado.
- [x] Ficar claro que checkout, Backend, Storage e Mercado Pago não entram em M0.

---

## 16. Observações finais
A Fase 4.2 é o ponto em que o projeto começa a sair da governança pura e entrar na construção operacional real.

Por isso, esta SPEC existe para evitar que os agentes implementem "um CRUD genérico" sem respeitar a estratégia da Revere.

O Admin precisa nascer como ferramenta de operação, não apenas como formulário técnico.
