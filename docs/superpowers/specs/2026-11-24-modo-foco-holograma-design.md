# Modo foco com holograma — design

Data: 2026-11-24 · Branch: `redesign-3d` · Complementa `2026-11-23-portfolio-3d-design.md` (que continua valendo: público recrutador, anonimato, sala 3D guiada pela rolagem).

## Intenção

O usuário quer que a navegação 3D seja mais rica: **clicar no computador**, ver **os projetos na tela** e, ao clicar num projeto, vê-lo **expandir em holograma** flutuando na sala. Também quer **imagens nos projetos** e corrigir a **tela do monitor que parece virada para a parede**.

Para o recrutador, o modo foco é o momento "uau" do site — mas ele nunca pode ser obrigatório nem prender o visitante: a rolagem continua sendo o caminho principal.

## Decisões do usuário

- Navegação: **rolagem + modo foco** (a rolagem continua guiando; clicar no computador entra no modo foco; um "Voltar" retoma a rolagem; a lista em texto continua existindo).
- Visual: **A · holograma clássico** — azul translúcido, linhas de varredura, borda luminosa, leve cintilação.
- Construção: **híbrida** — conteúdo do holograma em HTML posicionado no 3D (nítido, links clicáveis, acessível) + efeitos em WebGL (feixe de luz, moldura com varredura animada, brilho na mesa).

## Metas

1. **Corrigir o monitor**: a haste/base atravessam a frente da tela (`blender/build_room.py`: `mon_haste` vai de z −1,34 a −1,30 e a tela está em −1,31). Mover haste e base para trás do corpo, refazer o bake do `monitor` e da `mesa` (sombra da haste) e reexportar `sala.glb`.
2. **Imagens nos projetos**: cada cartão da seção Projetos mostra a imagem principal (miniatura). O holograma mostra uma galeria com todas as imagens do projeto.
3. **Área de trabalho no monitor**: fora do modo foco, a tela mostra uma grade de ícones (miniatura + nome curto) de todos os projetos, com o projeto ativo destacado.
4. **Modo foco**: entrar clicando no monitor 3D ou no botão "Explorar no computador" da seção Projetos. A câmera vai para uma pose de foco de frente para o monitor, com espaço acima para o holograma. A rolagem da página fica travada enquanto durar o foco. Sair com "Voltar", tecla Esc ou clique no vazio da cena; ao sair, a página volta exatamente para onde estava.
5. **Holograma**: clicar num ícone abre o projeto acima do monitor, subindo da tela (animação de ~0,9 s). Conteúdo: título, selo (corporativo/pessoal), galeria (imagem grande + miniaturas clicáveis), problema/solução/resultado, tecnologias, links (só projetos pessoais com repositório público), "anterior/próximo" (com volta ao início no fim da lista) e "fechar". Fechar o holograma volta para a área de trabalho, ainda em foco.
6. **Efeitos WebGL** quando o holograma está aberto: feixe de luz (cone translúcido com gradiente, da tela até a base do painel), moldura atrás do painel com linhas de varredura animadas, e um brilho azul na mesa. Como a sala usa materiais sem iluminação (luz gravada nas texturas), o brilho da mesa é um **plano aditivo** sobre o tampo, não uma luz.

## Não-metas

- Holograma em 3D puro (texto/imagens como malhas) — preterido na escolha da abordagem.
- Explorar a sala livremente sem rolagem.
- Novos projetos ou textos novos (os 19 projetos e textos aprovados continuam).

## Anti-metas

- Modo foco que **prende** o visitante (sem saída óbvia, Esc que não funciona, rolagem que não volta).
- Holograma **ilegível**: efeito por cima do texto, contraste baixo, cintilação forte.
- Quebrar a rolagem, a lista em texto, o fallback estático ou o anonimato (`yarn check:anon` continua obrigatório).
- Celular inutilizável no modo foco.

## Restrições

- Mesma stack e regras do design anterior (React 19, R3F 9, drei 10, Yarn PnP no Drive, GitHub Pages).
- Novos empties no Blender/GLB e na sala provisória: `cam_foco` e `alvo_foco`. `tools/check-glb.ts` passa a exigi-los.
- `prefers-reduced-motion`: sem cintilação, sem animação de subida (aparece direto) e câmera vai ao foco sem transição longa. Qualidade `static` (sem WebGL): não há modo foco; o botão "Explorar no computador" não aparece.
- Desempenho: efeitos com poucos polígonos e um único shader de varredura; nada roda quando o holograma está fechado.

## Abordagens consideradas

1. **Painel HTML com efeito CSS** — rápido, nítido, acessível; parece "adesivo", sem luz na cena.
2. **Holograma 3D puro (shader)** — o mais fiel ao cinema; texto menos nítido, links difíceis, inacessível.
3. **Híbrido** — *escolhido*: HTML para o conteúdo, WebGL para feixe, moldura com varredura e brilho na mesa.

