# Proposta — Firestore Rules v2

## Objetivo

Rascunhar uma proposta de **Firestore Rules v2** para o Site Revere, reconciliando a `SPEC-002 — Firestore Rules v1` com o schema vigente da `SPEC-003 — Firestore Schema v2`.

Esta página é uma proposta documental. Ela **não implementa** `firestore.rules`, não altera repositórios e não substitui validação de Backend/Cloud Functions quando a frente Blaze/Functions for destravada.

> **Decisões aprovadas por Caio — 2026-06-05 00:12 BRT (P-033)**
> As 4 pendências da proposta foram decididas e **confirmam o arquivo `firestore.rules` v2 exatamente como está** — nenhuma alteração no código das regras é necessária.
>
> 1. **Cupons:** leitura **admin-only** (Opção A). Cliente não lê `coupons`; toda validação de cupom fica no Backend.
> 2. **Mudança de `role`:** **somente o `owner` (Caio)**. Admin não altera `role` de ninguém.
> 3. **Edição de pedido pelo cliente (`notes.customerNote`):** **não** no MVP. Após o pedido gerado, qualquer alteração passa pelo atendimento; reavaliar a necessidade no futuro.
> 4. **Criação de `users`:** cadastro pela loja **sempre nasce como `customer`**. Funcionários/colaboradores (`admin`/`owner`) são criados **manualmente pelo owner** — reforça o modelo de admin manual da §16.7.
>
> Encaminhamento: Codex aplica esta versão como arquivo documental em `revere-governance` (via DOC-002); implementação em `revere-backend` em rodada técnica posterior, com Emulator e sem deploy.

---

## Status

- **Tipo:** proposta documental
- **Fase:** segurança / governança
- **Origem:** P-033 — Produzir Rules v2 alinhada à SPEC-003
- **Base histórica:** SPEC-002 Rules v1
- **Base vigente:** SPEC-003 Schema v2
- **Destino futuro:** repo `revere-governance`, depois `revere-backend` quando houver tarefa técnica própria
- **Não inclui:** implementação, deploy, Firebase Console, Cloud Functions, Storage, Secrets Manager ou alterações em repositórios

---

## Principais correções em relação à Rules v1

A Rules v2 deve corrigir os seguintes desalinhamentos da SPEC-002:

1. **Autorização administrativa**
   - Antes: `adminUsers/{uid}`.
   - Agora: `users/{uid}.role`, com valores `customer`, `admin` e `owner`.
   - Salvaguarda obrigatória: cliente nunca pode criar ou alterar o próprio `role`.
2. **Coleção de kits**
   - Antes: `kitsPreset`.
   - Agora: `kitPresets`.
3. **Endereços**
   - Antes: subcoleção `users/{uid}/addresses/{addressId}`.
   - Agora: array embutido em `users.addresses`.
4. **Dados sensíveis de nutrição**
   - Antes: considerava `dietaryRestrictions`.
   - Agora: restrições alimentares e preferências sensíveis **não são coletadas no MVP** pela loja Revere.
5. **Pedidos**
   - Antes: status e fluxo genéricos.
   - Agora: pedido nasce como `pending_payment`; confirmação real vem de Backend/webhook; status atuais são:
     - `pending_payment`
     - `confirmed`
     - `in_production`
     - `ready_for_delivery`
     - `out_for_delivery`
     - `delivered`
     - `cancelled`
     - `refunded`

---

## Modelo de papéis

```typescript
role: "customer" | "admin" | "owner";
```

### Regras conceituais

- `customer`: usuário autenticado comum.
- `admin`: pode operar o Admin, catálogo, conteúdo, pedidos e configurações operacionais.
- `owner`: pode operar como admin e, futuramente, administrar permissões sensíveis.
- Usuários admin/owner são criados manualmente no MVP via console/script controlado.
- Em produção futura, migrar para custom claims como blindagem adicional quando Cloud Functions/Blaze estiverem disponíveis.

### Helpers conceituais para Rules

```javascript
function signedIn() {
  return request.auth != null;
}

function isSelf(uid) {
  return signedIn() && request.auth.uid == uid;
}

function currentUserDoc() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid));
}

function currentRole() {
  return signedIn() && exists(/databases/$(database)/documents/users/$(request.auth.uid))
    ? currentUserDoc().data.role
    : null;
}

function isAdmin() {
  return currentRole() in ["admin", "owner"];
}

function isOwner() {
  return currentRole() == "owner";
}
```

