# Modo foco com holograma — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clicar no computador da sala entra num modo foco em que a tela mostra os projetos como ícones e cada projeto abre num holograma clássico acima do monitor; corrigir o monitor e pôr imagens nos cartões.

**Architecture:** Um `FocusProvider` (estado `mode`/`openId` + histórico + trava de rolagem) é lido pela câmera, pela tela do monitor (HTML no 3D), pelo holograma (HTML `transform` no desktop, painel fixo no celular) e pelos efeitos WebGL (feixe, moldura com varredura, brilho na mesa). A rolagem continua sendo o caminho principal; o foco é uma camada por cima.

**Tech Stack:** a mesma do branch (React 19, R3F 9, drei 10, three, Vitest, Yarn PnP, Blender 5.3 pela ponte).

**Spec:** `docs/superpowers/specs/2026-11-24-modo-foco-holograma-design.md` (complementa `2026-11-23-portfolio-3d-design.md`)

## Global Constraints

- `yarn vitest --run` e `node tools/anon/check.ts` passam antes de cada commit; nada no repo cita a empresa.
- Novos empties `cam_foco` e `alvo_foco` na sala provisória e no GLB; `REQUIRED_NODES` passa a incluí-los.
- `prefers-reduced-motion`: sem cintilação e sem animação de subida; qualidade `static`: sem modo foco e sem o botão "Explorar no computador".
- Estilo A do holograma: fundo `rgba(60,140,255,.28)`→`rgba(40,90,200,.16)`, varredura com gradiente repetido de 2 px, borda `rgba(140,200,255,.65)`, texto `#dff0ff`.
- Celular (layout empilhado): holograma como painel fixo na metade de baixo, sem feixe, moldura nem brilho.
- Links de código/demo só em projetos pessoais (já garantido pelos dados).
- Repo no Google Drive: build local só num clone fora do Drive (a pasta fantasma `public/draco` quebra o build no Drive).

## Review Focus

1. **Sair do foco por qualquer caminho** (botão Voltar, Esc, clique no vazio, Voltar do navegador) → rolagem destravada e página na mesma posição de antes. Testes na Task 2.
2. **Esc com holograma aberto** fecha só o holograma; segundo Esc sai do foco. Teste na Task 2.
3. **Teclado no holograma** → foco entra no diálogo ao abrir e volta ao ícone ao fechar; Tab não alcança a página escondida. Teste na Task 5.
4. **Último projeto → "próximo"** volta ao primeiro (e vice-versa). Teste na Task 2.
5. **Clique em outro objeto durante o foco** (estante, porta-retrato, celular) → sai do foco e leva à seção do objeto. Teste na Task 4.

---

### Task 1: Monitor corrigido e pose de foco no modelo

**Files:**
- Modify: `blender/build_room.py` (haste e base atrás do corpo; empties `cam_foco`/`alvo_foco`), `src/scene/PlaceholderRoom.tsx` (mesmos empties e haste atrás), `tools/check-glb.ts` (REQUIRED_NODES), `src/scene/readPoses.ts`
- Regenerate: `public/models/sala.glb`, `blender/sala.blend` (bake de `monitor` e `mesa`)
- Test: `tools/check-glb.test.ts`, `src/scene/readPoses.test.ts`

**Interfaces:**
- Produces: `readFocusPose(root: Object3D): Pose` (lança erro com `cam_foco`/`alvo_foco` ausentes); `RoomInfo` ganha `foco: Pose`; `PLACEHOLDER_FOCUS_POSE: Pose`.

- [ ] **Step 1: Testes que falham** — `check-glb`: GLB sem `cam_foco` → `missing` contém `cam_foco`. `readPoses.test`: `readFocusPose` numa cena com `cam_foco`(0,1.2,0.4)/`alvo_foco`(0,1.25,−1.3) devolve essas posições; sem `alvo_foco` → erro contendo `alvo_foco`.
- [ ] **Step 2: Rodar** → FAIL.
- [ ] **Step 3: Implementar** `readFocusPose`, incluir os nomes em `REQUIRED_NODES`, empties na sala provisória. Pose de foco inicial (three.js): câmera `(0, 1.32, 0.55)`, alvo `(0, 1.32, −1.3)` — enquadra o monitor embaixo e ~0,6 m acima para o holograma; ajustar no navegador.
- [ ] **Step 4: Rodar** → PASS.
- [ ] **Step 5: Blender pela ponte** — em `build_room.py`, `mon_haste` para z −1,375 e `mon_base` para z −1,36 (atrás do corpo, que vai até −1,3475); adicionar empties de foco; reconstruir a cena, refazer o bake só de `monitor` e `mesa` (e dos demais, se a reconstrução apagar os bakes — `build()` recria tudo, então rodar o bake completo em segundo plano), exportar, `yarn check:glb` OK, salvar `.blend`.
- [ ] **Step 6: Commit** `fix: monitor de frente e pose de foco na sala`.

