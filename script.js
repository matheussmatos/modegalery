const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const menuOverlay = document.getElementById('menuOverlay');

function toggleMenu() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
}

if (hamburger) hamburger.addEventListener('click', toggleMenu);
if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);

const linksArray = document.querySelectorAll('.nav-links a');
linksArray.forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) toggleMenu();
    });
});

function initializeParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    container.innerHTML = '';
    const isMobile = window.innerWidth <= 768;
    const count = isMobile ? 60 : 150;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = (Math.random() * 100) + '%';
        particle.style.bottom = '0px';

        const size = Math.random() * 2.5 + 0.8;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.opacity = '0';

        particle.style.animationDuration = (Math.random() * 10 + 7) + 's';
        particle.style.animationDelay = (Math.random() * 12) + 's';

        fragment.appendChild(particle);
    }
    container.appendChild(fragment);
}

window.addEventListener('DOMContentLoaded', initializeParticles);

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        initializeParticles();
    }, 250);
});

window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loading');
        if (loader) loader.classList.add('hidden');
    }, 1500);
});

const gradient = document.getElementById('mouseGradient');
if (window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;

        if (gradient) {
            gradient.style.backgroundImage = `radial-gradient(
                600px at ${x}% ${y}%,
                rgba(70, 70, 70, 0.15) 0%,
                transparent 100%
            )`;
        }
    }, { passive: true });
}

const anchorLinks = document.querySelectorAll('a[href^="#"]');
anchorLinks.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const id = this.getAttribute('href');
        if (!id.startsWith('#') || id === '#') return;

        e.preventDefault();
        const targetElement = document.querySelector(id);
        if (targetElement) {
            const offset = targetElement.offsetTop - (window.innerWidth <= 768 ? 60 : 80);
            window.scrollTo({
                top: offset,
                behavior: 'smooth'
            });
        }
    });
});

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            scrollObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('[data-aos]').forEach(element => {
    scrollObserver.observe(element);
});

const creatorModal = document.getElementById('creatorModal');
const btnCreatorTrigger = document.getElementById('btnCreator');
const creatorCloseTrigger = document.getElementById('creatorClose');

