# Portfólio 3D — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o site estático atual por um portfólio React em que uma sala de trabalho 3D (modelada no Blender) acompanha toda a rolagem e leva a projetos, habilidades, sobre e contato.

**Architecture:** SPA Vite + React + TypeScript. O conteúdo é HTML normal com rolagem nativa da janela; um `<Canvas>` R3F fixo ao fundo lê a posição de rolagem, converte em um parâmetro contínuo `t` entre as seções e interpola a câmera entre poses nomeadas da sala. A sala começa como um modelo provisório de primitivas e é trocada pelo GLB do Blender com os mesmos nomes de objetos.

**Tech Stack:** React 19, Vite, TypeScript, three, @react-three/fiber 9, @react-three/drei 10, Vitest + Testing Library (jsdom), @gltf-transform/core (checagem do GLB), Playwright (captura das telas fictícias), GitHub Actions → GitHub Pages. Blender 5.3 controlado pela ponte local (`127.0.0.1:9877`).

**Spec:** `docs/superpowers/specs/2026-11-23-portfolio-3d-design.md`

## Global Constraints

- Hospedagem GitHub Pages no repositório `MarlonFer77/marlonfer77.github.io`, URL raiz (`base: '/'`).
- Idioma pt-BR com acentuação correta; todos os arquivos em UTF-8.
- **Nenhum** nome de empresa, sistema interno, servidor ou IP em qualquer arquivo versionado (inclusive docs, planos e `blender/`). `npm run check:anon` precisa passar antes de todo commit.
- Projetos `tipo: 'interno'` nunca têm `github` nem `demo`.
- GLB final ≤ 3 MB, comprimido (Draco ou meshopt), luz pré-calculada em textura.
- Nomes de objetos da cena (provisória e GLB): `monitor_tela`, `estante`, `celular`, `porta_retrato`; câmeras `cam_<secao>` e alvos `alvo_<secao>` para cada seção.
- Seções, nesta ordem: `inicio`, `projetos`, `habilidades`, `sobre`, `contato`.
- Contatos: e-mail `dev.marlonfer77@gmail.com`, LinkedIn `https://www.linkedin.com/in/marlonferreira77/`, GitHub `https://github.com/MarlonFer77`, WhatsApp `https://wa.me/5521989844071`.
- Rolagem nativa: nunca bloquear nem sequestrar a rolagem da janela.
- `node_modules/`, `dist/`, `.superpowers/` e `*.blend1` fora do Git (repo está em pasta do Google Drive).
- Fontes privadas dos textos: memória `portfolio-fontes-privadas` do Claude (fora do repo).

## Review Focus

1. **Navegação por menu ou teclado** (pular direto para "Contato", Tab até um link) → a câmera chega à pose da seção sem ficar presa entre poses. Teste em Task 4 (`scrollToT` com rolagem exatamente no topo de cada seção e além do fim).
2. **Redimensionar ou girar a tela** → os topos das seções são medidos de novo e a câmera continua alinhada. Teste em Task 4 (`useSectionTops` reage a `resize`).
3. **GLB não carrega** (404, rede lenta, arquivo corrompido) → a sala provisória continua visível; nunca uma tela vazia. Teste em Task 8 (`RoomWithFallback` com carregador que falha).
4. **Texto sobre a cena em telas estreitas** → em largura < 768 px, cena na metade superior e texto abaixo, sem sobreposição. Teste em Task 6 (classe de layout por largura).
5. **Lista de projetos cresce** (15+ itens, títulos longos) → destaques limitados e o restante em "Outros projetos", sem quebrar o layout. Teste em Task 3 (`splitProjects`).

---

### Task 1: Base do app (Vite + React + testes + deploy)

