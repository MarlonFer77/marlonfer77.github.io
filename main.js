// Função de inicialização principal
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileNav();
    initScrollSpy();
    initIntersectionObserver();
    renderProjects();
    initModal();
    initContactForm();
});

// PASSO 2 & 7: Gerenciamento do Tema (Light/Dark)
const initTheme = () => {
    const themeToggle = document.getElementById('theme-toggle');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Função para aplicar o tema
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        themeToggle.setAttribute('aria-pressed', theme === 'dark');
        localStorage.setItem('theme', theme);
    };

    // Verifica o tema salvo ou a preferência do sistema
    const currentTheme = localStorage.getItem('theme') || (systemPrefersDark.matches ? 'dark' : 'light');
    applyTheme(currentTheme);

    // Listener para o botão de toggle
    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    });

    // Listener para mudanças na preferência do sistema
    systemPrefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
};

// PASSO 2: Navegação Mobile (Menu Hambúrguer)
const initMobileNav = () => {
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav__link');

    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
    });

    // Fecha o menu ao clicar em um link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
        });
    });
};

// PASSO 2: Scrollspy - destacar link da seção ativa
const initScrollSpy = () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: '-50% 0px -50% 0px' });

    sections.forEach(section => observer.observe(section));
};

// PASSO 3 & 7: Revelar seções ao rolar
const initIntersectionObserver = () => {
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => observer.observe(section));
};

// PASSO 5: Renderização dinâmica de projetos
const projectsData = [
    { id: 1, title: 'Insight RH', description: 'Sistema full-stack para análise comparativa de quadro de pessoal real vs. orçado, integrando dados do TOTVS RM e substituindo processos manuais.', stack: ['Angular', 'Nodejs', 'Chartjs', 'Oracle', 'Gemini AI', 'Firebase'], imageUrl: 'assets/staff-sync.png', github: 'https://github.com/MarlonFer77/Staff-Sync', demo: 'https://linktr.ee/marlonferreira77' },
    { id: 2, title: 'Stitch Expend Tracker', description: 'Aplicativo de controle de gastos pessoais, com foco em simplicidade, visual limpo e praticidade no acompanhamento financeiro.', stack: ['Angular', 'Nodejs', 'Firebase'], imageUrl: 'assets/stitch.png', github: 'https://github.com/MarlonFer77/stitch-spend-tracker', demo: 'https://linktr.ee/marlonferreira77' },
    { id: 3, title: 'Bot de Finanças no Telegram', description: 'Automação financeira, integração com API do Telegram e foco em praticidade.', stack: ['Python', 'API Telegram'], imageUrl: 'assets/shoyu.jpg', github: 'https://github.com/MarlonFer77/telegram-bot-financify', demo: 'https://linktr.ee/marlonferreira77' },
    { id: 4, title: 'Monitor de Jobs do RM', description: 'Solução corporativa, automação e monitoramento de processos críticos no TOTVS RM.', stack: ['Flutter', 'Nodejs', 'Oracle'], imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475', github: 'https://github.com/MarlonFer77/jobs_monitor_rm', demo: 'https://linktr.ee/marlonferreira77' },
];

const renderProjects = () => {
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = projectsData.map(project => `
        <article class="project-card">
            <img src="${project.imageUrl}" alt="${project.title}" class="project-card__img" loading="lazy" decoding="async">
            <div class="project-card__content">
                <h3 class="project-card__title">${project.title}</h3>
                <div class="project-card__stack chips">
                    ${project.stack.map(tech => `<span class="chip">${tech}</span>`).join('')}
                </div>
                <div class="project-card__links">
                    <a href="${project.github}" class="btn">GitHub</a>
                    <a href="${project.demo}" class="btn">Demo</a>
                    <button class="btn btn--primary" data-project-id="${project.id}">Detalhes</button>
                </div>
            </div>
        </article>
    `).join('');
};

// PASSO 5 & 7: Modal de projetos acessível
const initModal = () => {
    const modal = document.getElementById('project-modal');
    const projectsGrid = document.getElementById('projects-grid');
    if (!modal || !projectsGrid) return;
    
    let previouslyFocusedElement;

    const openModal = (project) => {
        previouslyFocusedElement = document.activeElement;
        document.getElementById('modal-title').textContent = project.title;
        document.getElementById('modal-image').src = project.imageUrl;
        document.getElementById('modal-image').alt = project.title;
        document.getElementById('modal-description').textContent = project.description;
        document.getElementById('modal-stack').innerHTML = project.stack.map(tech => `<span class="chip">${tech}</span>`).join('');
        document.getElementById('modal-links').innerHTML = `<a href="${project.github}" class="btn">GitHub</a><a href="${project.demo}" class="btn">Demo</a>`;
        
        modal.hidden = false;
        modal.classList.add('visible');
        focusTrap(modal);
    };

    const closeModal = () => {
        modal.hidden = true;
        modal.classList.remove('visible');
        if (previouslyFocusedElement) previouslyFocusedElement.focus();
    };

    projectsGrid.addEventListener('click', (e) => {
        if (e.target.matches('[data-project-id]')) {
            const projectId = parseInt(e.target.getAttribute('data-project-id'));
            const project = projectsData.find(p => p.id === projectId);
            if (project) openModal(project);
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target.matches('.modal__backdrop') || e.target.matches('.modal__close')) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('visible')) {
            closeModal();
        }
    });

    const focusTrap = (element) => {
        const focusableElements = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        firstFocusable.focus();

        element.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        });
    };
};

// PASSO 6: Validação do formulário de contato
const initContactForm = () => {
    const form = document.getElementById('contact-form');
    const emailInput = document.getElementById('email');
    const submitButton = form.querySelector('button[type="submit"]');

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailError = emailInput.nextElementSibling;
        
        if (!validateEmail(emailInput.value)) {
            emailError.textContent = 'Por favor, insira um email válido.';
            emailInput.focus();
            return;
        }
        emailError.textContent = '';
        
        // Simulação de envio
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';

        setTimeout(() => {
            showToast('Mensagem enviada com sucesso!');
            form.reset();
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar Mensagem';
        }, 1500);
    });
};

// Função utilitária para Toast
const showToast = (message) => {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
};