if (btnCreatorTrigger && creatorModal) {
    btnCreatorTrigger.addEventListener('click', () => {
        creatorModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

if (creatorCloseTrigger && creatorModal) {
    creatorCloseTrigger.addEventListener('click', () => {
        creatorModal.classList.remove('active');
        document.body.style.overflow = '';
    });
}

const aboutTrack = document.getElementById('aboutCarouselTrack');
const aboutPrev = document.getElementById('aboutCarPrev');
const aboutNext = document.getElementById('aboutCarNext');
const aboutDotsContainer = document.getElementById('aboutCarDots');
const aboutTabs = document.querySelectorAll('.about-tab-btn');
const aboutPanels = document.querySelectorAll('.about-panel');

if (aboutTrack) {
    const slides = aboutTrack.querySelectorAll('.carousel-img');
    let currentSlide = 0;
    let autoSlideInterval;

    slides.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.className = `car-dot ${idx === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(idx));
        aboutDotsContainer.appendChild(dot);
    });

    const dots = aboutDotsContainer.querySelectorAll('.car-dot');

    function updateCarousel() {
        aboutTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentSlide);
        });
    }

    function nextSlide() {
        currentSlide = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
        updateCarousel();
    }

    function goToSlide(idx) {
        currentSlide = idx;
        updateCarousel();
        resetAutoSlide();
    }

    function startAutoSlide() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(nextSlide, 3500);
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    function resetAutoSlide() {
        startAutoSlide();
    }

    if (aboutPrev) {
        aboutPrev.addEventListener('click', () => {
            currentSlide = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
            updateCarousel();
            resetAutoSlide();
        });
    }

    if (aboutNext) {
        aboutNext.addEventListener('click', () => {
            nextSlide();
            resetAutoSlide();
        });
    }

    let startX = 0;
    let isDragging = false;

    aboutTrack.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        stopAutoSlide();
    }, {passive: true});

    aboutTrack.addEventListener('touchmove', (e) => {
        if(!isDragging) return;
        const currentX = e.touches[0].clientX;
        const diff = startX - currentX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                currentSlide = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
            } else {
                currentSlide = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
            }
            updateCarousel();
            isDragging = false;
            resetAutoSlide();
        }
    }, {passive: true});

    aboutTrack.addEventListener('touchend', () => {
        isDragging = false;
        resetAutoSlide();
    });

    if (btnCreatorTrigger) {
        btnCreatorTrigger.addEventListener('click', startAutoSlide);
    }

    if (creatorCloseTrigger) {
        creatorCloseTrigger.addEventListener('click', stopAutoSlide);
    }

    if (creatorModal) {
        creatorModal.addEventListener('click', (e) => {
            if (e.target === creatorModal) stopAutoSlide();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') stopAutoSlide();
    });
}

if (aboutTabs.length > 0) {
    aboutTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            aboutTabs.forEach(t => t.classList.remove('active'));
            aboutPanels.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const target = tab.getAttribute('data-target');
            document.getElementById(`panel-${target}`).classList.add('active');
        });
    });
}

const ytTrack = document.getElementById('ytCarouselTrack');
const ytPrev = document.getElementById('ytCarPrev');
const ytNext = document.getElementById('ytCarNext');
const ytDotsContainer = document.getElementById('ytCarDots');

if (ytTrack) {
    const ytSlides = ytTrack.querySelectorAll('.yt-slide');
    let currentYtSlide = 0;

    ytSlides.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.className = `car-dot ${idx === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goYtSlide(idx));
        ytDotsContainer.appendChild(dot);
    });

    const ytDots = ytDotsContainer.querySelectorAll('.car-dot');

    function updateYtCarousel() {
        ytTrack.style.transform = `translateX(-${currentYtSlide * 100}%)`;
        ytDots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentYtSlide);
        });
    }

    function nextYtSlide() {
        currentYtSlide = currentYtSlide === ytSlides.length - 1 ? 0 : currentYtSlide + 1;
        updateYtCarousel();
    }

    function prevYtSlide() {
        currentYtSlide = currentYtSlide === 0 ? ytSlides.length - 1 : currentYtSlide - 1;
        updateYtCarousel();
    }

    function goYtSlide(idx) {
        currentYtSlide = idx;
        updateYtCarousel();
    }

    if (ytPrev) ytPrev.addEventListener('click', prevYtSlide);
    if (ytNext) ytNext.addEventListener('click', nextYtSlide);

    let ytStartX = 0;
    let ytDragging = false;

    ytTrack.addEventListener('touchstart', (e) => {
        ytStartX = e.touches[0].clientX;
        ytDragging = true;
    }, {passive: true});

    ytTrack.addEventListener('touchmove', (e) => {
        if(!ytDragging) return;
        const diff = ytStartX - e.touches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextYtSlide();
            else prevYtSlide();
            ytDragging = false;
        }
    }, {passive: true});

    ytTrack.addEventListener('touchend', () => { ytDragging = false; });
}

const phoneInput = document.getElementById('phoneInput');
if (phoneInput) {
    phoneInput.addEventListener('input', function (e) {
        let numericValue = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        e.target.value = !numericValue[2] ? numericValue[1] : '(' + numericValue[1] + ') ' + numericValue[2] + (numericValue[3] ? '-' + numericValue[3] : '');
    });
}

const formSuccessModal = document.getElementById('successModal');
const contactForm = document.getElementById('contactForm');
const contactFormClose = document.querySelector('.contact-close');

if (contactForm && formSuccessModal && contactFormClose) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const errorContainer = document.getElementById('formError');
        const emailField = contactForm.querySelector('input[type="email"]').value;
        const phoneField = phoneInput.value.replace(/\D/g, '');

        const emailValidationRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailValidationRegex.test(emailField)) {
            errorContainer.textContent = 'Por favor, insira um e-mail válido.';
            errorContainer.style.display = 'block';
            return;
        }

        if (phoneField.length > 0 && phoneField.length < 10) {
            errorContainer.textContent = 'O telefone informado está incompleto. Insira com DDD.';
            errorContainer.style.display = 'block';
            return;
        }

        errorContainer.style.display = 'none';

        const submitActionBtn = document.getElementById('submitBtn');
        const defaultBtnText = submitActionBtn.textContent;
        submitActionBtn.textContent = 'Enviando...';
        submitActionBtn.disabled = true;

        const payload = new FormData(contactForm);
        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(payload).toString()
        })
        .then(() => {
            formSuccessModal.classList.add('active');
            contactForm.reset();
            document.body.style.overflow = 'hidden';
        })
        .catch(() => {
            errorContainer.textContent = 'Erro de conexão. Tente enviar diretamente pelo Instagram.';
            errorContainer.style.display = 'block';
        })
        .finally(() => {
            submitActionBtn.textContent = defaultBtnText;
            submitActionBtn.disabled = false;
        });
    });

    contactFormClose.addEventListener('click', () => {
        formSuccessModal.classList.remove('active');
        document.body.style.overflow = '';
    });
}