**Files:**
- Delete: `index.html`, `main.js`, `styles.css`, `.vscode/` (permanecem no histórico do Git)
- Move: `assets/eu.jpg` → `public/img/eu.jpg`; demais `assets/*` → `public/img/projetos/` (nomes atuais)
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/global.css`, `.gitignore`, `.github/workflows/deploy.yml`, `src/test/setup.ts`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: `App` (default export de `src/App.tsx`); scripts npm `dev`, `build`, `test`, `check:anon` (este último criado na Task 2).

- [ ] **Step 1: Criar o projeto** com `npm create vite@latest . -- --template react-ts` (pasta já tem `.git` e `docs/`; manter ambos), instalar `three @react-three/fiber @react-three/drei` e, como dev, `vitest jsdom @testing-library/react @testing-library/jest-dom`. Vitest configurado em `vite.config.ts` com `environment: 'jsdom'`, `setupFiles: 'src/test/setup.ts'`.
- [ ] **Step 2: Teste que falha** — `src/App.test.tsx`: renderiza `<App />` e espera `getByRole('heading', { level: 1, name: 'Marlon Ferreira' })` e o texto `Desenvolvedor Full-Stack`.
- [ ] **Step 3: Rodar** `npm test -- --run` → FAIL (texto ausente).
- [ ] **Step 4: `App` mínimo** com `<h1>Marlon Ferreira</h1>` e o subtítulo; `index.html` com `<html lang="pt-BR">`, `<meta charset="utf-8">`, título "Marlon Ferreira | Desenvolvedor Full-Stack"; CSS global com tema escuro como padrão.
- [ ] **Step 5: Rodar** `npm test -- --run` → PASS; `npm run build` → gera `dist/` sem erros.
- [ ] **Step 6: Workflow de deploy** `.github/workflows/deploy.yml`: em push para `main`, `npm ci && npm test -- --run && npm run build`, publica `dist/` com `actions/upload-pages-artifact` + `actions/deploy-pages`. Não ativar Pages por Actions agora (é a Task 9, com o usuário).
- [ ] **Step 7: Commit** `feat: base React + Vite substitui site estático`.

### Task 2: Guarda de anonimato

O repo é público, então a lista de termos proibidos não pode estar nele em texto. Ela fica como **hashes SHA-256** de termos em minúsculas e sem acento.

**Files:**
- Create: `tools/anon/hash-terms.mjs` (lê um arquivo local fora do repo, imprime JSON de hashes), `tools/anon/blocklist.json` (só hashes), `tools/anon/check.mjs`, `tools/anon/scan.ts`
- Test: `tools/anon/scan.test.ts`

**Interfaces:**
- Produces: `findBlocked(text: string, hashes: Set<string>): string[]` — devolve os trechos (1 a 3 palavras consecutivas, normalizados: minúsculas, sem acento, só `[a-z0-9]`) cujo hash está na lista. `npm run check:anon` varre arquivos versionados (`git ls-files`, só texto) e sai com código 1 se achar algo.

- [ ] **Step 1: Teste que falha** — com hashes de `"acme corp"` e `"intranet x"`: `findBlocked('Feito para a ACME Corp.', h)` → `['acme corp']`; `findBlocked('Portal de RH', h)` → `[]`; `findBlocked('acmé  corp', h)` → `['acme corp']` (acento e espaço duplo).
- [ ] **Step 2: Rodar** → FAIL.
- [ ] **Step 3: Implementar** `findBlocked` em `scan.ts` (normaliza com `normalize('NFD')`, gera n-gramas de 1–3 tokens, `crypto.createHash('sha256')`).
- [ ] **Step 4: Rodar** → PASS.
- [ ] **Step 5: Gerar a lista real** — Claude cria `%USERPROFILE%\.portfolio-anon-terms.txt` (fora do repo) com o nome da empresa e suas variações, nomes dos sistemas internos, ERP específico, hosts/IPs e nomes de pastas listados na memória `portfolio-fontes-privadas`; roda `node tools/anon/hash-terms.mjs` → `blocklist.json`. Adicionar `check:anon` aos scripts e ao workflow antes do build.
- [ ] **Step 6: Rodar** `npm run check:anon` → sai 0 no repo atual.
- [ ] **Step 7: Commit** `feat: verificação de anonimato com lista em hash`.

### Task 3: Conteúdo (perfil, habilidades, projetos)

**Files:**
- Create: `src/data/types.ts`, `src/data/profile.ts`, `src/data/skills.ts`, `src/data/projects.ts`
- Test: `src/data/projects.test.ts`

**Interfaces:**
- Produces:
  - `type Project = { id: string; titulo: string; tipo: 'interno' | 'pessoal'; destaque: boolean; problema: string; solucao: string; resultado: string; stack: string[]; imagens: string[]; github?: string; demo?: string }`
  - `projects: Project[]`; `splitProjects(list: Project[], maxDestaques = 6): { destaques: Project[]; outros: Project[] }` (ordem preservada; excedentes de `destaque` vão para `outros`)
  - `profile: { nome: string; cargo: string; resumo: string; foto: string; contatos: { email: string; linkedin: string; github: string; whatsapp: string }; curriculo?: string }`
  - `skills: { grupo: string; cor: string; itens: string[] }[]` (um grupo por volume da estante)

- [ ] **Step 1: Teste que falha** — `projects.test.ts`:
  - ids únicos; `problema`, `solucao`, `resultado` não vazios em todos;
  - todo `tipo === 'interno'` tem `github` e `demo` indefinidos;
  - todo caminho em `imagens` existe em `public/` (`fs.existsSync`);
  - `splitProjects` com 8 projetos `destaque: true` → 6 destaques e 2 em `outros`; com títulos de 120 caracteres não lança erro;
  - `profile.contatos` igual aos valores das Global Constraints.
- [ ] **Step 2: Rodar** → FAIL.
- [ ] **Step 3: Redigir os textos** — ler as pastas da memória `portfolio-fontes-privadas` (README, package.json, código principal, histórico de sessões) e os repositórios públicos de `github.com/MarlonFer77`; escrever problema → solução → resultado em 1–2 frases cada, sem nenhum identificador interno. Headcount entra dentro do texto do Insight RH. Os projetos a classificar da memória ficam fora até o usuário decidir. Imagens: usar as atuais quando houver; para os demais, um placeholder `public/img/projetos/placeholder.webp` até a Task 7.
- [ ] **Step 4: Rodar** `npm test -- --run` e `npm run check:anon` → PASS.
- [ ] **Step 5: Revisão do usuário** — mostrar a lista de títulos e textos ao usuário e aplicar correções antes de seguir.
- [ ] **Step 6: Commit** `feat: dados de projetos, habilidades e perfil`.

### Task 4: Rolagem → câmera (matemática pura)

**Files:**
- Create: `src/scene/sections.ts`, `src/scene/useSectionTops.ts`, `src/scene/useScrollT.ts`
- Test: `src/scene/sections.test.ts`, `src/scene/useSectionTops.test.tsx`

**Interfaces:**
- Produces:
  - `SECTIONS = ['inicio','projetos','habilidades','sobre','contato'] as const`; `type SectionId = typeof SECTIONS[number]`
  - `scrollToT(scrollY: number, tops: number[]): number` — `t ∈ [0, tops.length-1]`; `t = i` exatamente quando `scrollY === tops[i]`; linear entre topos; limita abaixo de 0 e acima do último.
  - `sectionAt(t: number): SectionId` — `SECTIONS[Math.round(t)]`
  - `type Pose = { position: [number,number,number]; target: [number,number,number] }`
  - `poseAt(t: number, poses: Record<SectionId, Pose>): Pose` — interpola entre `floor(t)` e `ceil(t)` com smoothstep `e = f*f*(3-2f)`.
  - `useSectionTops(): number[]` — mede `offsetTop` dos elementos `#inicio … #contato`; remede em `resize` e quando fontes/imagens mudam a altura (ResizeObserver no `document.body`).
  - `useScrollT(tops: number[]): React.MutableRefObject<number>` — ref atualizada em `scroll` (passive), sem re-render.

