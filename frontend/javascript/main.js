/* =============================================
   CONFIGURAÇÕES
   ============================================= */
const API_URL = 'http://localhost:8080/api/produtos';

// Wrappers dos Carrosséis
const wrapperColecoes = document.querySelector('.product-carousel .swiper-wrapper');
const wrapperDestaques = document.querySelector('.destaques-carousel .swiper-wrapper');

// Elementos de Interface
const botaoMenu = document.getElementById('btn-menu-toggle');
const menu = document.getElementById('menu-vertical');
const conteudo = document.getElementById('conteudo-principal');
const overlay = document.getElementById('menu-overlay');
const headerPrincipal = document.getElementById('cabecalho-principal');


/* =============================================
   LÓGICA PRINCIPAL (BUSCAR PRODUTOS)
   ============================================= */
async function carregarProdutos() {
    try {
        const response = await fetch(API_URL);
        const produtos = await response.json();

        // Limpa os carrosséis
        wrapperColecoes.innerHTML = '';
        wrapperDestaques.innerHTML = '';

        produtos.forEach(produto => {
            // ★ A GRANDE MUDANÇA: Lógica de Variantes ★
            
            // Se o produto não tem variantes (estoque), não mostramos ele
            if (!produto.variantes || produto.variantes.length === 0) {
                return; 
            }

            // Pegamos a PRIMEIRA variante para ser a "Capa" do produto
            const capa = produto.variantes[0]; 
            
            // Extraímos as cores únicas das variantes para mostrar as bolinhas
            const coresHtml = gerarBolinhasDeCor(produto.variantes);

            // Decide onde desenhar
            if (produto.categoria === 'colecao') {
                wrapperColecoes.innerHTML += criarSlideColecao(produto, capa);
            } 
            else if (produto.categoria === 'destaque') {
                wrapperDestaques.innerHTML += criarSlideDestaque(produto, capa, coresHtml);
            }
        });

        // Atualiza os Swipers
        swiper.update();
        swiperDestaques.update();

    } catch (error) {
        console.error('Erro ao carregar:', error);
    }
}

/* =============================================
   GERADORES DE HTML (TEMPLATES)
   ============================================= */

function criarSlideColecao(produto, capa) {
    return `
    <div class="swiper-slide">
        <a href="#" class="card-marca">
            <img src="${capa.urlImagem}" alt="${produto.nome}">
            
            <h3>${produto.nome}</h3>
        </a>
    </div>
    `;
}

function criarSlideDestaque(produto, capa, coresHtml) {
    // Usa imagem e preço da variante 'capa'
    return `
    <div class="swiper-slide">
        <div class="card-produto">
            <a href="#">
                <img src="${capa.urlImagem}" alt="${produto.nome}">
                <div class="card-produto-info">
                    <h3>${produto.nome}</h3>
                    
                    <div class="card-cores" style="display:flex; gap:5px; margin: 5px 0;">
                        ${coresHtml}
                    </div>

                    <div class="reviews">(0) ☆☆☆☆☆</div>
                    <p class="preco">R$ ${capa.preco.toFixed(2)}</p>
                </div>
            </a>
        </div>
    </div>
    `;
}

// Função para extrair cores únicas das variantes (Ex: tem 5 variantes "Preto", mostra só 1 bolinha preta)
function gerarBolinhasDeCor(variantes) {
    // Set é uma lista que não aceita duplicatas
    const coresUnicas = new Set();
    let html = '';

    variantes.forEach(v => {
        // Se essa cor (hex) ainda não foi processada...
        if (!coresUnicas.has(v.corHex)) {
            coresUnicas.add(v.corHex);
            // Cria a bolinha
            html += `<span style="display:inline-block; width:15px; height:15px; border-radius:50%; background-color:${v.corHex}; border:1px solid #ddd;" title="${v.cor}"></span>`;
        }
    });
    return html;
}


/* =============================================
   INICIALIZAÇÃO E EVENTOS (IGUAL AO ANTERIOR)
   ============================================= */

if (history.scrollRestoration) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

function toggleMenu() {
    menu.classList.toggle('menu-aberto');
    conteudo.classList.toggle('menu-aberto');
    botaoMenu.classList.toggle('menu-aberto');
    overlay.classList.toggle('menu-aberto');
}
botaoMenu.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);

function handleScroll() {
    if (window.scrollY > 1) headerPrincipal.classList.add('header-pequeno');
    else headerPrincipal.classList.remove('header-pequeno');
}
window.addEventListener('scroll', handleScroll);

// Swipers
const swiper = new Swiper('.product-carousel', { 
    // centeredSlides: false, // (Removido ou false para alinhar padrão)
    loop: true, 
    spaceBetween: 20,
    
    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
    },
    pagination: { 
        el:'.swiper-pagination',
        clickable: true,
    },
    navigation: { 
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    
    breakpoints: { 
        // Celular: 1 por vez
        640: { 
            slidesPerView: 1,
        },
        // Tablet: 2 por vez
        768: {
             slidesPerView: 2,
        },
        // Desktop: 3 por vez (O que você pediu)
        1024: { 
            slidesPerView: 3, 
            spaceBetween: 30 
        }
    }
});

const swiperDestaques = new Swiper('.destaques-carousel', { 
    slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 20,
    navigation: { nextEl: '.destaques-carousel .swiper-button-next', prevEl: '.destaques-carousel .swiper-button-prev' },
    breakpoints: { 
        640: { slidesPerView: 2, slidesPerGroup: 2 },
        1024: { slidesPerView: 5, slidesPerGroup: 5 }
    }
});

// ★ INICIA TUDO ★
carregarProdutos();