Observação: a implementação final deve validar o custo e a viabilidade dos `get()`/`exists()` nas queries reais.

---

## Coleções públicas de leitura

As coleções abaixo podem ter leitura pública limitada ao conteúdo publicável:

- `products`
- `productVariants`
- `categories`
- `tags`
- `kitPresets`
- `neighborhoods`
- `siteContent`

### Regra conceitual

O público pode ler apenas documentos em estado publicável.

Exemplos:

- `products`: ler se `status == "active"` e `isVisible == true`.
- `productVariants`: ler se `status == "active"` e `isVisible == true`.
- `categories`: ler se `status == "active"`.
- `tags`: ler se `status == "active"` e pelo menos uma flag pública permitir exibição.
- `kitPresets`: ler se `status == "active"`.
- `neighborhoods`: ler se `status == "active"`.
- `siteContent`: ler se `status == "published"` e respeitar janela de publicação no Storefront/Backend.

### Escrita

- Escrita nessas coleções: somente `admin` ou `owner`.
- Delete físico: bloquear no MVP.
- Remoção operacional: via `status`, `isVisible` ou equivalente, preservando histórico e integridade referencial.

---

## Coleções administrativas

### `coupons`

Recomendação para v2:

- leitura pública: **não recomendada**;
- leitura por cliente autenticado: opcional e limitada, se necessário para UX;
- validação real: Backend;
- escrita: somente `admin` ou `owner`;
- delete físico: bloqueado no MVP.

Motivo: cupons afetam preço e podem expor regras comerciais.

### Configurações futuras

Se houver documentos de configuração (`config/*`) no futuro:

- leitura pública apenas para configurações não sensíveis;
- escrita somente `admin` ou `owner`;
- cálculos finais de frete, cupom, desconto e total continuam no Backend.

---

## `users/{uid}`

### Leitura

- O próprio usuário pode ler seu documento.
- `admin` e `owner` podem ler usuários para operação, suporte e auditoria.

### Criação

- Usuário autenticado pode criar apenas o próprio documento: `request.auth.uid == uid`.
- Na criação por cliente, `role` deve ser sempre `customer` ou ausente com default seguro aplicado pela aplicação controlada.
- Cliente não pode criar `role: "admin"` nem `role: "owner"`.

### Atualização pelo cliente

Cliente pode atualizar apenas campos seguros do próprio perfil, como:

- `name`
- `phone`
- `birthDate`
- `addresses`
- `defaultAddressId`
- `marketingOptIn`
- `termsAcceptedAt`
- `privacyAcceptedAt`

Cliente **não pode** alterar:

- `role`
- `status` para se desbloquear
- `pointsBalance`
- `referralCode` sem regra controlada
- `referredBy` sem regra controlada
- `createdAt`
- campos de auditoria protegidos

### Atualização por admin/owner

- `admin` e `owner` podem atualizar dados operacionais necessários.
- Mudança de `role` deve ser restrita ao `owner` ou, preferencialmente, ao Backend/Admin SDK.
- Bloqueio/desbloqueio de usuário deve ser `owner` ou fluxo administrativo controlado.

### LGPD

- Restrições alimentares e preferências sensíveis não entram no MVP.
- Se forem adicionadas no futuro, exigem consentimento explícito, política própria e revisão técnica/jurídica.

---

## `orders/{orderId}`

### Leitura

- Cliente autenticado pode ler apenas pedidos em que `resource.data.userId == request.auth.uid`.
- `admin` e `owner` podem ler todos os pedidos.

### Criação

A recomendação mais segura é que pedidos reais sejam criados pelo Backend.

Enquanto não houver Backend final:

- cliente autenticado só pode criar pedido com `userId == request.auth.uid`;
- pedido deve nascer como `pending_payment`;
- cliente não pode marcar pagamento como aprovado;
- cliente não pode criar pedido como `confirmed`;
- valores enviados pelo cliente não devem ser tratados como fonte final de verdade.

### Atualização pelo cliente

Cliente não deve atualizar campos críticos do pedido.

Bloquear para cliente:

- `status`
- `payment`
- `pricing`
- `items`
- `coupon`
- `deliveryFeeCents` / campos equivalentes de frete
- `statusHistory`
- `audit`
- `confirmedAt`
- `cancelledAt`

Se for necessário permitir alteração do cliente no MVP, limitar a campos de baixo risco antes do pagamento, como `notes.customerNote`.

### Atualização por admin/owner

- `admin` e `owner` podem alterar status operacional.
- Toda mudança de status deve registrar item em `statusHistory`.
- Cancelamento exige motivo.
- Correção manual de exceções é permitida, mas deve ficar auditável.

### Backend/webhook

- Confirmação de pagamento Mercado Pago deve vir de Backend/webhook.
- Admin SDK ignora Rules, portanto a segurança do fluxo de webhook deve ser tratada no Backend.
- O frontend nunca marca pedido como pago ou confirmado.

### Delete

- Delete físico bloqueado.
- Cancelamento via `status = "cancelled"` com auditoria.

---

## `firestore.rules` — proposta completa (v2)

Proposta de arquivo `firestore.rules` (texto, **sem deploy**) cobrindo todas as coleções da SPEC-003 e o modelo de autorização `users.role` (§16.7). Esta é a entrega revisável de P-033 — o revisor Codex aplica/valida em `revere-governance` e, em rodada técnica posterior, em `revere-backend`.

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // =========================================================
    // Helpers de autorização (modelo users.role — SPEC-003 16.7)
    // =========================================================
    function signedIn() {
      return request.auth != null;
    }

    function isSelf(uid) {
      return signedIn() && request.auth.uid == uid;
    }

    function hasUserDoc() {
      return signedIn()
        && exists(/databases/$(database)/documents/users/$(request.auth.uid));
    }

    // Lê o role do próprio usuário; default seguro 'customer' se não houver doc
    function selfRole() {
      return hasUserDoc()
        ? get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role
        : 'customer';
    }

    function isAdmin() {
      return selfRole() in ['admin', 'owner'];
    }

    function isOwner() {
      return selfRole() == 'owner';
    }

    // Campos que o próprio cliente pode editar em users/{uid}
    function clientSafeUserFields() {
      return [
        'name', 'phone', 'birthDate', 'addresses', 'defaultAddressId',
        'marketingOptIn', 'termsAcceptedAt', 'privacyAcceptedAt',
        'updatedAt', 'lastLoginAt'
      ];
    }

    // =========================================================
    // Catálogo público (leitura filtrada por estado publicável).
    // A condição pública vem ANTES de isAdmin() para evitar get()
    // desnecessário em documentos públicos.
    // Para LISTAGENS, o Storefront DEVE consultar com filtros
    // (ex.: where('status','==','active').where('isVisible','==',true)).
    // Consultas sem esses filtros são negadas — comportamento seguro.
    // =========================================================

    match /products/{productId} {
      allow read: if (resource.data.status == 'active' && resource.data.isVisible == true)
        || isAdmin();
      allow create, update: if isAdmin();
      allow delete: if false;
    }

    match /productVariants/{variantId} {
      allow read: if (resource.data.status == 'active' && resource.data.isVisible == true)
        || isAdmin();
      allow create, update: if isAdmin();
      allow delete: if false;
    }

    match /categories/{categoryId} {
      allow read: if resource.data.status == 'active' || isAdmin();
      allow create, update: if isAdmin();
      allow delete: if false;
    }

    match /tags/{tagId} {
      allow read: if resource.data.status == 'active' || isAdmin();
      allow create, update: if isAdmin();
      allow delete: if false;
    }

    match /kitPresets/{kitId} {
      allow read: if resource.data.status == 'active' || isAdmin();
      allow create, update: if isAdmin();
      allow delete: if false;
    }

    match /neighborhoods/{neighborhoodId} {
      allow read: if resource.data.status == 'active' || isAdmin();
      allow create, update: if isAdmin();
      allow delete: if false;
    }

    match /siteContent/{contentId} {
      // Janela de publicação (displayRules.startsAt/endsAt) é aplicada
      // no Storefront/Backend, não nas Rules.
      allow read: if resource.data.status == 'published' || isAdmin();
      allow create, update: if isAdmin();
      allow delete: if false;
    }

    // =========================================================
    // Cupons — NÃO públicos; validação real sempre no Backend
    // =========================================================
    match /coupons/{couponId} {
      allow read: if isAdmin();
      allow create, update: if isAdmin();
      allow delete: if false;
    }

    // =========================================================
    // users/{uid} — perfil do cliente. Salvaguardas da 16.7.
    // =========================================================
    match /users/{uid} {
      allow get: if isSelf(uid) || isAdmin();
      allow list: if isAdmin();

      // Cliente só cria o próprio doc e NUNCA como admin/owner
      allow create: if isSelf(uid)
        && request.resource.data.authUid == uid
        && request.resource.data.get('role', 'customer') == 'customer'
        && request.resource.data.get('status', 'active') == 'active';

      allow update: if
        // Cliente: só campos seguros; role e status imutáveis
        (isSelf(uid)
          && request.resource.data.diff(resource.data).affectedKeys()
               .hasOnly(clientSafeUserFields())
          && request.resource.data.role == resource.data.role
          && request.resource.data.status == resource.data.status)
        // Admin: opera dados do usuário, mas NÃO altera role
        || (isAdmin()
          && request.resource.data.role == resource.data.role)
        // Owner: pode alterar role (em produção, migrar p/ custom claims/Backend)
        || isOwner();

      allow delete: if false;
    }

    // =========================================================
    // orders/{orderId} — pedidos
    // =========================================================
    match /orders/{orderId} {
      // Cliente lê só os próprios; admin/owner leem todos.
      // Para listar, o cliente DEVE consultar where('userId','==', auth.uid).
      allow read: if isAdmin()
        || (signedIn() && resource.data.userId == request.auth.uid);

      // Criação por cliente apenas como pending_payment e para si mesmo.
      // Recomendação: criar pedido real via Backend quando Functions/Blaze.
      // Rules NÃO validam pricing/coupon/frete — isso é do Backend.
      allow create: if isAdmin()
        || (signedIn()
          && request.resource.data.userId == request.auth.uid
          && request.resource.data.status == 'pending_payment'
          && request.resource.data.payment.status == 'pending');

      // Cliente não atualiza pedido no MVP. Admin/owner operam com auditoria
      // (statusHistory/audit), preferencialmente via Backend.
      allow update: if isAdmin();

      allow delete: if false;
    }

    // =========================================================
    // Bloqueio padrão para qualquer coleção não declarada
    // =========================================================
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Notas de implementação do arquivo

