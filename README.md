# Site Revere - Workspace

Este é o repositório principal que orquestra o projeto Site Revere.

## Estrutura do Projeto

O projeto é organizado em múltiplos repositórios e diretórios especializados:

- **[revere-governance](./revere-governance/)**: Fonte de verdade do projeto. Contém `features.json`, `PROJECT_HISTORY.md`, especificações (SPECs), decisões arquiteturais (ADRs) e checklists.
- **[revere-storefront](./revere-storefront/)**: Aplicação pública da loja (Next.js).
- **[revere-admin](./revere-admin/)**: Painel administrativo (Next.js).
- **[revere-backend](./revere-backend/)**: Camada de backend, integrações e Firebase Functions.

## Governança

Todas as decisões técnicas, especificações de funcionalidades e acompanhamento do backlog residem em `revere-governance`. Consulte este diretório antes de iniciar qualquer desenvolvimento.

## Como usar este workspace

Se estiver usando VS Code, abra o arquivo `revere.code-workspace` para uma experiência integrada.
