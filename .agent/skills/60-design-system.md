# 60 — Design System (CNH Connect): Apple-clean + acento azul

Lei de design para o frontend (Expo/React Native). Objetivo: cara de **app iOS nativo** (Apple HIG),
base neutra clara, respiro equilibrado, **sombras sutis**, cantos médios. Acento **azul** (não o preto
da Uber). Pareado com [`61-ui-usability.md`](61-ui-usability.md) (padrões de uso estilo Uber).

> Referências aprovadas pelo usuário: iPhone Settings, App Store (Apps/Account), Uber (home/choose ride).
> Preferências fechadas: sombras **sutis** (~0.06), cantos **médios (12–16)**, densidade **equilibrada**,
> **dark mode depois** (tokens já preparados, mas só tema claro agora).

## Princípios (Apple HIG)
1. **Hierarquia por tipografia e espaço**, não por bordas pesadas. Título grande e pesado no topo de cada
   tela-lista (large title).
2. **Cards brancos agrupados** sobre fundo cinza-claro. Conteúdo respira; nunca encostar texto na borda.
3. **Clareza > decoração.** Uma cor de acento (azul). Cores semânticas só para status/feedback.
4. **Toque generoso:** alvos ≥44px de altura.
5. **Profundidade sutil:** cards levitam de leve do fundo; nada de sombra pesada.

## Design tokens (fonte da verdade → `frontend/src/theme.ts`)
Tokens novos são **aditivos**: mantêm `colors.*`, `radius`, `spacing()` atuais como aliases.

### Cores
```
// Superfícies
bg              #F2F2F7   // fundo agrupado (iOS systemGroupedBackground)
surface         #FFFFFF   // card / list group
surfaceSecondary#EAEAEF   // search field, botão "Get", tile neutro
separator       rgba(60,60,67,0.16)  // hairline entre rows

// Texto
text            #1C1C1E   // label primário (quase preto)
textSecondary   #6B7280   // subtítulo / descrição
textTertiary    #9CA3AF   // placeholder / valor à direita apagado

// Acento (marca, evolução do #1565C0)
accent          #0A63D4   // CTAs, links, estado ativo, seleção
accentPressed   #084FA8   // pressionado
accentSoft      #E7F0FD   // fundo suave (badge azul, seleção leve)

// Semânticas (status/feedback)
success #1F9D57   successSoft #E4F6EC
warning #E8951A   warningSoft #FCEFD8
danger  #E5484D   dangerSoft  #FBE7E8
star    #F5A623

// Tiles de ícone (estilo Settings) — fundo do quadrado arredondado
tileBlue #0A84FF  tileGreen #34C759  tileOrange #FF9F0A
tileRed #FF3B30   tilePurple #AF52DE tileTeal #30B0C7
```
Aliases de compat: `primary→accent`, `primaryDark→accentPressed`, `primaryLight→accentSoft`,
`card→surface`, `muted→textSecondary`, `border→separator`.

### Tipografia — família **Inter** (no iPhone o sistema usa SF Pro; Inter mantém consistência cross-platform)
Pesos: Inter 400/500/600/700. Helper `typography[role]` → `{fontFamily, fontSize, lineHeight, fontWeight, letterSpacing}`.
```
largeTitle  34 / 41  700  (-0.4)   // título do topo da tela
title1      28 / 34  700  (-0.3)
title2      22 / 28  700  (-0.2)
title3      20 / 25  600
headline    17 / 22  600            // título de row / card
body        17 / 22  400            // corpo padrão
callout     16 / 21  400
subhead     15 / 20  400            // subtítulo
footnote    13 / 18  400            // legenda / meta
caption     12 / 16  500            // eyebrow / badge
```
- **Eyebrow** (ex.: "HAPPENING NOW"): `caption`, uppercase, `letterSpacing 0.6`, cor `accent`.
- Preço/valor em destaque: `headline`/`title3` peso 700, alinhado à direita.

### Espaçamento — escala `space`
```
xs 4 · sm 8 · md 12 · lg 16 · xl 24 · xxl 32
```
- Padding horizontal de tela: **16**. Padding interno de card: **16**.
- Gap entre cards agrupados: **24** (respiro de seção, estilo Settings).
- Gap entre rows dentro do card: separador hairline (sem gap), row com `minHeight 52`.
- Manter `spacing(n)=>n*8` como alias.

### Raios — escala `radii`
```
tile 8 · input 12 · button 14 · card 16 · sheet 20 · pill 999
```
Alias: `radius` (12) mantido.

### Sombras — token `shadows` (SUTIL; `Platform.select`)
```
none : {}
sm   : iOS {color#000, opacity 0.06, radius 8,  offset 0/3}  · Android elevation 2 · web boxShadow '0 3px 8px rgba(0,0,0,0.06)'
md   : iOS {color#000, opacity 0.10, radius 20, offset 0/10} · Android elevation 6 · web '0 10px 24px rgba(0,0,0,0.10)'  // só p/ flutuante: CTA fixo, bottom sheet, FAB
```
Regra: **card comum usa `sm`**; só elemento que “flutua” usa `md`. Nunca empilhar sombra em sombra.

## Logo (SVG) — volante "dois-C"
Marca desenhada em código (`react-native-svg`), sem placeholder cinza.
- **Aro:** dois arcos em "C" — um `C` normal e um espelhado (`Ɔ`) — que juntos formam o anel do volante,
  com uma fresta em cima e embaixo (não fecham por completo → leem como dois C de **C**NH **C**onnect).
- **Miolo:** três raios saindo de um **cubo central** (círculo pequeno preenchido) até o aro — clássico
  de volante: um raio para baixo e dois diagonais para cima (Y invertido) OU 3 a 120°.
- **Cor:** aro e raios em `accent`; cubo em `accent` (ou `surface` sobre disco accent). Traço arredondado
  (`strokeLinecap round`), espessura proporcional ao `size`.
- Props: `size` (default 40), `showWordmark` (bool), `tint` (default accent). Wordmark "CNH Connect" em
  Inter 700, `text`, ao lado/abaixo conforme contexto (empilhado no Login, inline no header).

## Iconografia
- **Ionicons** via `@expo/vector-icons` (formas próximas ao SF Symbols). **Zero emoji** como ícone.
- **Tiles de ícone** (list rows estilo Settings): quadrado `radii.tile`, fundo `tile*`, glifo branco,
  ~30px. Ex.: agenda→calendar (tileBlue), pagamento→card (tileGreen), perfil→person (tileTeal).
- Chevron de navegação: Ionicons `chevron-forward`, `textTertiary`, à direita das rows.

## Aplicação rápida (do que virou cada coisa)
- Caixa cinza "LOGO" → componente `Logo` (SVG acima).
- Avatar "FOTO" → `Avatar` (imagem/iniciais/ícone, circular).
- Emoji de aba → `Icon` Ionicons no tab bar.
- Card só-borda → `Card` com `shadows.sm` + `radii.card`.
- Campo web → `TextField` (foco com anel `accent`, ícone, erro inline).
- Erro em `Text` vermelho → `Toast`/banner `dangerSoft`.

Ver inventário de componentes e padrões de interação em [`61-ui-usability.md`](61-ui-usability.md).