const galleryModal = document.getElementById('galleryModal');
const isMobileDevice = window.innerWidth <= 768;
const galleryItemsList = document.querySelectorAll('.gallery-item');
let activeGalleryIndex = 0;

function handleGalleryOpen(index) {
    if (index < 0 || index >= galleryItemsList.length) return;
    activeGalleryIndex = index;

    const item = galleryItemsList[index];
    const imageElement = item.querySelector('img');
    const mediaTitle = item.getAttribute('data-title') || imageElement.alt;
    const mediaDesc = item.getAttribute('data-desc') || 'Arte exclusiva Mode Sketch.';

    document.getElementById('galleryModalImg').src = imageElement.src;
    document.getElementById('galleryModalTitle').textContent = mediaTitle;
    document.getElementById('galleryModalDesc').textContent = mediaDesc;

    if (galleryModal) {
        galleryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

galleryItemsList.forEach((item, index) => {
    if (!isMobileDevice) {
        item.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -12;
            const rotateY = ((x - centerX) / centerX) * 12;

            this.style.transform = `perspective(1000px) scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            const imgEl = this.querySelector('img');
            if (imgEl) imgEl.style.filter = 'contrast(1.1) brightness(1.05)';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = `perspective(1000px) scale(1) rotateX(0) rotateY(0)`;
            const imgEl = this.querySelector('img');
            if (imgEl) imgEl.style.filter = 'contrast(1.1)';
        });

        item.addEventListener('click', () => handleGalleryOpen(index));
    } else {
        let isDragScroll = false;
        let dragStartY = 0, dragStartX = 0;

        item.addEventListener('touchstart', function(e) {
            isDragScroll = false;
            dragStartY = e.touches[0].clientY;
            dragStartX = e.touches[0].clientX;
            this.style.transform = 'scale(0.98)';
        }, { passive: true });

        item.addEventListener('touchmove', function(e) {
            if (Math.abs(e.touches[0].clientY - dragStartY) > 10 || Math.abs(e.touches[0].clientX - dragStartX) > 10) {
                isDragScroll = true;
                this.style.transform = 'scale(1)';
            }
        }, { passive: true });

        item.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
            if (!isDragScroll) handleGalleryOpen(index);
        });
    }
});

const btnPrevGallery = document.getElementById('galleryPrev');
const btnNextGallery = document.getElementById('galleryNext');

if (btnPrevGallery) {
    btnPrevGallery.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextIndex = activeGalleryIndex === 0 ? galleryItemsList.length - 1 : activeGalleryIndex - 1;
        handleGalleryOpen(nextIndex);
    });
}

if (btnNextGallery) {
    btnNextGallery.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextIndex = activeGalleryIndex === galleryItemsList.length - 1 ? 0 : activeGalleryIndex + 1;
        handleGalleryOpen(nextIndex);
    });
}

const globalModals = document.querySelectorAll('.modal');
globalModals.forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
            if(!document.querySelector('.modal.active')) {
                document.body.style.overflow = '';
            }
        }
    });
});

document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) modal.classList.remove('active');
        if (!document.querySelector('.modal.active')) {
            document.body.style.overflow = '';
        }
    });
});

document.addEventListener('keydown', (e) => {
    const isGalleryActive = galleryModal && galleryModal.classList.contains('active');

    if (e.key === 'Escape') {
        globalModals.forEach(modal => modal.classList.remove('active'));
        document.body.style.overflow = '';
    } else if (isGalleryActive && e.key === 'ArrowLeft') {
        const nextIndex = activeGalleryIndex === 0 ? galleryItemsList.length - 1 : activeGalleryIndex - 1;
        handleGalleryOpen(nextIndex);
    } else if (isGalleryActive && e.key === 'ArrowRight') {
        const nextIndex = activeGalleryIndex === galleryItemsList.length - 1 ? 0 : activeGalleryIndex + 1;
        handleGalleryOpen(nextIndex);
    }
});

const topNavbar = document.querySelector('nav');
let isScrolling = false;

window.addEventListener('scroll', () => {
    if (!isScrolling) {
        window.requestAnimationFrame(() => {
            if (window.scrollY > 100) {
                topNavbar.style.padding = window.innerWidth <= 768 ? '15px 20px' : '20px 60px';
                topNavbar.style.background = 'rgba(0, 0, 0, 0.95)';
                topNavbar.style.backdropFilter = 'blur(10px)';
            } else {
                topNavbar.style.padding = window.innerWidth <= 768 ? '20px' : '30px 60px';
                topNavbar.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%)';
                topNavbar.style.backdropFilter = 'none';
            }
            isScrolling = false;
        });
        isScrolling = true;
    }
}, { passive: true });

// Blog
function openBlogModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const blogGrid = document.getElementById('blogGrid');
    if (blogGrid) {
        const cards = Array.from(blogGrid.querySelectorAll('.blog-card'));
        const nextBtn = document.getElementById('blogNext');
        const prevBtn = document.getElementById('blogPrev');
        const tabs = document.querySelectorAll('#blogCategoryTabs .cat-tab');

        const toggleBtn = document.getElementById('blogCategoryToggle');
        const dropdown = document.getElementById('blogCategoryTabs');

        if(toggleBtn && dropdown) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });

            document.addEventListener('click', (e) => {
                if (!toggleBtn.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.remove('show');
                }
            });
        }

        let currentIndex = 0;
        let visibleCards = [...cards];

        function getCardsPerView() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }

        function updateFilter(category) {
            visibleCards = [];
            cards.forEach(card => {
                const cardCat = card.getAttribute('data-category').toLowerCase();
                if (category === 'todos' || cardCat === category) {
                    card.style.display = 'block';
                    visibleCards.push(card);
                } else {
                    card.style.display = 'none';
                }
            });

            let emptyState = document.getElementById('blogEmptyState');
            if (visibleCards.length === 0) {
                if (!emptyState) {
                    emptyState = document.createElement('div');
                    emptyState.id = 'blogEmptyState';
                    emptyState.style.width = '100%';
                    emptyState.style.textAlign = 'center';
                    emptyState.style.padding = '40px 20px';
                    emptyState.style.color = 'rgba(255,255,255,0.4)';
                    emptyState.style.letterSpacing = '2px';
                    emptyState.style.textTransform = 'uppercase';
                    emptyState.style.fontFamily = "'Anton', sans-serif";
                    emptyState.textContent = 'Nenhuma matéria encontrada nesta categoria.';
                    blogGrid.parentNode.insertBefore(emptyState, blogGrid.nextSibling);
                }
                emptyState.style.display = 'block';
                blogGrid.style.display = 'none';
            } else {
                if (emptyState) emptyState.style.display = 'none';
                blogGrid.style.display = 'flex';
            }

            currentIndex = 0;
            updateCarousel();
        }

        function updateCarousel() {
            const cardsPerView = getCardsPerView();
            const maxIndex = Math.max(0, visibleCards.length - cardsPerView);

            if (currentIndex > maxIndex) currentIndex = maxIndex;
            if (currentIndex < 0) currentIndex = 0;

            const gap = window.innerWidth <= 768 ? 20 : 30;

            if (visibleCards.length > 0) {
                const cardWidth = visibleCards[0].offsetWidth;
                const translateX = -(currentIndex * (cardWidth + gap));
                blogGrid.style.transform = `translateX(${translateX}px)`;
            }

            if (prevBtn) {
                prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '1';
                prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
            }
            if (nextBtn) {
                nextBtn.style.opacity = (currentIndex >= maxIndex || maxIndex === 0) ? '0.3' : '1';
                nextBtn.style.pointerEvents = (currentIndex >= maxIndex || maxIndex === 0) ? 'none' : 'auto';
            }

            visibleCards.forEach((card, index) => {
                if (index >= currentIndex && index < currentIndex + cardsPerView) {
                    card.classList.add('active-slide');
                } else {
                    card.classList.remove('active-slide');
                }
            });
        }

        if (nextBtn) nextBtn.addEventListener('click', () => { currentIndex++; updateCarousel(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { currentIndex--; updateCarousel(); });

        let startX = 0;
        let isDragging = false;

        blogGrid.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, {passive: true});

        blogGrid.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const diff = startX - e.touches[0].clientX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    currentIndex++;
                } else {
                    currentIndex--;
                }
                updateCarousel();
                isDragging = false;
            }
        }, {passive: true});

        blogGrid.addEventListener('touchend', () => { isDragging = false; });

        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');

                if(dropdown && toggleBtn) {
                    dropdown.classList.remove('show');
                    toggleBtn.innerHTML = `${e.target.textContent} <span style="font-size: 10px;">▼</span>`;
                }

                blogGrid.style.opacity = '0';
                blogGrid.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    updateFilter(e.target.getAttribute('data-cat'));
                    blogGrid.style.opacity = '1';
                }, 250);
            });
        });

        window.addEventListener('resize', updateCarousel);
        updateCarousel();
    }
});

// Descubra
document.addEventListener('DOMContentLoaded', () => {
    const profilesGrid = document.getElementById('profilesGrid');
    if (!profilesGrid) return;

    const profiles = [
        {
            category: 'musica',
            name: 'Lucas Hakai',
            url: 'https://instagram.com/lucas_hakai',
            img: 'img/hakai-icon.jpeg',
            coverImg: 'img/hakai-icon.jpeg',
            desc: 'Lucas Hakai é um rapper e designer de Santo André (SP) que transformou sua vivência como espectador nas batalhas de rima em uma carreira autoral. Com uma caminhada iniciada em 2015 pelo EP "Retrato De Uma Ausência", Hakai une a inspiração do "corre" de Emicida a uma sonoridade versátil. Tem como influências Kendrick Lamar, Racionais, A$ap Rocky e Bob Marley.'
        },
        {
            category: 'musica',
            name: 'Dayan',
            url: 'https://instagram.com/d_eodayan',
            img: 'img/dayan-icon.jpeg',
            coverImg: 'img/dayan-icon.jpeg',
            desc: 'Dayan é um rapper da região do ABC paulista, sempre foi apaixonado pela cultura hip-hop, com grande apreço pelas métricas começou a fazer música ainda na infância. Dayan é um artista que explora várias vertentes mas com foco atual em Rap e Trap.'
        },
        {
            category: 'tattoo',
            name: 'Dida Matos Tattoo',
            url: 'https://instagram.com/didamatos.tattoo',
            img: 'img/dida-icon.jpeg',
            coverImg: 'img/dida-icon.jpeg',
            desc: 'Dida começou a desenhar ainda na infância, e desde então seguiu estudando para se aprimorar. Formado em design gráfico, fotografia e publicidade, Dida trabalhou por 30 anos com desenho técnico. Há poucos anos migrou para a tatuagem e se especializou em pontilhismo geométrico e tribais polinésios.'
        },
        {
            category: 'outros',
            name: 'Gawx Art',
            url: 'https://instagram.com/gawx_art',
            img: 'img/gawx-icon.jpg',
            coverImg: 'img/gawx-icon.jpg',
            desc: 'Gawx é um renomado ilustrador e criador de conteúdo conhecido mundialmente por seu estilo vibrante e extremamente detalhado. Explorando o universo do doodle art e do character design, ele transforma telas, shapes de skate e vestuário em verdadeiras explosões de cores e formas marcantes.'
        },
        {
            category: 'tattoo',
            name: 'Art Corvus',
            url: 'https://instagram.com/art.corvus',
            img: 'img/corvus-icon.jpg',
            coverImg: 'img/corvus-icon.jpg',
            desc: 'Corvus possui um trabalho imerso em uma estética sombria e enigmática. Trabalhando intensamente com blackwork, contrastes e temas como o ocultismo e o misticismo, sua arte atrai amantes do estilo dark, unindo elementos macabros a uma precisão técnica fascinante.'
        },
        {
            category: 'outros',
            name: 'Jocular Ocular',
            url: 'https://instagram.com/jocular.ocular',
            img: 'img/jocular-icon.jpg',
            coverImg: 'img/jocular-icon.jpg',
            desc: 'Jocular Ocular explora o surrealismo e o bizarro através de obras que desafiam a percepção. Com um trabalho focado em ilusões de ótica, abstração e elementos anatômicos reimaginados, suas criações convidam o espectador a um mergulho em um universo mental complexo.'
        },
        {
            category: 'outros',
            name: 'Rawls Oner',
            url: 'https://instagram.com/rawls.oner',
            img: 'img/rawls-icon.jpg',
            coverImg: 'img/rawls-icon.jpg',
            desc: 'Rawls Oner traz a verdadeira essência das ruas para a sua arte. Com raízes fortes no graffiti, na cultura urbana e no handstyle, ele combina tipografias agressivas, throw-ups e técnicas em spray, deixando sua marca registrada com um estilo autêntico e inconfundível.'
        }
    ];

    const categoryLabels = { musica: 'Música', tattoo: 'Tattoo', outros: 'Outros' };

    function openProfileModal(p) {
        document.getElementById('pm-avatar').src = p.img;
        document.getElementById('pm-name').textContent = p.name;
        document.getElementById('pm-cat').textContent = categoryLabels[p.category] || p.category;
        document.getElementById('pm-desc').textContent = p.desc;
        document.getElementById('pm-link').href = p.url;

        const modal = document.getElementById('profileModal');
        if(modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function renderCard(p) {
        const cardElement = document.createElement('div');
        cardElement.className = 'profile-card';
        cardElement.setAttribute('data-category', p.category);

        cardElement.innerHTML = `
            <div class="ig-preview">
                <div class="ig-topbar">
                    <img src="${p.img}" alt="${p.name}" class="ig-avatar" onerror="this.style.background='#222';this.src=''">
                    <span class="ig-username">${p.name}</span>
                    <span class="ig-logo">
                        <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    </span>
                </div>
                <img src="${p.coverImg}" alt="${p.name}" class="ig-cover" onerror="this.style.background='#111'">
                <div class="ig-bottombar">
                    <span class="ig-tag">${categoryLabels[p.category] || p.category}</span>
                    <span class="ig-open-btn">
                        Ver Artista
                        <svg viewBox="0 0 24 24"><path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42L17.59 5H14V3zM5 5h6V3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6h-2v6H5V5z"/></svg>
                    </span>
                </div>
            </div>
            <div class="card-info">
                <div class="card-header">
                    <img src="${p.img}" alt="${p.name}" class="card-avatar" onerror="this.style.background='#222'">
                    <div class="card-meta">
                        <div class="card-name">${p.name}</div>
                    </div>
                    <span class="card-category-badge">${categoryLabels[p.category] || p.category}</span>
                </div>
                <p class="card-desc">${p.desc}</p>
            </div>
        `;

        cardElement.addEventListener('click', () => {
            openProfileModal(p);
        });

        return cardElement;
    }

    function initFilterLogic(categoryKey) {
        profilesGrid.innerHTML = '';
        let dataset = [];

        if (categoryKey === 'todos') {
            const addedCategories = new Set();
            for (let p of profiles) {
                if (!addedCategories.has(p.category)) {
                    dataset.push(p);
                    addedCategories.add(p.category);
                }
                if (addedCategories.size === 3) break;
            }
        } else {
            dataset = profiles.filter(p => p.category === categoryKey);
        }

        if (dataset.length === 0) {
            profilesGrid.innerHTML = '<div class="empty-state">Nenhum perfil encontrado nesta categoria.</div>';
            return;
        }

        dataset.forEach((p, idx) => {
            const card = renderCard(p);
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = `opacity 0.5s ease ${idx * 0.08}s, transform 0.5s ease ${idx * 0.08}s`;
            profilesGrid.appendChild(card);
            requestAnimationFrame(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });
        });
    }

    const toggleBtnDescubra = document.getElementById('descubraCategoryToggle');
    const dropdownDescubra = document.getElementById('categoryTabs');

    if(toggleBtnDescubra && dropdownDescubra) {
        toggleBtnDescubra.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownDescubra.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!toggleBtnDescubra.contains(e.target) && !dropdownDescubra.contains(e.target)) {
                dropdownDescubra.classList.remove('show');
            }
        });
    }

    const filterTabs = document.querySelectorAll('#categoryTabs .cat-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            if(dropdownDescubra && toggleBtnDescubra) {
                dropdownDescubra.classList.remove('show');
                toggleBtnDescubra.innerHTML = `${this.textContent} <span style="font-size: 10px;">▼</span>`;
            }

            initFilterLogic(this.getAttribute('data-cat'));
        });
    });

    initFilterLogic('todos');

    console.log('%c MODE SKETCH ', 'background: #000; color: #fff; font-size: 20px; padding: 10px;');
    console.log('%c Todos os modos de arte ', 'background: #222; color: #fff; font-size: 14px; padding: 5px;');
});

// Netlify Identity
document.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('authBtn');
    const authBtnText = document.getElementById('authBtnText');

    if (window.netlifyIdentity) {
        // user.jwt() renova o token vencido; o _redirects lê o nf_jwt para liberar /membros/
        function sincronizarCookieFresco(user) {
            if (user && typeof user.jwt === 'function') {
                user.jwt().then(function (token) {
                    document.cookie = 'nf_jwt=' + token + '; path=/; SameSite=Lax';
                }).catch(function () {});
            }
        }

        window.netlifyIdentity.on('init', user => {
            sincronizarCookieFresco(user);
            updateAuthUI(user);
        });

        window.netlifyIdentity.on('login', user => {
            sincronizarCookieFresco(user);
            updateAuthUI(user);
            window.netlifyIdentity.close();
        });

        window.netlifyIdentity.on('logout', () => {
            document.cookie = 'nf_jwt=; path=/; SameSite=Lax; max-age=0';
            updateAuthUI(null);
        });

        if (authBtn) {
            authBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const currentUser = window.netlifyIdentity.currentUser();
                if (currentUser) {
                    window.netlifyIdentity.open();
                } else {
                    window.netlifyIdentity.open('login');
                }
            });
        }
    }

    function updateAuthUI(user) {
        if (!authBtnText) return;
        if (user) {
            const name = user.user_metadata && user.user_metadata.full_name ? user.user_metadata.full_name.split(' ')[0] : 'Conta';
            authBtnText.textContent = name;
            authBtn.setAttribute('title', `Logado como ${user.email}`);
        } else {
            authBtnText.textContent = 'Entrar';
            authBtn.setAttribute('title', 'Entrar');
        }
    }
});

// Efeitos dos títulos no mobile
(function () {
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const GLYPHS = '!<>-_\\/[]{}=+*^?#01XZ';
    const titles = document.querySelectorAll(
        '.hero-title.mobile-only, .section-title.mobile-only, h2.section-title, .youtube-title'
    );
    if (!titles.length) return;

    // Só os nós de texto, para não perder os <br>
    function textNodes(el) {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const out = [];
        let n;
        while ((n = walker.nextNode())) if (n.nodeValue.trim()) out.push(n);
        return out;
    }

    function scramble(el) {
        if (el._scrambling) return;
        el._scrambling = true;
        const nodes = textNodes(el);
        nodes.forEach(n => { if (n._final === undefined) n._final = n.nodeValue; });
        const isSection = el.matches('h2.section-title');
        if (isSection) el.dataset.state = '// decodificando';

        const total = 18;
        let frame = 0;
        (function tick() {
            nodes.forEach(n => {
                const f = n._final;
                let s = '';
                for (let k = 0; k < f.length; k++) {
                    const ch = f[k];
                    s += (ch === ' ' || frame / total > k / f.length) ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
                }
                n.nodeValue = s;
            });
            if (++frame <= total) {
                setTimeout(tick, 45);
            } else {
                nodes.forEach(n => { n.nodeValue = n._final; });
                el._scrambling = false;
                if (isSection) {
                    el.dataset.state = '// ok';
                    setTimeout(() => { el.dataset.state = ''; }, 1600);
                }
            }
        })();
    }

    function play(el, cls, ms) {
        el.classList.remove(cls);
        void el.offsetWidth; // reinicia a animação
        el.classList.add(cls);
        clearTimeout(el['_t_' + cls]);
        el['_t_' + cls] = setTimeout(() => el.classList.remove(cls), ms);
    }

    function iniciar() {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                play(entry.target, 't-boot', 750);
                scramble(entry.target);
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.4 });
        titles.forEach(t => obs.observe(t));
    }

    titles.forEach(t => {
        t.addEventListener('click', () => {
            play(t, 't-burst', 500);
            scramble(t);
        });
    });

    document.addEventListener('touchstart', e => {
        const card = e.target.closest('.gallery-item, .profile-card, .glass-widget, .blog-card, .shop-card');
        if (card) play(card, 't-tap', 400);
    }, { passive: true });

    // Espera o loading sumir antes de animar
    const loader = document.getElementById('loading');
    if (loader) {
        window.addEventListener('load', () => setTimeout(iniciar, 1700));
    } else {
        iniciar();
    }
})();