- [ ] **Step 1: Testes que falham** — `scrollToT(0,[0,800,1600,2400,3200])` → 0; `(1600, …)` → 2; `(1200, …)` → 1.5; `(-50, …)` → 0; `(9999, …)` → 4; `sectionAt(3.4)` → `'sobre'`; `poseAt(1, poses)` igual a `poses.projetos`; `poseAt(0.5, …)` com posições `[0,0,0]`→`[2,0,0]` → `[1,0,0]`. `useSectionTops`: renderiza 5 seções com `offsetTop` mockado, dispara `resize` após mudar os mocks e espera os novos valores.
- [ ] **Step 2: Rodar** → FAIL.
- [ ] **Step 3: Implementar** as funções e os hooks.
- [ ] **Step 4: Rodar** → PASS.
- [ ] **Step 5: Commit** `feat: mapeamento rolagem → pose de câmera`.

### Task 5: Seções HTML

**Files:**
- Create: `src/ui/Nav.tsx`, `src/ui/Hero.tsx`, `src/ui/ProjectsSection.tsx`, `src/ui/ProjectCard.tsx`, `src/ui/SkillsSection.tsx`, `src/ui/AboutSection.tsx`, `src/ui/ContactSection.tsx`, `src/ui/Footer.tsx`, `src/ui/ActiveProjectContext.tsx`
- Modify: `src/App.tsx`
- Test: `src/ui/sections.test.tsx`

