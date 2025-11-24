const API_URL = 'http://localhost:8080/api/produtos';

// --- Elementos do DOM ---
const formProduto = document.getElementById('form-produto');
const painelVariantes = document.getElementById('painel-variantes');
const statusUpload = document.getElementById('status-upload');

// ★ AQUI ESTÁ A MUDANÇA PRINCIPAL: Usamos a Tabela, não a Lista ★
const tbodyProdutos = document.getElementById('tbody-produtos');
const inputPesquisa = document.getElementById('input-pesquisa');
const filtroTipo = document.getElementById('filtro-tipo');

const inputId = document.getElementById('produto-id'); // (Adicionado caso faltasse)
const btnCancelar = document.getElementById('btn-novo'); // Botão de limpar/novo

// --- Variáveis de Estado ---
let produtoAtualId = null; 
let listaCompletaProdutos = [];

// ===========================================================
// 1. CARREGAR DADOS (Busca do Backend)
// ===========================================================
async function carregarProdutos() {
    try {
        // Mostra "Carregando" na tabela
        if(tbodyProdutos) tbodyProdutos.innerHTML = '<tr><td colspan="7" style="text-align:center;">Carregando...</td></tr>';
        
        const res = await fetch(API_URL);
        listaCompletaProdutos = await res.json(); // Salva na memória
        
        renderizarTabela(listaCompletaProdutos); // Desenha a tabela
    
    } catch (e) { 
        console.error(e);
        if(tbodyProdutos) tbodyProdutos.innerHTML = '<tr><td colspan="7" style="color:red; text-align:center;">Erro ao conectar com o servidor.</td></tr>';
    }
}

// ===========================================================
// 2. RENDERIZAR TABELA (Desenha o HTML das linhas <tr>)
// ===========================================================
function renderizarTabela(listaDeProdutos) {
    if (!tbodyProdutos) return; // Segurança caso o HTML esteja diferente
    tbodyProdutos.innerHTML = ''; // Limpa a tabela
    
    if (listaDeProdutos.length === 0) {
        tbodyProdutos.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nenhum produto encontrado.</td></tr>';
        return;
    }

    listaDeProdutos.forEach(p => {
        // Calcula o estoque total
        const totalEstoque = p.variantes ? p.variantes.reduce((acc, v) => acc + v.quantidade, 0) : 0;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${p.nome}</strong></td>
            <td>${p.tipo || '-'}</td>
            <td>${p.categoria === 'destaque' ? '⭐ Destaque' : '📂 Coleção'}</td>
            
            <td>${p.tamanhos || '-'}</td>
            
            <td>${gerarHtmlCores(p.cores)}</td>
            
            <td style="color: green; font-weight: bold;">${totalEstoque} un.</td>
            
            <td class="acoes">
                <button class="btn-editar" style="background:#007bff; color:white; border:none; padding:5px; cursor:pointer; border-radius:4px;" onclick="editarProduto(${p.id})">Gerenciar</button>
                <button class="btn-remover" style="background:#dc3545; color:white; border:none; padding:5px; cursor:pointer; border-radius:4px;" onclick="removerProduto(${p.id})">Excluir</button>
            </td>
        `;
        tbodyProdutos.appendChild(tr);
    });
}

// ===========================================================
// 3. FUNÇÕES AUXILIARES (Cores, Filtros)
// ===========================================================
function gerarHtmlCores(coresString) {
    if (!coresString) return '-';
    const cores = coresString.split(','); 
    let html = '<div style="display:flex; gap:4px; justify-content:center;">';
    cores.forEach(cor => {
        const corLimpa = cor.trim();
        if(corLimpa) {
             html += `<span style="display:inline-block; width:15px; height:15px; border:1px solid #ccc; border-radius:3px; background-color: ${corLimpa};" title="${corLimpa}"></span>`;
        }
    });
    html += '</div>';
    return html;
}

function filtrarProdutos() {
    const texto = inputPesquisa.value.toLowerCase();
    const tipo = filtroTipo.value;

    const filtrados = listaCompletaProdutos.filter(p => {
        const nomeBate = p.nome.toLowerCase().includes(texto);
        const tipoBate = (tipo === 'todos') || (p.tipo === tipo);
        return nomeBate && tipoBate;
    });
    renderizarTabela(filtrados);
}

// Eventos de Filtro
if(inputPesquisa) inputPesquisa.addEventListener('keyup', filtrarProdutos);
if(filtroTipo) filtroTipo.addEventListener('change', filtrarProdutos);


// ===========================================================
// 4. SALVAR DADOS GERAIS (CRIAR O PAI)
// ===========================================================
formProduto.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const produto = {
        nome: document.getElementById('nome-produto').value,
        tipo: document.getElementById('tipo-produto').value,
        categoria: document.getElementById('categoria-produto').value,
        descricao: document.getElementById('descricao-produto').value
    };

    const id = document.getElementById('produto-id').value;
    let url = API_URL;
    let method = 'POST';

    if (id) { url = `${API_URL}/${id}`; method = 'PUT'; }

    try {
        const res = await fetch(url, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(produto)
        });
        
        if (!res.ok) throw new Error('Erro ao salvar');

        const produtoSalvo = await res.json();
        
        alert('Dados gerais salvos! Agora adicione o estoque.');
        editarProduto(produtoSalvo.id); 
        carregarProdutos(); 

    } catch (error) { 
        console.error(error);
        alert('Erro ao salvar produto.'); 
    }
});


// ===========================================================
// 5. MODO DE EDIÇÃO E VARIANTES
// ===========================================================
async function editarProduto(id) {
    produtoAtualId = id; 
    
    try {
        const res = await fetch(`${API_URL}/${id}`);
        const produto = await res.json();

        // Preenche formulário principal
        document.getElementById('produto-id').value = produto.id;
        document.getElementById('nome-produto').value = produto.nome;
        document.getElementById('tipo-produto').value = produto.tipo;
        document.getElementById('categoria-produto').value = produto.categoria;
        document.getElementById('descricao-produto').value = produto.descricao;

        // Abre painel de variantes
        painelVariantes.style.display = 'block';
        document.getElementById('nome-produto-selecionado').innerText = produto.nome;

        renderizarVariantes(produto.variantes);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (e) { console.error(e); }
}

function renderizarVariantes(variantes) {
    const tbodyVariantes = document.getElementById('tbody-variantes');
    tbodyVariantes.innerHTML = '';
    if(!variantes) return;

    variantes.forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${v.urlImagem || ''}" style="width:30px; height:30px; object-fit:cover; border-radius:4px;"></td>
            <td><span style="display:inline-block; width:15px; height:15px; border:1px solid #ccc; background:${v.corHex}; vertical-align:middle;"></span> ${v.cor}</td>
            <td>${v.tamanho}</td>
            <td>${v.quantidade}</td>
            <td>R$ ${v.preco.toFixed(2)}</td>
            <td><button onclick="removerVariante(${v.id})" style="background:#dc3545; color:white; border:none; padding:5px; cursor:pointer; border-radius:4px;">X</button></td>
        `;
        tbodyVariantes.appendChild(tr);
    });
}

