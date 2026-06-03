# ADR-0003 — Pricing, kits e cupons

## Status

Aceita

## Contexto

O Site Revere precisa vender produtos avulsos e kits de refeições ultracongeladas com regras comerciais claras, seguras e administráveis.

O modelo inicial prevê:

- produtos avulsos;
- variações por gramatura;
- kits prontos;
- kits customizáveis;
- descontos progressivos por quantidade;
- cupons promocionais;
- checkout com pagamento via Mercado Pago;
- validação sensível de preço no backend.

Como preços, descontos e cupons afetam diretamente receita e pagamento, essas regras não podem depender apenas do frontend. O frontend pode exibir simulações e totais estimados, mas o backend deve recalcular e validar os valores finais antes da criação do pedido e da preferência de pagamento.

## Decisão

Adotar um modelo de precificação em que:

- cada produto possui uma ou mais variantes;
- cada variante possui preço próprio;
- kits podem ser prontos ou customizáveis;
- kits customizáveis aplicam desconto progressivo conforme quantidade de itens;
- cupons podem aplicar descontos conforme regras configuradas;
- o backend é a fonte final de verdade para cálculo de subtotal, descontos, frete e total;
- o pedido deve armazenar snapshots dos preços e descontos aplicados no momento da compra.

A regra inicial de desconto por quantidade para kits customizáveis será:

- 7 itens: 5%
- 10 itens: 7%
- 15 itens: 10%
- 20 itens: 13%
- acima de 20 itens: 15%

O frontend pode mostrar mensagens como “quanto falta para o próximo desconto”, mas o cálculo final deve ser validado no backend.

## Regras principais

### Produtos e variantes

- O produto representa o prato ou item principal.
- A variante representa opções como gramatura, tamanho ou configuração comercial.
- O preço de venda deve estar associado à variante.
- Produtos ou variantes inativos não podem ser comprados.
- O backend deve validar se todos os itens do carrinho continuam ativos antes de confirmar o pedido.

### Kits

- Kits prontos possuem composição definida previamente.
- Kits customizáveis permitem seleção de pratos pelo cliente.
- Kits customizáveis podem permitir repetição de pratos.
- A quantidade total de itens no kit define a faixa de desconto aplicável.
- O desconto deve ser aplicado sobre os itens elegíveis do kit.
- A composição final do kit deve ser armazenada no pedido.

### Cupons

- Cupons devem ter código único.
- Cupons podem ser ativos ou inativos.
- Cupons podem ter regras como:
  - percentual de desconto;
  - valor fixo de desconto;
  - validade por período;
  - valor mínimo de pedido;
  - limite de uso;
  - limite por cliente;
  - restrição por produto, kit ou categoria, se necessário no futuro.
- Cupons inválidos, expirados ou inativos não devem ser aplicados.
- O backend deve validar o cupom no momento do checkout.

### Totais e snapshots

O pedido deve armazenar snapshots suficientes para auditoria e suporte, incluindo:

- preço unitário aplicado;
- quantidade;
- subtotal por item;
- desconto de kit aplicado;
- cupom aplicado;
- desconto do cupom;
- frete aplicado;
- total final;
- versão/regra de pricing, se necessário.

Mudanças futuras em preços, kits ou cupons não devem alterar pedidos já realizados.

## Segurança

O cliente nunca deve poder alterar diretamente campos sensíveis de preço ou pagamento.

Campos como estes devem ser protegidos:

- `pricing.*`
- `payment.*`
- totais do pedido;
- desconto aplicado;
- status de pagamento;
- status financeiro;
- identificadores de transação;
- valores enviados ao Mercado Pago.

O backend deve recalcular os valores finais e rejeitar divergências relevantes entre carrinho enviado e valores esperados.

## Consequências

### Consequências positivas

- Reduz risco de manipulação de preço pelo cliente.
- Mantém histórico confiável dos pedidos.
- Permite promoções e cupons sem alterar código a cada campanha.
- Suporta crescimento gradual do catálogo.
- Permite kits customizáveis com lógica comercial clara.
- Facilita auditoria de pedidos, pagamentos e descontos.
- Mantém frontend focado em experiência e backend focado em validação.

### Trade-offs e riscos

- O cálculo de preço fica mais complexo no backend.
- É necessário testar muitas combinações de carrinho, kit e cupom.
- Mudanças nas regras comerciais exigem cuidado para não quebrar pedidos em andamento.
- O Admin precisa deixar claro quais regras estão ativas.
- Cupons mal configurados podem gerar perdas comerciais se não houver validações adequadas.

## Alternativas consideradas

### Calcular tudo apenas no frontend

Descartado por risco de manipulação de preço e inconsistência com pagamento.

### Não usar cupons no MVP

Considerado, mas cupons são úteis para campanhas de lançamento, parcerias e testes comerciais.

### Kits com preço fixo manual

Pode ser usado para kits prontos, mas não resolve bem kits customizáveis com descontos progressivos.

### Desconto único para qualquer quantidade

Descartado porque a estratégia comercial prevê incentivo progressivo para compras maiores.

## Fora de escopo

Esta ADR não define:

- layout final do kit builder;
- telas do Admin para cupons;
- implementação técnica do cálculo de preço;
- schema definitivo das coleções;
- integração detalhada com Mercado Pago;
- política final de campanhas promocionais;
- regras fiscais ou contábeis;
- conciliação financeira;
- estratégia de fidelidade/pontos.

Esses pontos serão tratados em SPECs próprias ou ADRs futuras.