- **Listagens (`list`)**: as Rules avaliam `resource.data` por documento. Para o catálogo e para pedidos do cliente, o cliente precisa enviar os filtros corretos na query (`where(status/isVisible)` no catálogo; `where('userId','==', uid)` em pedidos). Queries sem filtro são negadas — isso é intencional e seguro.
- **Custo de `get()`**: `isAdmin()`/`isOwner()` fazem um `get()` em `users/{uid}`. A condição pública aparece antes de `isAdmin()` para não gerar leitura extra em documentos públicos. O Firestore faz cache desses acessos por avaliação (limite de 10 acessos de documento por regra).
- **Criação de usuário**: a app deve criar `users/{uid}` sem `role` elevado; `get('role','customer')` garante que cliente não nasça `admin`/`owner`.
- **Pedidos**: as Rules garantem dono/estado inicial, mas preço, frete, cupom, desconto de kit, `orderNumber`, idempotência e confirmação de pagamento continuam responsabilidade do Backend.
- **Owner muda role**: hoje permitido só ao `owner` via Rules; em produção, migrar para custom claims/Admin SDK como blindagem adicional.

---

## Matriz resumida de permissões

| Coleção           | Leitura pública   | Cliente autenticado      | Admin/Owner             | Delete físico |
| ----------------- | ----------------- | ------------------------ | ----------------------- | ------------- |
| `products`        | Ativos e visíveis | Ativos e visíveis        | CRUD lógico             | Bloqueado     |
| `productVariants` | Ativas e visíveis | Ativas e visíveis        | CRUD lógico             | Bloqueado     |
| `categories`      | Ativas            | Ativas                   | CRUD lógico             | Bloqueado     |
| `tags`            | Ativas públicas   | Ativas públicas          | CRUD lógico             | Bloqueado     |
| `kitPresets`      | Ativos            | Ativos                   | CRUD lógico             | Bloqueado     |
| `neighborhoods`   | Ativos            | Ativos                   | CRUD lógico             | Bloqueado     |
| `siteContent`     | Publicado         | Publicado                | CRUD lógico             | Bloqueado     |
| `coupons`         | Não recomendado   | Limitado/opcional        | CRUD lógico             | Bloqueado     |
| `users`           | Não               | Somente próprio perfil   | Operação/suporte        | Bloqueado     |
| `orders`          | Não               | Somente próprios pedidos | Operação total auditada | Bloqueado     |

