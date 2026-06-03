# ADR-0002 — Entrega, frete e agenda

## Status

Aceita

## Contexto

O Site Revere precisa operar entregas em Blumenau com previsibilidade operacional, controle de lead time e uma experiência simples para o cliente no checkout.

A operação inicial não deve depender de cálculo dinâmico complexo de frete, integração logística externa ou janelas abertas sem controle. A prioridade é garantir clareza para o cliente e segurança operacional para produção, separação, expedição e entrega.

O modelo inicial previsto no playbook define:

- entrega em Blumenau;
- frete fixo por bairro;
- lista administrável de bairros atendidos;
- agendamento por dia da semana e turno;
- lead time mínimo de 5 dias;
- validação das regras no backend;
- manutenção das regras pelo Admin sempre que possível.

## Decisão

Adotar, na versão inicial, um modelo de entrega baseado em:

- bairros cadastrados;
- taxa fixa de frete por bairro;
- possibilidade futura de frete grátis acima de determinado valor;
- agenda de entrega por dia da semana;
- turnos de entrega configuráveis;
- lead time mínimo de 5 dias;
- geração de slots válidos pelo backend;
- validação final de bairro, frete e agenda no backend antes da confirmação do pedido.

O cliente deverá selecionar o bairro e uma janela de entrega válida durante o checkout.

O sistema não deve confiar apenas nos dados enviados pelo frontend. Valores como taxa de frete, disponibilidade de bairro e validade do slot devem ser recalculados ou validados no backend.

## Regras principais

- O cliente só pode escolher bairros ativos.
- Cada bairro possui uma taxa de frete configurada.
- O Admin deve conseguir ativar, desativar ou alterar bairros e taxas.
- O pedido deve respeitar lead time mínimo de 5 dias.
- O backend deve impedir agendamentos inválidos.
- O backend deve impedir alteração maliciosa de taxa de frete enviada pelo cliente.
- O pedido deve armazenar o snapshot da taxa de frete aplicada no momento da compra.
- Alterações futuras em bairros ou taxas não devem modificar pedidos já realizados.

## Consequências

### Consequências positivas

- Modelo simples de operar no MVP.
- Clareza para o cliente durante o checkout.
- Menor dependência de integrações externas.
- Redução de erro operacional na separação e entrega.
- Permite crescimento gradual por bairros atendidos.
- Facilita configuração pelo Admin.
- Mantém regras sensíveis protegidas no backend.

### Trade-offs e riscos

- Frete fixo por bairro é menos preciso do que cálculo por distância.
- Pode haver casos em que um bairro grande tenha custos internos diferentes.
- Exige manutenção manual da lista de bairros.
- A disponibilidade de agenda precisa ser bem controlada para evitar sobrecarga operacional.
- Mudanças em dias/turnos precisam ser refletidas com cuidado para não afetar pedidos existentes.

## Alternativas consideradas

### Frete por distância ou CEP

Foi considerado, mas descartado para o MVP por aumentar a complexidade técnica e operacional.

### Integração com operador logístico externo

Fica fora do MVP. A operação inicial será controlada internamente.

### Agenda livre escolhida pelo cliente

Foi descartada porque reduz previsibilidade e pode gerar pedidos impossíveis de atender.

## Fora de escopo

Esta ADR não define:

- layout final do checkout;
- implementação técnica dos slots;
- schema definitivo das coleções;
- regras finais de Firestore;
- integração com mapas ou geolocalização;
- cálculo dinâmico por distância;
- política comercial final de frete grátis;
- operação logística detalhada fora do sistema.

Esses pontos serão tratados em SPECs próprias ou em ADRs futuras.