## Design

### Estado

Estender `ActiveProjectContext` (ou criar um contexto vizinho) com: `mode: 'scroll' | 'foco'`, `openId: string | null` (projeto aberto em holograma) e ações `enterFocus()`, `exitFocus()`, `open(id)`, `close()`, `next()`, `prev()`. `next/prev` percorrem `projects` na ordem do arquivo, com volta ao início. Entrar no foco guarda `window.scrollY`; sair restaura. Esc: com holograma aberto, fecha o holograma; sem holograma, sai do foco.

### Câmera

`CameraRig` usa a pose `foco` quando `mode === 'foco'` (ignorando a rolagem), com o mesmo amortecimento, e reduz a inclinação do mouse a ±0,08. Pose de foco: de frente para o monitor, distância suficiente para enquadrar o monitor na metade de baixo e o holograma (~0,9 m de largura, base logo acima da tela) na metade de cima.

### Monitor (área de trabalho)

Substitui o conteúdo atual de `MonitorScreen`: grade de botões (5 colunas) com miniatura e nome curto. No modo rolagem é decorativa (`pointer-events: none`, o clique no monitor entra no foco). No foco, os ícones são botões focáveis com Tab.

### Holograma

- Conteúdo: `drei <Html transform>` acima do monitor, `role="dialog"`, `aria-modal`, rótulo com o título, foco do teclado movido para dentro ao abrir e devolvido ao ícone ao fechar.
- Estilo A: fundo azul translúcido (`rgba(60,140,255,.28)` → `.16`), linhas de varredura (gradiente repetido de 2 px), borda `rgba(140,200,255,.65)`, texto `#dff0ff` com contraste mínimo AA sobre o fundo escuro da cena, cintilação breve a cada ~4 s. As imagens ficam levemente tingidas (`mix-blend-mode: screen` ou sobreposição azul), mas legíveis.
- WebGL: cone do feixe (`ConeGeometry` aberto, material aditivo com gradiente vertical), plano da moldura atrás do painel (shader com varredura que desliza), plano aditivo radial sobre a mesa. Os três entram com o holograma e saem com ele.

### Celular (layout empilhado)

No foco, a cena passa de 45vh para tela cheia (`position: fixed; inset: 0`). O holograma **não** usa `transform` 3D: aparece como painel fixo na metade de baixo da tela, com rolagem interna, mantendo o estilo A. Os ícones do monitor continuam na tela 3D, com tamanho mínimo de toque de 44 px (se não couberem, usar uma faixa HTML de ícones na base, fora do 3D).

### Seção Projetos (HTML)

- Cada cartão ganha a miniatura da primeira imagem (`loading="lazy"`, `alt` descritivo: "Tela ilustrativa de …").
- Botão "Explorar no computador" no topo da seção (some na qualidade `static`).
- A lista continua completa e é o caminho acessível.

### Imagens

Cada projeto já tem 1 imagem. Para a galeria fazer sentido, os **6 destaques** ganham +1 tela fictícia cada (outra vista do mesmo sistema), gerada pelo mesmo `tools/mockups` com dados inventados. *(chamada do redator — o construtor pode ajustar quantidade)*

### Decisões de detalhe *(chamadas do redator, após revisão)*

- **Camada HTML no foco (desktop):** menu, painéis das seções e rodapé somem com um esmaecimento curto e ficam inertes (`inert`), para o monitor e o holograma ficarem no centro da tela. Um botão "Voltar" fixo no canto superior esquerdo aparece no lugar. O resto da página fica fora do alcance do teclado enquanto durar o foco.
- **Celular:** sem feixe, moldura nem brilho na mesa (o holograma é um painel fixo e os efeitos não teriam onde se alinhar). A pose de foco no celular enquadra só o monitor com os ícones.
- **Cliques na sala:** clicar no monitor entra no foco a partir de qualquer seção (não rola até Projetos). No foco, clicar na estante, no porta-retrato ou no celular sai do foco e leva à seção do objeto; clicar no vazio só sai do foco.
- **Botão Voltar do navegador:** entrar no foco cria uma entrada no histórico (`history.pushState`, sem mudar a URL visível além de `#foco`); Voltar do navegador sai do foco (e, com holograma aberto, primeiro fecha o holograma). Sair pelo botão do site remove a entrada para o histórico não acumular.

## Deixado ao construtor

- Valores exatos da pose de foco, tamanhos e animações, desde que respeitem metas e anti-metas.
- Estrutura de componentes e testes.
- Se o brilho da mesa fica melhor como plano aditivo único ou dois (mesa + parede).
