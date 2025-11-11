//animação inicial do site, e do botão

const botaoMenu = document.getElementById('btn-menu-toggle');
            const menu = document.getElementById('menu-vertical');
            const conteudo = document.getElementById('conteudo-principal');
            const overlay = document.getElementById('menu-overlay');

            function toggleMenu() {
                menu.classList.toggle('menu-aberto');
                conteudo.classList.toggle('menu-aberto');
                botaoMenu.classList.toggle('menu-aberto');
                overlay.classList.toggle('menu-aberto');
            }

            botaoMenu.addEventListener('click', toggleMenu);
            overlay.addEventListener('click', toggleMenu);

            const headerPrincipal = document.getElementById('cabecalho-principal');

            function handleScroll() {
                if(window.scrollY > 1) {
                    headerPrincipal.classList.add('header-pequeno');
                } else {
                    headerPrincipal.classList.remove('header-pequeno');
                }
            }

            window.addEventListener('scroll', handleScroll);

            const swiper = new swiper('.product-carousel', {
                sliderPerView: 1,
                spaceBetween: 20,
                pagination: {
                    el:'.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                breackpoints: {
                    640: {
                        sliderPerView: 2,
                        spaceBetween: 20,
                    },
                    1024: {
                        sliderPerView: 4,
                        spaceBetween: 30,
                    },
                }
            });