// ===========================================================
// 6. ADICIONAR VARIANTES (EM LOTE)
// ===========================================================
document.getElementById('form-variante').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!produtoAtualId) return alert("Salve o produto primeiro!");

    const cor = document.getElementById('var-cor').value;
    const corHex = document.getElementById('var-cor-hex').value;
    const preco = parseFloat(document.getElementById('var-preco').value);
    const urlImagem = document.getElementById('var-url-imagem').value;
    const inputsTamanho = document.querySelectorAll('.input-qtd-tamanho');
    
    const requisicoes = [];

    inputsTamanho.forEach(input => {
        const qtd = parseInt(input.value);
        const tamanho = input.dataset.tamanho; 

        if (qtd > 0) {
            const variante = {
                cor: cor, corHex: corHex, preco: preco, urlImagem: urlImagem,
                tamanho: tamanho, quantidade: qtd
            };
            const req = fetch(`${API_URL}/${produtoAtualId}/variantes`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(variante)
            });
            requisicoes.push(req);
        }
    });

    if (requisicoes.length === 0) return alert("Insira a quantidade.");

    try {
        await Promise.all(requisicoes);
        editarProduto(produtoAtualId);
        carregarProdutos(); 
        inputsTamanho.forEach(input => input.value = '');
        alert("Estoque adicionado!");
    } catch (error) { console.error(error); alert('Erro ao adicionar.'); }
});

// ===========================================================
// 7. UPLOAD E REMOÇÃO
// ===========================================================
const inputArquivo = document.getElementById('input-arquivo-imagem'); // Pega o input file
if(inputArquivo){
    inputArquivo.addEventListener('change', async (e) => {
        const arquivo = e.target.files[0];
        if (!arquivo) return;
        const formData = new FormData();
        formData.append('imagens', arquivo);

        if(statusUpload) statusUpload.innerText = "Enviando...";
        try {
            const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
            const urls = await res.json();
            document.getElementById('var-url-imagem').value = urls[0];
            if(statusUpload) statusUpload.innerText = "Imagem OK!";
        } catch (err) { 
            console.error(err);
            if(statusUpload) statusUpload.innerText = "Erro"; 
        }
    });
}

async function removerProduto(id) {
    if(confirm("Apagar produto?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        limparFormulario();
        carregarProdutos();
    }
}

async function removerVariante(idVariante) {
    if(confirm("Remover do estoque?")) {
        await fetch(`${API_URL}/variantes/${idVariante}`, { method: 'DELETE' });
        editarProduto(produtoAtualId); 
        carregarProdutos(); 
    }
}

function limparFormulario() {
    formProduto.reset();
    document.getElementById('produto-id').value = '';
    painelVariantes.style.display = 'none';
    produtoAtualId = null;
}

// Inicia
carregarProdutos();