# ADR-0001 — Stack e repos

## Status

Aceita

## Contexto

O projeto Site Revere precisa sustentar uma operação de e-commerce para refeições saudáveis ultracongeladas, com catálogo, administração interna, checkout, entrega agendada, integrações de pagamento e evolução contínua.

Desde o início, o projeto foi organizado com governança explícita para evitar decisões soltas, retrabalho e perda de contexto. O repositório `revere-governance` funciona como fonte de verdade para specs, histórico, decisões arquiteturais, checklists e acompanhamento de features.

A arquitetura inicial precisa equilibrar:

- velocidade de implementação;
- clareza entre áreas do sistema;
- segurança para dados de clientes, pedidos e pagamentos;
- facilidade de deploy;
- autonomia futura para manutenção de catálogo e conteúdo;
- testes e gates desde o início.

## Decisão

Adotar a seguinte stack principal:

- **Next.js + TypeScript** para as aplicações web;
- **Firebase Authentication** para autenticação;
- **Firestore** como banco de dados principal;
- **Firebase Functions** para lógica backend, webhooks e validações sensíveis;
- **Cloud Run** para deploy das aplicações;
- **Firebase Storage** para imagens de produtos, banners e ativos operacionais.

O projeto será organizado em repos separados:

- `revere-governance`
- `revere-storefront`
- `revere-admin`
- `revere-backend`

### Papel de cada repo

#### `revere-governance`

Fonte de verdade do projeto.

Contém:

- `features.json`;
- `PROJECT_HISTORY.md`;
- specs;
- ADRs;
- checklists;
- prompts operacionais;
- decisões estruturais do projeto.

Nenhuma feature relevante deve ser implementada sem referência ao repo de governança.

#### `revere-storefront`

Aplicação pública da loja Revere.

Responsável por:

- home;
- catálogo;
- página de produto;
- carrinho;
- kit builder;
- checkout;
- área do cliente;
- experiência de compra.

#### `revere-admin`

Painel administrativo.

Responsável por:

- CRUD de produtos;
- variantes;
- categorias;
- tags;
- restrições alimentares;
- bairros e frete;
- banners;
- conteúdo do site;
- acompanhamento operacional.

Regra operacional: se o Admin não consegue alterar uma informação operacional, a equipe fica dependente de código.

#### `revere-backend`

Camada de backend e integrações.

Responsável por:

- Firebase Functions;
- regras sensíveis de negócio;
- validações de checkout;
- integração com Mercado Pago;
- webhooks;
- geração de slots válidos;
- proteção de campos críticos;
- auditoria e logs operacionais.

## Consequências

### Consequências positivas

- Separação clara entre loja, admin, backend e governança.
- Menor risco de misturar regra de negócio sensível com interface.
- Mais facilidade para testar, revisar e evoluir cada parte separadamente.
- Governança explícita desde o início.
- Melhor rastreabilidade de decisões.
- Facilita trabalho com agentes de IA, pois cada tarefa pode apontar para uma SPEC e um repo específico.
- Permite evolução futura sem reescrever toda a base.

### Trade-offs e riscos

- Mais repos aumentam a complexidade inicial.
- Exige disciplina para manter `revere-governance` atualizado.
- Mudanças que cruzam storefront, admin e backend exigem coordenação.
- O custo cognitivo inicial é maior do que em um monorepo simples.
- É necessário definir bem contratos entre frontend, admin e backend.

## Alternativas consideradas

### Monorepo único

Um único repo com storefront, admin, backend e governança.

Foi descartado neste momento porque poderia facilitar o início, mas aumentaria o risco de acoplamento e perda de clareza entre responsabilidades.

### Apenas Firebase Hosting + Functions

Foi considerado, mas o projeto prevê deploy em Cloud Run para maior flexibilidade operacional e alinhamento com a estratégia técnica definida no playbook.

### Backend mínimo sem repo separado

Foi descartado porque regras de pagamento, pedidos, frete, agendamento e segurança precisam de uma camada própria, testável e bem isolada.

## Fora de escopo

Esta ADR não define:

- schema completo do Firestore;
- regras finais de segurança;
- implementação do Mercado Pago;
- layout visual da loja;
- design system;
- estrutura final de CI/CD;
- estratégia completa de ambientes dev/prod;
- contratos detalhados de API.

Esses pontos serão tratados em SPECs e ADRs próprias.
