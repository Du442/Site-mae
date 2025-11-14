const API_URL = 'http://localhost:8080/api/produtos';

// Pega os elementos do formulário e da lista
const form = document.getElementById('form-produto');
const lista = document.getElementById('lista-produtos');
const inputId = document.getElementById('produto-id');
const inputNome = document.getElementById('nome-produto');
const inputPreco = document.getElementById('preco-produto');
const inputImagem = document.getElementById('imagem-produto');
const inputCategoria = document.getElementById('categoria-produto');
const btnCancelar = document.getElementById('btn-cancelar');

// =============================================================
// FUNÇÃO 1: MOSTRAR (Carrega os produtos na lista)
// =============================================================
async function carregarProdutos() {
    lista.innerHTML = 'Carregando...';
    
    try {
        const response = await fetch(API_URL); // Chama o GET /api/produtos do seu backend
        const produtos = await response.json();
        
        lista.innerHTML = ''; // Limpa o "Carregando..."
        
        produtos.forEach(produto => {
            const item = document.createElement('div');
            item.className = 'produto-item'; // (Classe para estilizar no admin.css)
            item.innerHTML = `
                <p>
                    <strong>${produto.nome}</strong> (Cat: ${produto.categoria})
                    - R$ ${produto.preco.toFixed(2)}
                </p>
                <div>
                    <button onclick="prepararEdicao(${produto.id})">Alterar</button>
                    <button onclick="removerProduto(${produto.id})">Remover</button>
                </div>
            `;
            lista.appendChild(item);
        });
    } catch (error) {
        lista.innerHTML = 'Erro ao carregar produtos.';
        console.error("Erro no GET:", error);
    }
}

// =============================================================
// FUNÇÃO 2: CADASTRAR / ALTERAR (POST ou PUT)
// =============================================================
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Lógica para capturar os Checkboxes de TAMANHO
    // Pega todos os marcados e junta com vírgula (Ex: "P,M,G")
    const checkTamanhos = document.querySelectorAll('input[name="tamanho"]:checked');
    const listaTamanhos = Array.from(checkTamanhos).map(cb => cb.value).join(',');

    // 2. Lógica para capturar os Checkboxes de COR
    const checkCores = document.querySelectorAll('input[name="cor"]:checked');
    const listaCores = Array.from(checkCores).map(cb => cb.value).join(',');

    // 3. Monta o objeto completo para enviar ao Java
    const produto = {
        nome: document.getElementById('nome-produto').value,
        preco: parseFloat(document.getElementById('preco-produto').value),
        urlImagem: document.getElementById('imagem-produto').value,
        
        // Novos campos
        categoria: document.getElementById('categoria-produto').value,
        descricao: document.getElementById('descricao-produto').value,
        tipo: document.getElementById('tipo-produto').value,
        tamanhos: listaTamanhos, // String "P,M"
        cores: listaCores        // String "Preto,Rosa"
    };

    // 4. Envia para o Backend (igual antes)
    const id = inputId.value;
    let url = API_URL;
    let method = 'POST';

    if (id) {
        url = `${API_URL}/${id}`;
        method = 'PUT';
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto)
        });

        if (!response.ok) throw new Error('Erro ao salvar');

        // Limpa tudo
        form.reset();
        inputId.value = '';
        document.getElementById('btn-cancelar').style.display = 'none';
        carregarProdutos(); // Atualiza a lista na tela

        alert('Produto salvo com sucesso!');

    } catch (error) {
        console.error(error);
        alert('Erro ao salvar.');
    }
});

// =============================================================
// FUNÇÃO 3: REMOVER (DELETE)
// =============================================================
async function removerProduto(id) {
    // Pede confirmação
    if (confirm('Tem certeza que quer remover este produto?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Erro ao remover produto');
            }
            
            carregarProdutos(); // Recarrega a lista
        
        } catch (error) {
            console.error("Erro no DELETE:", error);
            alert('Falha ao remover o produto.');
        }
    }
}

// =============================================================
// FUNÇÃO 4: PREPARAR PARA ALTERAR (Preenche o formulário)
// =============================================================
async function prepararEdicao(id) {
    try {
        // Busca o produto específico na API (GET /api/produtos/{id})
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar produto para edição');
        }
        const produto = await response.json();
        
        // Preenche o formulário com os dados do produto
        inputId.value = produto.id;
        inputNome.value = produto.nome;
        inputPreco.value = produto.preco;
        inputImagem.value = produto.urlImagem;
        inputCategoria.value = produto.categoria;

        btnCancelar.style.display = 'inline-block'; // Mostra o botão "Cancelar"
        window.scrollTo(0, 0); // Rola a página para o topo (para ver o formulário)
    
    } catch (error) {
        console.error("Erro no GET (ID):", error);
        alert('Falha ao carregar produto para edição.');
    }
}

// Função para limpar o formulário
function limparFormulario() {
    form.reset();
    inputId.value = '';
    btnCancelar.style.display = 'none';
}

// Evento do botão "Cancelar Edição"
btnCancelar.addEventListener('click', limparFormulario);


// --- Carrega a lista de produtos assim que a página abre ---
carregarProdutos();