**Interfaces:**
- Consumes: `projects`, `splitProjects`, `profile`, `skills` (Task 3); `SECTIONS` (Task 4).
- Produces: cada seção é `<section id={SectionId}>`; `ActiveProjectContext` com `{ activeId: string; setActiveId(id: string): void }` (o monitor 3D da Task 6 lê `activeId`); `scrollToSection(id: SectionId): void` em `src/ui/scrollToSection.ts` (rolagem suave nativa, respeita `prefers-reduced-motion`).

- [ ] **Step 1: Testes que falham** — renderizando `<App />`:
  - existe um `section` para cada id de `SECTIONS`, na ordem;
  - Hero tem links "Ver projetos", "LinkedIn" e, se `profile.curriculo` existir, "Currículo (PDF)";
  - cada projeto aparece pelo título; cards de projetos internos não têm links de GitHub/demo e mostram o selo "Projeto corporativo";
  - Contato tem `href="mailto:dev.marlonfer77@gmail.com"`, o LinkedIn, o GitHub e o WhatsApp exatos;
  - o rodapé mostra `new Date().getFullYear()`;
  - não existe `<form>` na página;
  - clicar/focar num card chama `setActiveId` com o id do projeto.
- [ ] **Step 2: Rodar** → FAIL.
- [ ] **Step 3: Implementar** as seções. Painéis de texto alternam lado (`inicio` esquerda, `projetos` direita, `habilidades` esquerda, `sobre` direita, `contato` esquerda) com fundo semitransparente para legibilidade sobre a cena. Destaques em grade; "Outros projetos" em lista compacta.
- [ ] **Step 4: Rodar** `npm test -- --run` e `npm run check:anon` → PASS.
- [ ] **Step 5: Commit** `feat: seções de conteúdo do portfólio`.

### Task 6: Cena 3D com sala provisória

**Files:**
- Create: `src/scene/SceneCanvas.tsx`, `src/scene/PlaceholderRoom.tsx`, `src/scene/CameraRig.tsx`, `src/scene/interactive.ts`, `src/scene/MonitorScreen.tsx`, `src/scene/readPoses.ts`
- Modify: `src/App.tsx`, `src/styles/global.css`
- Test: `src/scene/interactive.test.ts`, `src/scene/readPoses.test.ts`, `src/ui/layout.test.tsx`

