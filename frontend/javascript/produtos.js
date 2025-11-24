const API_URL = 'http://localhost:8080/api/produtos';

const gradeProdutos = document.getElementById('grade-produtos');

// Elementos do Menu (para funcionar igual ao index)
const botaoMenu = document.getElementById('btn-menu-toggle');
const menu = document.getElementById('menu-vertical');
const conteudo = document.getElementById('conteudo-principal');
const overlay = document.getElementById('menu-overlay');
const headerPrincipal = document.getElementById('cabecalho-principal');
const containerPaginacao = document.getElementById('paginacao-container');

// Configurações da Paginação
const PRODUTOS_POR_PAGINA = 50;
let paginaAtual = 1;
let todosOsProdutos = [];

// --- 1. CARREGAR PRODUTOS ---
async function carregarTodosProdutos() {
    try {
        const response = await fetch(API_URL);
        const produtos = await response.json();

        // Filtra apenas produtos que têm estoque (variantes)
        todosOsProdutos = produtos.filter(p => p.variantes && p.variantes.length > 0);

        if (todosOsProdutos.length === 0) {
            gradeProdutos.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Nenhum produto encontrado.</p>';
            return;
        }

        // Renderiza a primeira página
        renderizarPagina(1);

    } catch (error) {
        console.error(error);
        gradeProdutos.innerHTML = '<p>Erro ao carregar produtos.</p>';
    }
}

function renderizarPagina(pagina) {
    paginaAtual = pagina;
    gradeProdutos.innerHTML = '';

    // Cálculos de corte (Slice) do Array
    const inicio = (pagina - 1) * PRODUTOS_POR_PAGINA;
    const fim = inicio + PRODUTOS_POR_PAGINA;
    
    // Pega apenas os 30 produtos da página atual
    const produtosDaPagina = todosOsProdutos.slice(inicio, fim);

    // Desenha os cards
    produtosDaPagina.forEach(produto => {
        const capa = produto.variantes[0];
        const coresHtml = gerarBolinhasDeCor(produto.variantes);

        const cardHtml = `
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
        `;
        gradeProdutos.innerHTML += cardHtml;
    });

    // Atualiza os botões lá embaixo
    atualizarBotoesPaginacao();
    
    // Rola para o topo suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function atualizarBotoesPaginacao() {
    containerPaginacao.innerHTML = '';

    const totalPaginas = Math.ceil(todosOsProdutos.length / PRODUTOS_POR_PAGINA);

    // Se só tem 1 página, não precisa mostrar botões
    if (totalPaginas <= 1) return;

    // Botão "Anterior"
    const btnPrev = document.createElement('button');
    btnPrev.innerText = '« Anterior';
    btnPrev.className = 'btn-paginacao';
    btnPrev.disabled = paginaAtual === 1;
    btnPrev.onclick = () => renderizarPagina(paginaAtual - 1);
    containerPaginacao.appendChild(btnPrev);

    // Botões Numéricos (1, 2, 3...)
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = `btn-paginacao ${i === paginaAtual ? 'ativo' : ''}`;
        btn.onclick = () => renderizarPagina(i);
        containerPaginacao.appendChild(btn);
    }

    // Botão "Próximo"
    const btnNext = document.createElement('button');
    btnNext.innerText = 'Próximo »';
    btnNext.className = 'btn-paginacao';
    btnNext.disabled = paginaAtual === totalPaginas;
    btnNext.onclick = () => renderizarPagina(paginaAtual + 1);
    containerPaginacao.appendChild(btnNext);
}

// --- Funções Auxiliares (Reutilizadas do main.js) ---
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

// Inicia
carregarTodosProdutos();