# Portfólio 3D — design

Data: 2026-11-23 · Repositório: `MarlonFer77/marlonfer77.github.io` (GitHub Pages, branch `main`)

## Intenção

Refazer o portfólio de Marlon Ferreira (dev full-stack) para **conseguir uma vaga**. O leitor é um **recrutador ou tech lead** que recebeu o link e decide em poucos minutos se vale chamar para entrevista. O site precisa provar rápido que Marlon entrega sistemas reais de ponta a ponta, e marcar presença com uma experiência 3D interativa que acompanha toda a navegação.

O site atual (HTML/CSS/JS puro, 4 projetos, encoding quebrado, "© 2025", formulário que não envia) fica desatualizado frente aos ~15 projetos feitos desde então.

## Metas

- Uma **sala de trabalho 3D** (mesa de dev estilizada) presente o tempo todo; a câmera passeia por ela conforme a rolagem e reage ao mouse.
- Cada parada da câmera corresponde a uma seção: **Início → Projetos (monitor) → Habilidades (estante) → Sobre → Contato (celular)**. Objetos da sala são clicáveis e levam à seção/conteúdo correspondente.
- Projetos novos incluídos, com o formato **problema → solução → resultado → stack**.
- Conteúdo legível e navegável mesmo sem 3D (acessibilidade, celular fraco, WebGL indisponível).
- Fácil de manter: adicionar um projeto = adicionar um item num arquivo de dados.

## Não-metas

- Página própria por projeto / SEO forte (foi considerado e preterido; ver Abordagens).
- Blog, CMS, painel admin, i18n (o site é só pt-BR).
- Backend próprio.

## Anti-metas (falharia mesmo funcionando)

- **Citar a empresa empregadora** ou expor código, dados, IPs, nomes de servidores, logos ou telas reais de sistemas internos. Nenhum projeto interno pode ser identificável como da empresa.
- 3D que **atrapalha a leitura**: texto escondido atrás da cena, rolagem "sequestrada" sem saída, ou recrutador precisando "jogar" para achar os projetos.
- Site que demora a mostrar algo útil: o nome, o cargo e um botão de contato precisam aparecer antes do modelo 3D terminar de carregar.
- Travar ou esquentar celular médio.

## Restrições

- Hospedagem: **GitHub Pages**, mesmo repositório e URL `marlonfer77.github.io`. Build via GitHub Actions.
- Modelos 3D produzidos no **Blender 5.3** da máquina do usuário, controlado pela "Ponte Local Claude" (add-on próprio, socket `127.0.0.1:9877` com token; o usuário liga no painel N › Ponte Claude). Exportados como **GLB**.
- Peso alvo da cena: GLB **≤ 3 MB** após compressão (Draco ou meshopt) e texturas comprimidas; iluminação **pré-calculada (bake)** em texturas para não depender de luzes em tempo real.
- Idioma pt-BR, com acentuação correta (UTF-8).
- Repositório fica em pasta sincronizada pelo Google Drive: manter `node_modules`/`dist` fora do Git e atenção a conflitos de sync.

## Abordagens consideradas

1. **React + Vite + React Three Fiber (drei)** — *escolhida pelo usuário.* SPA; R3F + drei entregam controle de câmera por rolagem (`ScrollControls`), objetos clicáveis e HTML embutido em superfícies 3D (`Html`), com fallback para dispositivos fracos. Custo: texto renderizado por JS (SEO e primeiro paint um pouco piores) — aceitável porque o recrutador chega pelo link enviado.
2. **Astro + ilha R3F** — texto em HTML estático, páginas por projeto, melhor SEO. Preterida: duas ferramentas e integração cena↔rolagem mais trabalhosa, para um ganho (busca orgânica) que não é o objetivo.
3. **HTML/JS puro + Three.js + GSAP** — aproveita o site atual, sem build. Preterida: com ~15 projetos e cena interativa, vira código difícil de manter e reimplementa o que o R3F já oferece.

## Decisões tomadas pelo usuário

- Público: recrutador avaliando para vaga.
- Projetos internos entram como **estudos de caso anônimos**, sem citar a empresa (ex.: "Portal de RH para uma rede atacadista"), com telas **refeitas com dados fictícios**, sem link de código/demo.
- Projetos pessoais entram com link de GitHub e demo, quando houver.
- 3D em **interação constante** durante toda a navegação.
- Conceito visual: **B · sala de trabalho 3D** (escolhido entre objeto-herói, sala e nuvem de partículas).
- Stack: **React + Vite + R3F**.

## Design

### Estrutura da página

Uma página única com rolagem. A cena 3D ocupa a tela como fundo fixo (`position: fixed`); o conteúdo HTML rola por cima, em painéis que se alternam de lado para não cobrir o objeto em foco.

| Seção | Câmera foca | Conteúdo HTML |
|---|---|---|
| Início | sala inteira, vista aberta | nome, "Desenvolvedor Full-Stack", stack principal, botões **Ver projetos**, **LinkedIn**, **Currículo (PDF)** |
| Projetos | monitor (tela mostra o projeto ativo) | lista/carrossel de projetos; o projeto selecionado aparece na tela do monitor |
| Habilidades | estante (livros/caixas = grupos de tecnologia) | grupos de habilidades |
| Sobre | porta-retrato na mesa, com a foto real do usuário (`assets/eu.jpg`, aprovado) | resumo profissional curto |
| Contato | celular na mesa (acende) | links: e-mail `dev.marlonfer77@gmail.com`, LinkedIn, GitHub e WhatsApp (os três atuais mantidos; aprovado pelo usuário) |

