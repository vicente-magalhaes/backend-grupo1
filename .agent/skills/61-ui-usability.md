# 61 — UI & Usabilidade (CNH Connect): padrões estilo Uber sobre base Apple

Lei de **interação e composição** de telas. Pareado com [`60-design-system.md`](60-design-system.md)
(tokens/estética). Tira da Uber a **clareza de fluxo e ação**, mantendo a estética Apple-clean.

## Princípios de usabilidade (Uber)
1. **Uma ação primária dominante por tela.** Botão `accent`, full-width, **ancorado embaixo** em telas de
   tarefa (Pagamento, Criar relatório, Enviar solicitação, Buscar). Tudo mais é secundário/ghost.
2. **Seleção sempre visível.** Item escolhido ganha **borda `accent` 2px + fundo `accentSoft`** (como o
   contorno do UberX selecionado). Nunca depender só de cor de texto.
3. **Poucos passos, progressivo.** Não despejar todos os campos: agrupar logicamente; revelar condicionais
   só quando relevantes (ex.: docs do veículo só se "tenho veículo").
4. **Feedback imediato:** háptico no toque do CTA e nos steppers; `Toast`/banner para sucesso/erro;
   `Skeleton` em listas (não spinner solto).
5. **Alvos grandes** (≥44px) e preço/valor à direita em negrito.

## Inventário de componentes (`frontend/src/components/`, com barrel `index.ts`)
`ui.tsx` vira **shim** (`export * from './index'`) até a migração terminar.

| Componente | Papel / origem |
|---|---|
| `Icon` | Wrapper Ionicons (ponto único de troca de ícones). |
| `Logo` | Volante SVG dois-C + wordmark (ver skill 60). Substitui `LogoPlaceholder`. |
| `Button` | Variantes `primary/outline/ghost/danger`; tamanhos `sm/md/lg`; `icon`, `loading`, `disabled`; **háptico** (guard `Platform.OS!=='web'`); press-scale (Reanimated). `PrimaryButton/OutlineButton` viram wrappers. |
| `Card` | Superfície branca, `radii.card`, `shadows.sm`; opcional `onPress` (press feedback). |
| `ListRow` | Linha estilo Settings: `[tile de Icon] título + subtítulo · valor à direita + chevron`. Base de perfis/listas. |
| `TextField` | Label, anel de foco `accent`, ícone esquerdo/direito, erro inline, toggle de senha. Substitui `Field`. |
| `Avatar` | Imagem / iniciais / ícone, circular, tamanhos. Substitui caixas "FOTO". |
| `Badge`/`Pill` | Pílula soft colorida. Mantém `StatusBadge` (labels/cores de status atuais). Inline "Cheaper/Good deal". |
| `SegmentedControl` | Escolha entre 2–4 opções (modalidade do veículo, categoria A/B) — estilo iOS. |
| `Chips` | Filtros multi-seleção (promove `Chip` do Search). |
| `Stars` | Display + variante interativa (`onChange`) p/ avaliar. |
| `ProgressBar` | Barra de progresso (promove `Bar` do StudentDashboard). Reuso em dashboards e relatório. |
| `Stepper` | +/- com valor e progresso (promove do CreateReport) + háptico. |
| `Header` | Cabeçalho de seção/large-title dentro de telas quando preciso. |
| `Skeleton` | Shimmer (Reanimated) p/ carregamento de listas. |
| `EmptyState` | Ícone + texto + ação opcional. |
| `Toast` / banner inline | Sucesso/erro/aviso (substitui blocos de `Text` vermelho). |
| `Screen` | Wrapper (safe-area, fundo `bg`, scroll opcional, slot de CTA fixo embaixo). |
| `Text/H1/Muted` | Tipados via `typography`. |

## Padrões de composição de tela
- **Tela-lista (Search, Bookings, Requests, Agenda, Reports):** large title → filtros (Chips/Segmented em
  card) → lista de `Card`/`ListRow` elevados. Carregando = `Skeleton`. Vazio = `EmptyState`.
- **Tela de detalhe (InstructorDetail):** header com `Avatar` + nome + `Stars`; meta em `ListRow`; lista de
  horários como itens **selecionáveis** (borda `accent` no escolhido); CTA fixo embaixo.
- **Tela de tarefa/checkout (Payment, CreateReport, InstructorRequest):** conteúdo rolável + **CTA primário
  fixo no rodapé** (com `shadows.md` separando do conteúdo). Resumo de valor à direita em negrito.
- **Chat:** bolhas (própria = `accent`/texto branco à direita; outra = `surface`/borda à esquerda),
  `KeyboardAvoidingView`, input em pílula + botões `Icon`; avaliação com `Stars` interativas.
- **Perfil (Student/Instructor):** seções em cards de `ListRow` (estilo Settings) + `Avatar` no topo;
  logout como `Button ghost/danger`.
- **Card de resultado (Search):** `[Avatar] nome + região/categoria + Stars · preço à direita`, `Card`
  pressable, badge de status quando aplicável.

## Navegação
- **Tab bar:** fundo `surface`, borda topo hairline (`separator`), altura ~56 + safe-area inset; ativo
  `accent` (ícone filled), inativo `textTertiary` (ícone outline); label Inter 500 `caption`.
- **Header:** fundo `surface`, título Inter 600 escuro, back `accent`, hairline embaixo;
  `headerLargeTitle: true` nas telas-lista de topo (iOS).
- Tema do `NavigationContainer` via `DefaultTheme` override centralizado em `src/navigation/navTheme.ts`.

## Anti-padrões (não fazer)
- ❌ Emoji como ícone · ❌ placeholder "LOGO"/"FOTO" · ❌ card só com borda sem sombra ·
  ❌ dois botões primários competindo na mesma tela · ❌ spinner central onde cabe `Skeleton` ·
  ❌ erro como texto vermelho solto · ❌ seleção indicada só por cor de texto.

## Acessibilidade
- `accessibilityRole`/`accessibilityLabel` nos `Button`/`ListRow`/`Icon` interativos.
- Contraste mínimo AA (texto `text` sobre `surface`/`bg` já passa). Não usar `textTertiary` para conteúdo
  essencial, só meta/placeholder.
