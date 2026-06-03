# Rules v1 (histórico) — requer Rules v2 alinhada à SPEC-003 (Schema v2).

# SPEC — Firestore Rules v1 (Auth + Roles + Acessos)

## 1) Contexto

Já definimos o schema v1 do Firestore (SPEC-001). Agora precisamos definir quem pode ler/escrever o quê, para:

- Proteger dados pessoais (birthDate, restrições, endereços)
- Proteger regras de negócio (config, cupons)
- Proteger pedidos (somente dono do pedido e admins)
- Permitir que o storefront leia catálogo e conteúdo público sem risco
- Garantir que "preço/desconto/frete final" não seja manipulável pelo cliente

**Referências:**

- SPEC-001 (Firestore Schema v1)
- PROJECT_HISTORY.md (decisões de segurança)

## 2) Objetivo

Definir uma política v1 de segurança de dados (Firestore Rules), incluindo:

- Regras de leitura e escrita por coleção
- Modelo de roles de admin
- Diretrizes de validação mínima nas rules (shape básico)
- Itens que DEVEM ser validados no backend (Functions) e não apenas por rules

## 3) Escopo

### Inclui

- Estratégia de autenticação (Firebase Auth)
- Estratégia de autorização (adminUsers + regras)
- Matriz de permissões por coleção (products, orders, users/..., config, etc.)
- Regras mínimas para impedir alterações críticas pelo cliente

### Não inclui

- Implementação final do arquivo firestore.rules (isso será feito no repo revere-backend na hora certa)
- Custom Claims avançado (pode virar v2)
- Rate limiting / anti-fraude (fora de rules)

## 4) Regras de negócio

- **Preço/discount/frete final**: jamais confiar em valores enviados pelo cliente.
- **Orders**: criação e atualização de status/pagamento devem ser controladas (preferencialmente) por backend/webhook.
- **Cupons**: leitura pode ser limitada; validação real do cupom é no backend.
- **Dados do usuário**: somente o próprio usuário e admin podem acessar.

**Exemplos:**

- Input: Cliente tenta criar order com `pricing.totalCents = 100` → Output: Backend recalcula e valida antes de persistir
- Input: Cliente tenta ler `users/{outroUid}` → Output: Firestore Rules bloqueia (403)
- Input: Admin tenta atualizar `products/{id}` → Output: Permitido se `adminUsers/{uid}` existe

## 5) UX / UI

- **Storefront**: pode precisar ler catálogo sem login (opcional).
- **Checkout**: exige login (se for regra do produto; você tende a capturar dados e fidelidade). Mesmo assim, rules devem suportar leitura de catálogo sem login.
- **Admin**: precisa CRUD completo de catálogo/config/conteúdo, e leitura/gestão de pedidos.

**Estados:**

- Loading: enquanto verifica autenticação
- Error: se usuário não tem permissão (403)
- Empty: se não há dados para exibir

**Responsividade:**

- Não aplicável (regras de backend)

## 6) Dados (Firestore)

### 6.1) Modelo de Roles (v1 simples)

**Estratégia v1 (sem custom claims)**: `adminUsers/{uid}`

Criar uma coleção `adminUsers` (já prevista em SPEC-001) onde cada documento tem:

- `role`: "owner" | "editor" | "viewer"

Esse documento só é gravado por você via backend/console inicial (mais tarde automatiza).

**Como as rules usam isso:**

- `isAdmin()` = existe doc em `adminUsers/{request.auth.uid}`
- `adminRole()` = lê campo `role`

**Observação**: Firestore Rules permite `get()`/`exists()` em documentos. Vamos usar isso para checar admin.

**Implicação**: O primeiro "admin" (você) precisa ser criado manualmente (ou via script/admin function).

### 6.2) Matriz de permissões (por coleção)

**Legenda:**

- **Público** = sem login
- **Cliente** = usuário autenticado (não admin)
- **Admin** = usuário com doc em `adminUsers/{uid}`

#### 6.2.1. products

- **read**: Público (para cardápio e página de produto)
- **write**: Admin (owner/editor)
- **delete**: preferir soft delete (isActive=false / archivedAt), então delete real pode ser bloqueado e só admin owner pode.

#### 6.2.2. productVariants

- **read**: Público
- **write**: Admin (owner/editor)

#### 6.2.3. kitsPreset

- **read**: Público
- **write**: Admin (owner/editor)

#### 6.2.4. neighborhoods

- **read**: Público (para seleção no checkout)
- **write**: Admin (owner/editor)

#### 6.2.5. siteContent

- **read**: Público
- **write**: Admin (owner/editor)

#### 6.2.6. config/\*

