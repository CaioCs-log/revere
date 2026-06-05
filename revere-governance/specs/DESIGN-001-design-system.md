# DESIGN-001 — Design System Revere v1.0

## Status
Aprovado por Caio em 2026-06-04.

## 1. Objetivo
Estabelecer uma linguagem visual proprietária e consistente para o Site Revere, diferenciando a marca de serviços genéricos de refeição pronta, marmita fitness e delivery funcional sem identidade.

O sistema traduz a promessa **"Comida de verdade, explicada."** em foundations, tokens, componentes e padrões de interface para o `revere-storefront`.

## 2. Fontes da verdade
- **Brand Book Revere v2.0** — identidade visual, verbal e estratégica.
- **Diagnóstico Gemini CLI / Skill Impeccable** — direção visual e princípios de design.
- **Auditoria técnica Codex** — estrutura real do `revere-storefront`, Next.js 16 e Tailwind CSS 4.
- **DESIGN-001** — ponte operacional entre marca, interface e código.

## 3. Princípios do Design System Revere

### 3.1 Editorial, não transacional
A interface deve parecer uma curadoria de comida real e explicada, não apenas um carrinho de compras.

### 3.2 Transparência Radical
Informações relevantes devem aparecer com clareza. Ingredientes, origem, preparo e contexto nutricional não devem ficar escondidos.

### 3.3 Rigor acolhedor
A experiência deve combinar precisão técnica com calor humano: grid limpo, hierarquia clara, copy acessível e visual de cozinha real.

### 3.4 Praticidade com consciência
A interface deve ser rápida e objetiva, mas sempre reforçando escolha consciente, autonomia e clareza.

## 4. Foundations

### 4.1 Cores oficiais
Os HEX do Brand Book são a fonte da verdade.

| Papel | Cor | HEX |
| --- | --- | --- |
| Primária | Verde Revere | `#2E5D3A` |
| Secundária / fundo intenso | Verde Profundo | `#1F3E29` |
| Acento | Vermelho Revere | `#D44A2C` |
| Fundo principal | Creme Natural | `#FDFBF7` |
| Texto principal | Carvão | `#1C1C1C` |
| Texto auxiliar | Cinza Suave | `#6B6B6B` |

**Regra do vermelho:** Vermelho Revere é acento funcional e emocional. Pode aparecer em selos, microdestaques, palavras-chave e CTAs pontuais. Não deve ser usado como fundo dominante nesta fase.

**Regra do OKLCH:** OKLCH pode ser usado no CSS como derivação técnica para estados, interpolação e hover, desde que preserve equivalência visual com os HEX oficiais.

### 4.2 Tipografia
- **Fraunces** — títulos, hero, frases de impacto e elementos editoriais.
- **Inter** — corpo, navegação, botões, labels e textos funcionais.

Regras:
- H1 e H2 devem usar Fraunces.
- UI funcional deve usar Inter.
- Evitar pesos muito finos.
- `next/font` deve ser a fonte de verdade técnica no Next.js.
- O `body` não deve sobrescrever a tipografia com stack genérico como Arial.

### 4.3 Spacing e layout
- Grid: 12 colunas em desktop; 4 colunas em mobile.
- Escala base: `4px`, `8px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`.
- Container: máximo aproximado de `1280px`, com padding lateral responsivo.
- Seções devem padronizar espaçamento vertical, largura e pilha de heading.

### 4.4 Radius e superfícies
- Cards e containers grandes: `12px`.
- Botões e badges: `9999px` / pill.
- Superfícies devem usar bordas sutis e contraste claro.
- Evitar sombras largas e genéricas; preferir bordas de baixa opacidade e profundidade discreta.

### 4.5 Acessibilidade
- Contraste mínimo AA para texto normal.
- Foco visível obrigatório.
- CTAs focáveis e semanticamente corretos.
- Não depender só de cor para transmitir estado.
- Headings devem manter hierarquia coerente.

## 5. Tokens semânticos recomendados
Tokens devem ser baseados em função, não em página.