---

## Validações mínimas nas Rules

Rules v2 deve validar, no mínimo:

- autenticação para dados privados;
- `request.auth.uid == uid` em `users/{uid}`;
- cliente não altera `role`;
- cliente não altera `pointsBalance` e campos administrativos;
- cliente não lê usuário de outro cliente;
- cliente não lê pedido de outro cliente;
- cliente não cria pedido para outro `userId`;
- cliente não altera `payment`, `pricing`, `status` ou `statusHistory`;
- Admin/owner consegue operar coleções administrativas;
- delete físico bloqueado nas coleções principais do MVP;
- conteúdo público só expõe documentos publicáveis.

---

## O que NÃO deve depender apenas de Rules

As Firestore Rules não devem ser a única defesa para:

- cálculo de preço final;
- desconto progressivo de kits;
- cupom;
- frete;
- lead time;
- janela/turno de entrega;
- confirmação de pagamento;
- geração de `orderNumber`;
- idempotência de webhook;
- validação de composição de kit;
- aplicação de frete grátis;
- controle de uso de cupom;
- qualquer transição crítica de pedido.

Esses pontos devem ser validados no Backend quando Cloud Functions/Blaze forem destravados.

---

## Testes recomendados no Emulator

### Acesso público

- Público lê apenas produtos ativos e visíveis.
- Público não lê produto `draft`, `inactive` ou `archived`.
- Público não lê variante invisível.
- Público lê apenas `siteContent` publicado.

### Usuários

- Cliente cria apenas `users/{seuUid}`.
- Cliente não cria `role: "admin"` nem `role: "owner"`.
- Cliente não altera `role`.
- Cliente não lê `users/{outroUid}`.
- Admin lê usuários.

### Pedidos

- Cliente lê apenas próprios pedidos.
- Cliente não lê pedido de outro usuário.
- Cliente não cria pedido para outro `userId`.
- Cliente não cria pedido já `confirmed`.
- Cliente não altera `payment.status`.
- Cliente não altera `pricing.totalCents`.
- Cliente não altera `statusHistory`.
- Admin altera status e registra histórico.
- Delete físico de pedido é bloqueado.

### Admin

- Admin cria/edita/inativa produtos, variantes, categorias, tags, kits, bairros e conteúdo.
- Cliente comum não escreve em coleções administrativas.
- Owner consegue executar ações sensíveis definidas para provisionamento.

---

## Critérios de aceite da futura Rules v2

- [ ] Modelo de autorização via `users.role` documentado e implementado.
- [ ] Cliente impedido de criar/alterar `role`.
- [ ] `adminUsers` removido da estratégia vigente.
- [ ] `kitPresets` usado como coleção correta.
- [ ] Endereços tratados como array embutido em `users`.
- [ ] Restrições alimentares excluídas do MVP.
- [ ] Pedidos protegidos contra alteração de pagamento/preço/status pelo cliente.
- [ ] Delete físico bloqueado para coleções principais.
- [ ] Leitura pública limitada a dados publicáveis.
- [ ] Backend identificado como fonte final para preço, frete, cupom, pagamento e status crítico.
- [ ] Testes no Firebase Emulator criados antes de deploy.
- [ ] Nenhum deploy de Rules em produção sem validação em dev.

---

## Próximo encaminhamento recomendado

1. Caio/Psiu revisam esta proposta.
2. Agente CLI transforma a proposta aprovada em arquivo documental no `revere-governance`.
3. Em rodada técnica posterior, implementar `firestore.rules` no `revere-backend`.
4. Testar primeiro com Auth Emulator e Firestore Emulator.
5. Só avaliar deploy após Blaze/regiões/budget estarem confirmados.
