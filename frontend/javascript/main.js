/* =============================================
   CONFIGURAÇÕES
   ============================================= */
const API_URL = 'http://localhost:8080/api/produtos';

// Wrappers dos Carrosséis
// ★ MUDANÇA: Removemos o wrapperColecoes, pois não vamos mexer nele ★
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

        // ★ MUDANÇA: Limpa APENAS os Destaques (Não toca nas Coleções) ★
        wrapperDestaques.innerHTML = '';

        produtos.forEach(produto => {
            
            // Se não tiver estoque, ignora
            if (!produto.variantes || produto.variantes.length === 0) {
                return; 
            }

            const capa = produto.variantes[0]; 
            const coresHtml = gerarBolinhasDeCor(produto.variantes);

            // ★ MUDANÇA: Se a categoria for 'colecao', a gente IGNORA aqui no JS
            // porque elas já estão fixas no HTML.
            if (produto.categoria === 'colecao') {
                return; // Pula este item
            } 

            // Todo o resto vai para "Produtos em Destaque"
            wrapperDestaques.innerHTML += criarSlideDestaque(produto, capa, coresHtml);
        });

        // Atualiza apenas o Swiper de Destaques (o de coleções já inicia sozinho lá embaixo)
        swiperDestaques.update();

    } catch (error) {
        console.error('Erro ao carregar:', error);
    }
}

/* =============================================
   GERADORES DE HTML
   ============================================= */

function criarSlideDestaque(produto, capa, coresHtml) {
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

function gerarBolinhasDeCor(variantes) {
    const coresUnicas = new Set();
    let html = '';
    variantes.forEach(v => {
        if (!coresUnicas.has(v.corHex)) {
            coresUnicas.add(v.corHex);
            html += `<span style="display:inline-block; width:15px; height:15px; border-radius:50%; background-color:${v.corHex}; border:1px solid #ddd;" title="${v.cor}"></span>`;
        }
    });
    return html;
}


/* =============================================
   INICIALIZAÇÃO E EVENTOS
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

// --- SWIPER 1 (Nossas Coleções - FIXO) ---
const swiper = new Swiper('.product-carousel', { 
    loop: true, 
    spaceBetween: 20,
    autoplay: { delay: 3000, disableOnInteraction: false },
    pagination: { el:'.swiper-pagination', clickable: true },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    breakpoints: { 
        640: { slidesPerView: 1 },
        768: { slidesPerView: 1 },
        1024: { slidesPerView: 1, spaceBetween: 30 } // 3 Imagens por vez
    }
});

// --- SWIPER 2 (Produtos em Destaque - DINÂMICO) ---
const swiperDestaques = new Swiper('.destaques-carousel', { 
    slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 20,
    navigation: { nextEl: '.destaques-carousel .swiper-button-next', prevEl: '.destaques-carousel .swiper-button-prev' },
    breakpoints: { 
        640: { slidesPerView: 2, slidesPerGroup: 2 },
        1024: { slidesPerView: 5, slidesPerGroup: 5 }
    }
});

// Inicia o carregamento (Só vai preencher os destaques)
carregarProdutos();

/* =============================================
   BARRA DE PESQUISA EXPANSÍVEL
   ============================================= */

const searchBtn = document.querySelector('.search-btn');
const searchBox = document.querySelector('.search-box');
const searchInput = document.querySelector('.search-input');

if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Impede o link de recarregar a página
        
        // Alterna a classe 'active' no container
        searchBox.classList.toggle('active');
        
        // Se abriu, foca no input para digitar logo
        if (searchBox.classList.contains('active')) {
            searchInput.focus();
        }
    });

    // (Opcional) Fechar se clicar fora
    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target)) {
            searchBox.classList.remove('active');
        }
    });
    
    // (Opcional) Ir para a página de busca ao apertar Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const termo = searchInput.value.trim();
            
            if (termo) {
                // Redireciona para a página de produtos passando o termo na URL
                // Ex: produtos.html?busca=legging
                window.location.href = `produtos.html?busca=${encodeURIComponent(termo)}`;
            }
        }
    });
}