Navegação superior fixa com as seções; clicar move a rolagem (e a câmera) até lá. Mouse inclina levemente a câmera (parallax); objetos clicáveis têm destaque ao passar o mouse.

### Projetos (conteúdo inicial — chamada do construtor, revisar com o usuário)

Dados em `src/data/projects.ts`: `{ id, titulo, tipo: 'interno'|'pessoal', problema, solucao, resultado, stack[], imagens[], github?, demo? }`.

Internos (anônimos, sem link; o mapeamento para os repositórios locais fica fora do repo público — ver "Fontes"):
- Portal de RH (Node + worker TS, migração SQLite → MySQL, em produção)
- Plataforma de comunicação interna (Angular, Node, PostgreSQL/Supabase)
- Análise de despesas por fornecedor (Angular, Node, em produção)
- Plataforma de gestão operacional
- Controle de balanças e manutenção
- Portal de sistemas web integrado ao ERP
- Controle de estoque de TI
- Requisições de compras
- Análise/geração de cartazes de preço

Pessoais (com links quando públicos):
- Insight RH / Staff-Sync, Stitch Spend Tracker, Bot de Finanças no Telegram, Monitor de Jobs do RM (já no site)
- De Olho na Validade
- Game mobile full-stack
- RPG
- Animação 2D "Laura" / Operação Salvar a Internet

Destaque: os **4–6 mais fortes** aparecem primeiro; os demais em "Outros projetos". Nomes reais de sistemas internos **não** aparecem. O sistema de headcount real × orçado **não** entra como projeto interno separado: fica incorporado à descrição do Insight RH (já público), para não ligar o repositório público ao empregador. *(chamada do construtor)*

### Fontes do conteúdo *(chamadas do construtor)*

- O texto dos projetos é redigido por Claude a partir dos repositórios locais do usuário (`C:\Users\marlon.ferreira\Documents\…`, `G:\Meu Drive\Desenvolvimento\…`), do histórico das sessões e dos repositórios públicos no GitHub. O usuário revisa antes de publicar.
- O mapeamento "projeto anônimo → repositório local" fica em notas privadas (memória do Claude), **nunca** no repositório público.
- As telas com dados fictícios são feitas por Claude: mockups simples em HTML/CSS no estilo de cada sistema, com dados inventados, capturados como imagens WebP. Nenhuma captura de tela real de sistema interno é usada.

### Privacidade do repositório *(chamada do construtor)*

O repositório é público. Tudo o que entra nele — inclusive este documento, planos e scripts em `blender/` — segue as anti-metas: nenhum nome de empresa, sistema interno, servidor ou IP.

### Cena 3D (Blender)

- Sala low-poly estilizada: mesa, monitor, teclado, cadeira, estante com volumes coloridos por grupo de tecnologia, celular, porta-retrato, luminária, planta; paleta que funcione com tema escuro.
- Objetos interativos são **objetos separados e nomeados** no GLB (`monitor_tela`, `estante`, `celular`, `porta_retrato`), para o código encontrar e animar.
- Tela do monitor: superfície em que o código projeta a imagem/HTML do projeto ativo.
- Câmeras de referência por seção podem ser exportadas como empties nomeados (`cam_inicio`, `cam_projetos`, …) para o código interpolar.
- Bake de luz em textura; materiais simples. Script Python de geração/exportação versionado em `blender/` para reprodução.
- **Quem modela:** Claude, controlando o Blender pela ponte; o usuário acompanha e dá retorno visual. *(chamada do construtor)*
- O front-end começa com uma **sala provisória feita de formas simples** (com os mesmos nomes de objetos e câmeras), trocada pelo GLB final quando ele ficar pronto, para que site e modelagem andem em paralelo. *(chamada do construtor)*

### Desempenho e fallback

- Mostrar o conteúdo HTML imediatamente; carregar a cena em seguida com indicador discreto.
- Ajuste automático de qualidade (resolução de render reduzida em GPU fraca).
- Sem WebGL, ou com `prefers-reduced-motion`: imagem estática renderizada da sala no lugar da cena; rolagem normal.
- Em telas estreitas: cena ocupa a metade superior; texto abaixo.

### Outros

- Tema escuro como padrão (a cena é pensada para ele); alternância claro/escuro é opcional.
- Formulário de contato atual não envia nada: substituir por links diretos (chamada do construtor; um serviço como Formspree só se o usuário pedir).
- Currículo em PDF: o usuário fornece o arquivo.
- Atualizar rodapé para o ano corrente automaticamente.

## Deixado ao construtor

- Estrutura de pastas, bibliotecas auxiliares (ex.: animação), testes.
- Detalhes de modelagem, paleta exata e tipografia, respeitando as anti-metas.
- Texto final dos projetos a partir das sessões/repos existentes — revisado pelo usuário antes de publicar.
- Fluxo de deploy (Actions → Pages) e migração do conteúdo atual.