### 5.1 Cores
- `--color-brand-primary`
- `--color-brand-strong`
- `--color-brand-accent`
- `--color-surface-base`
- `--color-surface-muted`
- `--color-surface-strong`
- `--color-text-main`
- `--color-text-muted`
- `--color-border`
- `--color-focus`

### 5.2 Tipografia
- `--font-display`
- `--font-sans`

### 5.3 Layout
- `--container-default`
- `--container-narrow`
- `--container-wide`

### 5.4 Radius
- `--radius-sm`
- `--radius-md`
- `--radius-lg`
- `--radius-pill`

### 5.5 Spacing
- `--space-1`
- `--space-2`
- `--space-4`
- `--space-6`
- `--space-8`
- `--space-12`
- `--space-16`
- `--space-24`

## 6. Componentes P0 — essenciais

### Button
Função: CTAs primários, secundários, outline, ghost e link.

Variantes:
- `primary`
- `secondary`
- `outline`
- `ghost`

### Container
Função: padronizar largura máxima e gutters.

Variações:
- `default`
- `narrow`
- `wide`

### Section
Função: padronizar blocos verticais da página.

Variações:
- `default`
- `muted`
- `brand`
- `dark`

### Heading
Função: padronizar hierarquia editorial com Fraunces.

Variações:
- `display`
- `section`
- `card`

### Text
Função: corpo, apoio, caption e labels com Inter.

Variações:
- `body`
- `muted`
- `caption`
- `eyebrow`

### Card
Função: superfície base para produtos, kits, notices e blocos editoriais.

Variações:
- `default`
- `muted`
- `elevated`

### Surface
Função: blocos de fundo e separadores visuais.

Variações:
- `base`
- `muted`
- `brand`
- `dark`

## 7. Componentes P1 — identidade

### Badge / Selo
Função: categorias, atributos operacionais e informações validadas.

Exemplos seguros:
- "Congelado"
- "Entrega agendada"
- "Prato da semana"
- "Naturalmente"

Alegações como "sem glúten", "sem lactose", "rico em proteína" ou "sem conservantes" exigem validação técnica.

### ImagePlaceholder
Função: tratar ausência de fotos reais sem parecer erro.

Direção:
- textura sutil de papel ou superfície orgânica;
- gradiente controlado;
- cores de marca;
- sem SVG abstrato complexo nesta fase.

### ProductCard
Função: exibir prato com nome, descrição, preço inicial, badges e CTA compatível com o estágio atual.

CTAs permitidos nesta fase:
- "Ver prato"
- "Ver ingredientes"
- "Receber cardápio"

Não usar "Comprar" enquanto checkout estiver fora do escopo.

### KitCard
Função: exibir kit ou bundle com proposta, faixa de itens e benefício.

### CTA
Função: bloco composto de título, texto e ação.

Variações:
- `inline`
- `banner`
- `final`

### StepItem
Função: representar etapas como "Escolha", "Confirme", "Receba", "Aqueça".

### DeliveryNotice
Função: exibir prazo, área de entrega, regra operacional ou informação logística.

## 8. Componentes P2 — experiência

### Header
Navegação principal com logo, links e CTA.

### Footer
Links institucionais, contato, redes e assinatura da marca.

### IngredientInsight
Bloco curto explicando o porquê de um ingrediente.

### NutritionNote
Resumo nutricional estilizado, sempre condicionado à validação técnica.

### TrustBlock
Seção de confiança.

Regra: não usar depoimentos, avaliações ou prova social de clientes sem evidência real. Enquanto não houver depoimentos reais, focar em processo, validação técnica, entrega local, transparência e Informação como Ingrediente.

### WeekMenuPreview
Preview do cardápio da semana.

## 9. Regras de conteúdo e microcopy

### Tom
Informativo, direto, acolhedor e seguro.

### CTAs
Usar verbo + objeto:
- "Explorar cardápio"
- "Receber cardápio"
- "Ver ingredientes"
- "Montar meu kit"
- "Conhecer a Revere"

### Termos preferidos
- "Prato"
- "Comida"
- "Refeição"
- "Comida de verdade"
- "Explicada"
- "Naturalmente"
- "Você escolhe"