### Task 2: Estado do modo foco

**Files:**
- Create: `src/ui/focus.ts` (redutor puro), `src/ui/FocusContext.tsx` (provider: histórico, trava de rolagem, Esc)
- Modify: `src/App.tsx` (envolver com `FocusProvider`)
- Test: `src/ui/focus.test.ts`, `src/ui/FocusContext.test.tsx`

**Interfaces:**
- Produces:
  - `type FocusState = { mode: 'scroll' | 'foco'; openId: string | null }`
  - `focusReducer(s: FocusState, a: FocusAction, ids: string[]): FocusState` com ações `enter`, `exit`, `open(id)`, `close`, `next`, `prev`, `escape` (`escape`: aberto→fecha; senão→sai).
  - `useFocus(): FocusState & { enterFocus(); exitFocus(); open(id); close(); next(); prev() }`
  - Ao entrar: guarda `scrollY`, `document.documentElement.classList.add('is-focus')`, `history.pushState({ foco: true }, '', '#foco')`. Ao sair: remove classe, `scrollTo(0, salvo)`; se a saída não veio do `popstate`, `history.back()`. `popstate` com foco ativo → `escape`.

- [ ] **Step 1: Testes que falham** — redutor: `enter`→`foco`; `open('b')` define `openId`; `next` no último volta ao primeiro, `prev` no primeiro vai ao último; `escape` com `openId` → `openId=null`, mode continua `foco`; `escape` sem `openId` → `scroll`; `exit` limpa `openId`. Provider: com `scrollY=1234`, entrar e sair → `scrollTo(0,1234)` chamado e classe `is-focus` removida; tecla Escape fecha holograma e depois sai; evento `popstate` sai do foco.
- [ ] **Step 2: Rodar** → FAIL.
- [ ] **Step 3: Implementar.** CSS: `html.is-focus { overflow: hidden }`.
- [ ] **Step 4: Rodar** → PASS.
- [ ] **Step 5: Commit** `feat: estado do modo foco com histórico e trava de rolagem`.

### Task 3: Imagens nos projetos

**Files:**
- Modify: `src/ui/ProjectCard.tsx`, `src/styles/global.css`, `tools/mockups/mockup.html` (segunda vista para os 6 destaques, ids `<id>-2`), `tools/mockups/capture.py` (aceitar ids `-2`), `src/data/projects.ts` (2ª imagem nos destaques)
- Create: `public/img/projetos/<id>-2.webp` (6 arquivos)
- Test: `src/ui/sections.test.tsx`, `src/data/projects.test.ts`

- [ ] **Step 1: Testes que falham** — cada cartão tem `img` com `alt` "Tela ilustrativa de {titulo}" e `src` igual a `imagens[0]`, com `loading="lazy"`; todo projeto `destaque` tem ≥ 2 imagens.
- [ ] **Step 2: Rodar** → FAIL.
- [ ] **Step 3: Implementar** miniatura (proporção 16:10, `object-fit: cover`, canto 6 px) no topo do cartão; nos compactos, miniatura à esquerda 96 px. Gerar as 6 segundas vistas com dados inventados (outra tela do mesmo sistema) e capturar.
- [ ] **Step 4: Rodar** testes + `check:anon` → PASS; olhar as 6 imagens.
- [ ] **Step 5: Commit** `feat: imagens nos cartões e segunda tela dos destaques`.

### Task 4: Área de trabalho no monitor e cliques na sala

**Files:**
- Modify: `src/scene/MonitorScreen.tsx` (grade de ícones), `src/scene/interactive.ts`, `src/scene/SceneCanvas.tsx`, `src/scene/CameraRig.tsx`, `src/ui/ProjectsSection.tsx` (botão "Explorar no computador")
- Test: `src/scene/interactive.test.ts`, `src/scene/cameraTarget.test.ts`

**Interfaces:**
- Consumes: `useFocus` (Task 2), `RoomInfo.foco` (Task 1).
- Produces:
  - `resolveSceneClick(name: string | null, mode: 'scroll'|'foco'): { type: 'enter' } | { type: 'goto'; section: SectionId; exit: boolean } | { type: 'exit' } | null` — monitor em `scroll`→`enter`; monitor em `foco`→`null` (cliques vão aos ícones); outro objeto interativo→`goto` com `exit = mode==='foco'`; vazio em `foco`→`exit`; vazio em `scroll`→`null`.
  - `cameraTarget(mode, scrollT, poses, foco): Pose` (foco ignora a rolagem); inclinação do mouse ±0,08 no foco.