**Interfaces:**
- Consumes: `useSectionTops`, `useScrollT`, `poseAt`, `sectionAt` (Task 4); `ActiveProjectContext`, `scrollToSection` (Task 5).
- Produces:
  - `OBJECT_TO_SECTION: Record<string, SectionId> = { monitor_tela: 'projetos', estante: 'habilidades', porta_retrato: 'sobre', celular: 'contato' }`; `sectionForObject(name: string): SectionId | null` (sobe pelos pais do objeto até achar um nome do mapa).
  - `readPoses(root: THREE.Object3D): Record<SectionId, Pose>` — lê `cam_<id>`/`alvo_<id>` (posição mundial); lança erro listando os nomes ausentes.
  - `PlaceholderRoom` — grupo com primitivas (chão, paredes, mesa, monitor, estante com um volume por grupo de `skills` e na cor do grupo, celular, porta-retrato com `profile.foto`) usando os nomes das Global Constraints, mais os empties de câmera.
  - `SceneCanvas` — `<Canvas>` `position: fixed; inset: 0; z-index: 0`, `pointer-events` só nos objetos; `CameraRig` aplica `poseAt(scrollT)` com amortecimento e inclinação do mouse (±0.3 em x, ±0.2 em y).
  - Em largura < 768 px: classe `layout--stacked` no `<body>`, cena na metade superior (`height: 50vh`) e conteúdo abaixo.

- [ ] **Step 1: Testes que falham** — `sectionForObject('estante')` → `'habilidades'`; para um mesh filho de `celular` → `'contato'`; `'cadeira'` → `null`. `readPoses` com uma cena montada com os 10 empties → poses corretas; faltando `cam_sobre` → erro contendo `cam_sobre`. `layout.test.tsx`: com `innerWidth = 375`, `<App />` aplica `layout--stacked`; com 1280, não.
- [ ] **Step 2: Rodar** → FAIL.
- [ ] **Step 3: Implementar.** Hover em objeto interativo: cursor `pointer` e leve brilho (emissive); clique → `scrollToSection`. `MonitorScreen`: `drei <Html transform occlude>` (ou textura) sobre `monitor_tela` mostrando a primeira imagem e o título do projeto `activeId`. Celular acende quando `sectionAt(t) === 'contato'`.
- [ ] **Step 4: Rodar** `npm test -- --run` → PASS.
- [ ] **Step 5: Verificar no navegador** — `npm run dev`; no painel do navegador: rolar do início ao fim (câmera passa pelas 5 poses sem pulos); clicar em "Contato" no menu (câmera chega à pose do celular); clicar na estante (rola até Habilidades); emular 375×812 (cena em cima, texto embaixo); console sem erros.
- [ ] **Step 6: Commit** `feat: cena 3D provisória sincronizada com a rolagem`.

### Task 7: Qualidade, fallback e telas fictícias

**Files:**
- Create: `src/scene/quality.ts`, `src/scene/StaticRoom.tsx`, `tools/mockups/<id>.html` (um por projeto sem imagem), `tools/mockups/capture.mjs`, `public/img/projetos/<id>.webp`
- Modify: `src/App.tsx`, `src/data/projects.ts` (troca placeholders pelas imagens novas)
- Test: `src/scene/quality.test.ts`

**Interfaces:**
- Produces: `pickQuality(env: { webgl: boolean; reducedMotion: boolean; cores: number; memoryGb?: number; width: number }): 'full' | 'low' | 'static'` — `static` se `!webgl || reducedMotion`; `low` se `cores <= 4 || (memoryGb ?? 8) <= 4 || width < 768`; senão `full`. `low` = `dpr` máx. 1 e sem sombras/pós-processamento. `StaticRoom` mostra `public/img/sala-estatica.webp` (gerada na Task 8; até lá, captura da sala provisória).

- [ ] **Step 1: Teste que falha** — os casos: sem WebGL → `static`; reduced motion → `static`; 4 núcleos → `low`; 2 GB → `low`; 375 px → `low`; 8 núcleos, 8 GB, 1440 px → `full`.
- [ ] **Step 2: Rodar** → FAIL.
- [ ] **Step 3: Implementar** e ligar em `App` (o conteúdo HTML aparece antes do `<Canvas>`, que entra com `lazy` + `Suspense` e indicador discreto).
- [ ] **Step 4: Telas fictícias** — para cada projeto interno, um HTML em `tools/mockups/` com uma tela representativa (painel, tabela, gráfico) em dados inventados, sem logos nem nomes reais; `capture.mjs` (Playwright, 1280×800) salva `public/img/projetos/<id>.webp`. Instalar Playwright só como devDependency.
- [ ] **Step 5: Rodar** `npm test -- --run` (inclui a checagem de imagens da Task 3) e `npm run check:anon` → PASS. Mostrar as imagens ao usuário.
- [ ] **Step 6: Commit** `feat: níveis de qualidade, fallback estático e telas fictícias`.