### Termos proibidos ou sensíveis
Evitar:
- "marmita fit"
- "detox"
- "queima gordura"
- "transforme seu corpo"
- "dieta"
- promessas clínicas ou de saúde sem validação

### Regra nutricional
Qualquer alegação nutricional, funcional, regulatória ou de saúde exige validação técnica antes de publicação.

## 10. Aplicação na Home STORE-001
A Home atual já cumpre a função estrutural e consome `MockRegistry`, mas ainda não deve ser considerada visualmente final.

### O que manter
- Estrutura em seções.
- Consumo via `MockRegistry`.
- Ordem geral dos blocos.
- Separação entre Hero, Como funciona, Produtos, Kits, Entrega e CTA final.

### O que evoluir
- Aplicar fundo Creme Natural.
- Aplicar Fraunces nos headings.
- Aplicar Inter no corpo e UI.
- Trocar placeholders cinzas por `ImagePlaceholder`.
- Substituir CTAs genéricos por linguagem de marca.
- Reduzir repetição de classes locais.
- Usar componentes P0 e P1.

## 11. Fases de implementação

### Fase 1 — Documento e foundations
Concluir DESIGN-001 e travar decisões de base.

### Fase 2 — Tokens e globals
Implementar tokens via CSS variables / Tailwind v4 `@theme`, respeitando a estrutura real do projeto. Criar `tailwind.config.ts` somente se tecnicamente necessário.

### Fase 3 — Componentes P0
Implementar `Button`, `Container`, `Section`, `Heading`, `Text`, `Card` e `Surface`.

### Fase 4 — Componentes P1
Implementar `Badge`, `ImagePlaceholder`, `ProductCard`, `KitCard`, `CTA`, `StepItem` e `DeliveryNotice`.

### Fase 5 — Home refresh
Refatorar a Home STORE-001 para usar o Design System mínimo, sem alterar escopo funcional.

### Fase 6 — Catálogo e produto
Aplicar padrões em catálogo, produto, kits e páginas futuras.

## 12. Critérios de aceite
- Superfícies principais não usam branco puro como fundo dominante.
- H1 e H2 usam Fraunces.
- Corpo e UI usam Inter.
- Contraste AA respeitado.
- Focus rings visíveis.
- Componentes seguem radius definido.
- Home continua consumindo `MockRegistry`.
- Componentes de UI não dependem de `MockRegistry`.
- `format:check`, `lint`, `test`, `build` e `test:e2e`, quando disponíveis, passam.
- Sem criação de rotas fora do escopo.
- Sem checkout, Firestore real, Cloud Functions, Storage, deploy ou push.

## 13. Riscos e bloqueios

### Imagens
A ausência de fotos reais pode tornar a interface monótona. Placeholders devem parecer intencionais, mas não substituir fotografia real no longo prazo.

### Fontes
Fraunces e Inter devem ser otimizadas via `next/font` para evitar CLS.

### CSS global
O Design System não deve virar acoplamento excessivo em `globals.css`.

### MockRegistry
Componentes de UI não devem depender diretamente de `MockRegistry` ou de `SiteContentBlock`.

### Prova social
Não criar depoimentos, avaliações ou claims sem evidência.

### Nutrição
Claims nutricionais precisam de validação técnica.

## 14. Decisões fechadas
- Vermelho Revere é acento, não fundo dominante.
- HEX oficiais continuam fonte da verdade.
- OKLCH pode ser derivado técnico.
- Placeholders devem usar textura/superfície editorial sutil.
- Ícones: usar Lucide como padrão provisório, se tecnicamente viável.
- Motion: mínimo, funcional e acessível.
- Logo: usar ativo oficial; não redesenhar.
- Execução visual da Home só ocorre depois de tokens/foundations.

## 15. Perguntas ainda abertas
1. O ativo oficial do logo em SVG já está disponível no repo?
2. Lucide já está instalado ou deve ser adicionado?
3. O `test:e2e` deve ser endurecido já na fase de foundations ou apenas no refresh da Home?
4. O Design System será versionado também em `revere-governance` depois da aprovação no Notion?