- **read**:
  - `config/delivery`: Público (para exibir agenda; opcional)
  - `config/commerce`: Público (para exibir frete grátis/tiers; opcional)
  - ou restringir leitura a autenticado se preferir esconder regras (não é essencial).
- **write**: Admin (owner/editor)
- **Observação crítica**: mesmo que config seja público, o cálculo final acontece no backend.

#### 6.2.7. coupons

- **read**:
  - Opção A (simples): Público (para "validar" e mostrar mensagens)
  - Opção B (mais segura): somente Authenticated, ou somente backend (via endpoint)
  - **Recomendação**: Auth-only (cliente logado).
- **write**: Admin (owner/editor)

#### 6.2.8. users/{uid}

- **read**: somente o próprio uid e Admin
- **write**: somente o próprio uid (campos permitidos) e Admin
- **Campos sensíveis**: birthDate, dietaryRestrictions — não podem ser públicos.
- **Subcoleção** `users/{uid}/addresses/{addressId}`:
  - **read/write**: somente o próprio uid e Admin
  - Validação mínima (não aceitar campos extras perigosos)

#### 6.2.9. orders/{orderId}

- **read**:
  - Cliente: somente se `order.userId == request.auth.uid`
  - Admin: pode ler todos
- **create**:
  - Cliente: permitido criar apenas se autenticado e `userId == request.auth.uid`
  - Porém: recomendamos que a criação final do pedido (principalmente `pricing.totalCents`) seja via backend.
- **update**:
  - Cliente: permitido apenas atualizar campos "inofensivos" antes do pagamento (ex.: notes) — idealmente nem isso.
  - Admin: pode atualizar status operacional
  - Backend/Webhook: atualiza pagamento/status (não é "role", é service account; implementação via Functions Admin SDK ignora rules)
- **delete**: bloqueado (preferir status cancelado)
- **Regra-chave**: Campos `payment.*` e `pricing.*` não podem ser alterados pelo cliente após criação.

#### 6.2.10. adminUsers/{uid}

- **read**: somente Admin (ou só o próprio uid; opcional)
- **write**: somente Admin owner (ou somente backend via Admin SDK)
- **Recomendação**: somente backend para write (mais seguro).

### 6.3) Validações mínimas nas Rules (shape)

As rules v1 devem:

- Bloquear escrita de campos desconhecidos (quando aplicável)
- Garantir que tipos básicos sejam coerentes
- Garantir que `updatedAt` avance (opcional)
- Garantir que `userId` em order == `auth.uid` (cliente)

**Observação**: Rules não são um "validador perfeito" para objetos complexos. Para validação completa, usar backend + schemas (Zod) no revere-backend.

### 6.4) Índices necessários

- Nenhum índice adicional específico para rules (os índices estão definidos na SPEC-001)

### 6.5) Regras de segurança (alto nível)

- Ver matriz de permissões acima (seção 6.2)

## 7) Segurança / LGPD

- **Dados pessoais coletados**: `birthDate`, `dietaryRestrictions`, endereços (subcoleção `users/{uid}/addresses`)
- **Minimização**: coletar apenas o necessário para operação do negócio (já aplicado)
- **Riscos e mitigação**:
  - **Risco**: exposição de dados pessoais via leitura pública
  - **Mitigação**: rules garantem que apenas o próprio usuário e admin podem ler `users/{uid}` e subcoleções
  - **Risco**: manipulação de preços/descontos pelo cliente
  - **Mitigação**: validação server-side obrigatória; rules bloqueiam alteração de campos críticos (`pricing.*`, `payment.*`)

## 8) Critérios de aceitação (checklist)

- [ ] Matriz de permissões definida para todas as coleções do schema v1
- [ ] Estratégia de admin v1 definida (adminUsers/{uid})
- [ ] Diretrizes claras do que o cliente nunca pode alterar (pricing, payment, status)
- [ ] Definido que Functions/Admin SDK executa ações privilegiadas (webhook MP, status etc.)
- [ ] Diretrizes LGPD: birthDate/restrições/endereço nunca públicos

## 9) Testes obrigatórios

### Unit/Emulador:

- Cliente não consegue ler `users/{outroUid}`
- Cliente não consegue ler orders de outros usuários
- Cliente não consegue escrever em `config/*`
- Cliente não consegue editar `payment.*`
- Admin consegue CRUD de products e productVariants
- Admin consegue ler todos os pedidos
- Cliente autenticado consegue criar order com `userId == auth.uid`
- Cliente não consegue alterar `pricing.*` após criação do pedido

### Integração:

- Validar que Functions com Admin SDK conseguem atualizar status de pagamento
- Validar que webhook do Mercado Pago consegue atualizar pedidos

### E2E smoke:

- Login → criar pedido → verificar que apenas o próprio usuário vê o pedido
- Admin login → verificar acesso a todos os pedidos e configurações
