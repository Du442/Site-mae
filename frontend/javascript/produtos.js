// ============================================================
// CONFIGURAÇÕES GERAIS
// ============================================================
const API_URL_BASE = 'http://localhost:8080/api/produtos'; // Ajustei para a base
const gradeProdutos = document.getElementById('grade-produtos');
const containerPaginacao = document.getElementById('paginacao-container');

// Elementos do Menu
const botaoMenu = document.getElementById('btn-menu-toggle');
const menu = document.getElementById('menu-vertical');
const conteudo = document.getElementById('conteudo-principal');
const overlay = document.getElementById('menu-overlay');

// Configurações da Paginação
const PRODUTOS_POR_PAGINA = 50;
let paginaAtual = 1;
let todosOsProdutos = [];

// ============================================================
// 1. INICIALIZAÇÃO E EVENTOS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    
    const btnFiltro = document.getElementById('btn-abre-filtro');
    const listaFiltros = document.getElementById('lista-filtros');

    if (btnFiltro && listaFiltros) {
        btnFiltro.addEventListener('click', () => {
            listaFiltros.classList.toggle('aberto');
            btnFiltro.classList.toggle('ativo');
        });
    }

    const checkboxes = document.querySelectorAll('.filtro-check');
    checkboxes.forEach(check => {
        check.addEventListener('change', () => {
            // Se mudar qualquer checkbox, recarrega a lista do zero
            carregarTodosProdutos(); 
        });
    });

    // B) Inicia o carregamento
    carregarTodosProdutos();
});


// ============================================================
// 2. FUNÇÃO PRINCIPAL DE CARREGAMENTO 
// ============================================================
async function carregarTodosProdutos() {
    try {
        // A) Texto da Busca (da URL ou do Input)
        const paramsURL = new URLSearchParams(window.location.search);
        let termoBusca = paramsURL.get('busca') || ''; 

        // Se o usuário digitou algo na barra de pesquisa da página e deu enter, usamos esse valor
        const searchInput = document.querySelector('.search-input');
        if (searchInput && searchInput.value.trim() !== '') {
            termoBusca = searchInput.value;
        }

        // B) Categorias Selecionadas (Checkboxes)
        const checkboxesMarcados = document.querySelectorAll('.filtro-check:checked');
        const categoriasSelecionadas = Array.from(checkboxesMarcados).map(cb => cb.value);

        // Usaremos o endpoint novo que criamos: /filtrar
        const url = new URL(`${API_URL_BASE}/filtrar`);
        
        // Adiciona parâmetros se existirem
        if (termoBusca) {
            url.searchParams.append('termo', termoBusca);
            
            // Atualiza título visualmente
            const titulo = document.querySelector('h1');
            if(titulo) titulo.innerText = `Resultados para: "${termoBusca}"`;
        } else {
             const titulo = document.querySelector('h1');
             if(titulo) titulo.innerText = `Catálogo Completo`;
        }
        
        // Adiciona cada categoria (ex: &categorias=short&categorias=top)
        if (categoriasSelecionadas.length > 0) {
            categoriasSelecionadas.forEach(cat => {
                url.searchParams.append('categorias', cat);
            });
        }

        console.log("Chamando API:", url.toString()); // Útil para debugar
        const response = await fetch(url);
        const produtos = await response.json();
        
        // Filtra apenas produtos que têm estoque (variantes)
        todosOsProdutos = produtos.filter(p => p.variantes && p.variantes.length > 0);

        if (todosOsProdutos.length === 0) {
            gradeProdutos.innerHTML = '<p style="grid-column: 1/-1; text-align:center; font-size: 18px; margin-top: 20px;">Nenhum produto encontrado com esses filtros.</p>';
            containerPaginacao.innerHTML = '';
            return;
        }

        // Renderiza a primeira página
        renderizarPagina(1);

    } catch (error) {
        console.error(error);
        gradeProdutos.innerHTML = '<p>Erro ao carregar produtos.</p>';
    }
}

// ============================================================
// 3. PAGINAÇÃO E RENDERIZAÇÃO (MANTENHA IGUAL)
// ============================================================
function renderizarPagina(pagina) {
    paginaAtual = pagina;
    gradeProdutos.innerHTML = '';

    const inicio = (pagina - 1) * PRODUTOS_POR_PAGINA;
    const fim = inicio + PRODUTOS_POR_PAGINA;
    const produtosDaPagina = todosOsProdutos.slice(inicio, fim);

    produtosDaPagina.forEach(produto => {
        const capa = produto.variantes[0];
        const coresHtml = gerarBolinhasDeCor(produto.variantes);

        const cardHtml = `
            <div class="card-produto">
                <a href="detalhes.html?id=${produto.id}">
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
        `;
        gradeProdutos.innerHTML += cardHtml;
    });

    atualizarBotoesPaginacao();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function atualizarBotoesPaginacao() {
    containerPaginacao.innerHTML = '';
    const totalPaginas = Math.ceil(todosOsProdutos.length / PRODUTOS_POR_PAGINA);

    if (totalPaginas <= 1) return;

    const btnPrev = document.createElement('button');
    btnPrev.innerText = '« Anterior';
    btnPrev.className = 'btn-paginacao';
    btnPrev.disabled = paginaAtual === 1;
    btnPrev.onclick = () => renderizarPagina(paginaAtual - 1);
    containerPaginacao.appendChild(btnPrev);

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = `btn-paginacao ${i === paginaAtual ? 'ativo' : ''}`;
        btn.onclick = () => renderizarPagina(i);
        containerPaginacao.appendChild(btn);
    }

    const btnNext = document.createElement('button');
    btnNext.innerText = 'Próximo »';
    btnNext.className = 'btn-paginacao';
    btnNext.disabled = paginaAtual === totalPaginas;
    btnNext.onclick = () => renderizarPagina(paginaAtual + 1);
    containerPaginacao.appendChild(btnNext);
}

// --- Funções Auxiliares ---
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

// ============================================================
// 4. MENU E BARRA DE PESQUISA (MANTENHA IGUAL)
// ============================================================

// Barra de Pesquisa
const searchBtn = document.querySelector('.search-btn');
const searchBox = document.querySelector('.search-box');
const searchInput = document.querySelector('.search-input');

if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        searchBox.classList.toggle('active');
        if (searchBox.classList.contains('active')) {
            searchInput.focus();
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target) && !searchBtn.contains(e.target)) {
            searchBox.classList.remove('active');
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            // Agora a busca recarrega a página atual para aplicar os filtros
            if (window.location.pathname.includes('produtos.html')) {
                carregarTodosProdutos(); // Chama a função direta se já estiver na página
            } else {
                window.location.href = `produtos.html?busca=${searchInput.value}`;
            }
        }
    });
}

// Menu Mobile
function toggleMenu() {
    menu.classList.toggle('menu-aberto');
    conteudo.classList.toggle('menu-aberto');
    botaoMenu.classList.toggle('menu-aberto');
    overlay.classList.toggle('menu-aberto');
}
if(botaoMenu) botaoMenu.addEventListener('click', toggleMenu);
if(overlay) overlay.addEventListener('click', toggleMenu);