- [ ] **Step 1: Testes que falham** — os 5 casos de `resolveSceneClick`; `cameraTarget('foco', 2.3, poses, foco)` devolve `foco`; em `scroll` devolve `poseAt`.
- [ ] **Step 2: Rodar** → FAIL.
- [ ] **Step 3: Implementar.** Monitor: grade de 5 colunas com miniatura e nome curto (texto antes de ':'); em `scroll`, `pointer-events: none` e destaque no `activeId`; em `foco`, ícones são `<button>` que chamam `open(id)`. Botão "Explorar no computador" chama `enterFocus` e some em `quality === 'static'`.
- [ ] **Step 4: Rodar** → PASS.
- [ ] **Step 5: Verificar no navegador** — clicar no monitor a partir do Início entra no foco; ícones clicáveis; clicar na estante no foco sai e vai a Habilidades.
- [ ] **Step 6: Commit** `feat: área de trabalho no monitor e clique para focar`.

### Task 5: Holograma (conteúdo) e camada de foco

**Files:**
- Create: `src/ui/Hologram.tsx` (conteúdo do painel), `src/scene/HologramAnchor.tsx` (`<Html transform>` acima do monitor no desktop), `src/ui/FocusChrome.tsx` (botão Voltar fixo)
- Modify: `src/App.tsx`, `src/styles/global.css`
- Test: `src/ui/Hologram.test.tsx`, `src/ui/FocusChrome.test.tsx`

**Interfaces:**
- Consumes: `useFocus`, `projects`.
- Produces: `<Hologram project={Project} onClose onNext onPrev />` com `role="dialog"`, `aria-modal="true"`, `aria-labelledby` no título; galeria com `selectedIndex`.

- [ ] **Step 1: Testes que falham** — Hologram: tem `role=dialog` com nome do título; clicar na miniatura 2 troca a imagem grande; "próximo"/"anterior" chamam os callbacks; projeto interno sem links; ao montar, foco vai para o botão fechar. FocusChrome/App: com foco ativo, `main`, `nav` e `footer` têm `inert` e o botão "Voltar" existe e chama `exitFocus`; em layout empilhado, o holograma renderiza como painel fixo (`.hologram--sheet`) e não dentro do 3D.
- [ ] **Step 2: Rodar** → FAIL.
- [ ] **Step 3: Implementar** estilo A (constantes das Global Constraints), cintilação só sem reduced-motion, subida de 0,9 s. No desktop o `HologramAnchor` posiciona o painel ~0,35 m acima do topo do monitor, largura ~0,9 m. Camada HTML: `html.is-focus .content, .nav, .footer { opacity: 0; transition: opacity .3s }` + `inert`.
- [ ] **Step 4: Rodar** → PASS.
- [ ] **Step 5: Commit** `feat: holograma com galeria e camada de foco`.

### Task 6: Efeitos WebGL do holograma

**Files:**
- Create: `src/scene/HologramFx.tsx` (feixe, moldura com shader de varredura, brilho aditivo na mesa), `src/scene/showFx.ts`
- Modify: `src/scene/SceneCanvas.tsx`
- Test: `src/scene/showFx.test.ts`

**Interfaces:**
- Produces: `showFx(state: FocusState, stacked: boolean, quality: Quality): boolean` — só `true` com `openId`, não empilhado e qualidade `full`.

- [ ] **Step 1: Teste que falha** — combinações de `showFx` (aberto/desktop/full → true; empilhado → false; low → false; fechado → false).
- [ ] **Step 2: Rodar** → FAIL.
- [ ] **Step 3: Implementar** `showFx` e `HologramFx`: cone aberto com material aditivo e gradiente vertical do topo da tela até a base do painel; plano da moldura atrás do painel com shader (faixas que deslizam, `uTime`); plano radial aditivo sobre o tampo da mesa. Entram/saem com fade de 0,3 s; sem animação de tempo se reduced-motion.
- [ ] **Step 4: Rodar** → PASS.
- [ ] **Step 5: Verificar no navegador** (desktop 1440, celular 375): foco, abrir holograma, galeria, próximo, Esc duas vezes, Voltar do navegador, posição de rolagem restaurada; console sem erros.
- [ ] **Step 6: Commit** `feat: feixe, varredura e brilho do holograma`.

### Task 7: Verificação final

- [ ] **Step 1:** `yarn vitest --run`, `node tools/anon/check.ts`, `yarn check:glb`; build e preview num clone fora do Drive.
- [ ] **Step 2:** Revisão do branch inteiro (revisor independente) e correções importantes com teste.
- [ ] **Step 3:** Mostrar ao usuário e seguir para a publicação (com confirmação).