### Task 8: Sala no Blender e troca do provisório

**Files:**
- Create: `blender/build_room.py` (gera a cena), `blender/export_room.py` (bake + export GLB + render estático), `tools/check-glb.mjs`, `public/models/sala.glb`, `public/img/sala-estatica.webp`, `src/scene/Room.tsx`, `src/scene/RoomWithFallback.tsx`
- Modify: `src/scene/SceneCanvas.tsx`
- Test: `tools/check-glb.test.ts`, `src/scene/RoomWithFallback.test.tsx`

**Interfaces:**
- Consumes: nomes de objetos e câmeras das Global Constraints; `readPoses` (Task 6); `skills` (cores dos volumes).
- Produces: `checkGlb(path: string): Promise<{ bytes: number; missing: string[] }>` (lê os nós com `@gltf-transform/core`); `npm run check:glb` falha se `bytes > 3*1024*1024` ou `missing.length > 0`. `RoomWithFallback` renderiza `Room` (GLB) e, em erro de carregamento, mantém `PlaceholderRoom` (error boundary).

- [ ] **Step 1: Testes que falham** — `checkGlb` num GLB mínimo gerado no teste com só `monitor_tela` → `missing` contém `estante` e `cam_inicio`. `RoomWithFallback` com `Room` mockado para lançar erro → renderiza `PlaceholderRoom` (data-testid `placeholder-room`).
- [ ] **Step 2: Rodar** → FAIL.
- [ ] **Step 3: Implementar** `checkGlb`, `Room` (`useGLTF('/models/sala.glb')`, poses via `readPoses`) e `RoomWithFallback`.
- [ ] **Step 4: Rodar** → PASS.
- [ ] **Step 5: Modelar no Blender** — o usuário liga a ponte; Claude envia `build_room.py` pela ponte em partes (mesa, monitor, teclado, cadeira, estante com volumes nas cores de `skills`, celular, porta-retrato com textura de `public/img/eu.jpg`, luminária, planta, paredes, empties de câmera), mostrando renders intermediários ao usuário para retorno. Paleta pensada para tema escuro.
- [ ] **Step 6: Exportar** — `export_room.py`: bake de luz (Cycles) em textura, export GLB com Draco/meshopt e texturas comprimidas para `public/models/sala.glb`; render da vista `cam_inicio` para `public/img/sala-estatica.webp`. Salvar o `.blend` fonte em `blender/sala.blend`.
- [ ] **Step 7: Rodar** `npm run check:glb` → OK (≤ 3 MB, nenhum nome ausente); `npm test -- --run` → PASS.
- [ ] **Step 8: Verificar no navegador** — repetir o roteiro da Task 6 Step 5 com o GLB; renomear temporariamente o GLB para simular 404 → sala provisória aparece, sem tela vazia; console sem erros.
- [ ] **Step 9: Commit** `feat: sala 3D do Blender com fallback`.

### Task 9: Revisão final e publicação

**Files:**
- Modify: conforme ajustes da revisão
- Create: `public/cv.pdf` (quando o usuário fornecer; o link de currículo só aparece se o arquivo existir)

- [ ] **Step 1: Verificação completa** — `npm test -- --run`, `npm run check:anon`, `npm run check:glb`, `npm run build` → todos OK; `npm run preview` e roteiro do navegador em 1440 px e 375 px.
- [ ] **Step 2: Revisão do usuário** no navegador; aplicar ajustes.
- [ ] **Step 3: Publicar (com confirmação do usuário)** — push do branch `redesign-3d`, abrir PR para `main`; o usuário ativa em GitHub › Settings › Pages a fonte "GitHub Actions"; merge após aprovação. Conferir `https://marlonfer77.github.io` no ar.
