const API_BASE_URL = 'http://localhost:8080/api/produtos';

// 1. Pega o ID que está na URL
const params = new URLSearchParams(window.location.search);
const idProduto = params.get('id');

// Elementos da tela
const imgPrincipal = document.getElementById('img-principal');
const nomeProduto = document.getElementById('produto-nome');
const categoriaProduto = document.getElementById('produto-categoria');
const precoProduto = document.getElementById('produto-preco');
const descProduto = document.getElementById('produto-descricao');

// Inicializa
if (idProduto) {
    carregarDetalhesProduto(idProduto);
} else {
    alert("Produto não encontrado!");
    window.location.href = "produtos.html";
}

async function carregarDetalhesProduto(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar produto");
        
        const produto = await response.json();

        // Preenche os dados básicos
        nomeProduto.innerText = produto.nome;
        categoriaProduto.innerText = produto.categoria || 'Fitness';
        descProduto.innerText = produto.descricao;

        // Preenche a Média de Estrelas (Chama a função nova)
        exibirEstrelasMedia(produto.mediaAvaliacoes || 0);

        // Lógica para Variantes (Preço e Imagem)
        if (produto.variantes && produto.variantes.length > 0) {
            const principal = produto.variantes[0];
            imgPrincipal.src = principal.urlImagem;
            precoProduto.innerText = principal.preco.toFixed(2).replace('.', ',');
        } else {
            imgPrincipal.src = 'img/placeholder.jpg'; 
            precoProduto.innerText = "0,00";
        }

    } catch (error) {
        console.error(error);
        nomeProduto.innerText = "Erro ao carregar produto.";
    }
}

// --- NOVA FUNÇÃO: EXIBIR A MÉDIA GERAL ---
function exibirEstrelasMedia(media) {
    const container = document.getElementById('media-estrelas-display');
    
    // Só executa se você tiver criado a DIV no HTML
    if (container) {
        container.innerHTML = ''; 
        const notaArredondada = Math.round(media);

        for (let i = 1; i <= 5; i++) {
            if (i <= notaArredondada) {
                container.innerHTML += '<span style="color: #FFD700;">★</span>';
            } else {
                container.innerHTML += '<span style="color: #ccc;">★</span>';
            }
        }
        // Mostra o número decimal ao lado (ex: 4.5)
        container.innerHTML += ` <span style="font-size: 0.8rem; color: #555; margin-left:5px;">(${media.toFixed(1)})</span>`;
    }
}

// --- SISTEMA DE AVALIAÇÃO (Interação Completa) ---
let notaSelecionada = 0; // Guarda a nota fixa (clicada)
const containerEstrelas = document.querySelector('.estrelas-input');
const estrelas = document.querySelectorAll('.estrelas-input span');

// 1. Configura os eventos para cada estrela
estrelas.forEach(estrela => {
    
    // QUANDO PASSA O MOUSE (Efeito visual)
    estrela.addEventListener('mouseover', (e) => {
        const valorHover = parseInt(e.target.getAttribute('data-value'));
        pintarEstrelas(valorHover); // Pinta até onde o mouse está
    });

    // QUANDO CLICA (Confirma a nota)
    estrela.addEventListener('click', (e) => {
        notaSelecionada = parseInt(e.target.getAttribute('data-value'));
        pintarEstrelas(notaSelecionada); 
    });
});

// 2. QUANDO O MOUSE SAI DA ÁREA (Restaura)
// Se o mouse sair de cima das estrelas, volta a pintar só o que estava clicado (notaSelecionada)
if (containerEstrelas) {
    containerEstrelas.addEventListener('mouseleave', () => {
        pintarEstrelas(notaSelecionada);
    });
}

// 3. FUNÇÃO QUE PINTA AS ESTRELAS NA TELA
function pintarEstrelas(nota) {
    estrelas.forEach(estrela => {
        const valorEstrela = parseInt(estrela.getAttribute('data-value'));
        
        if (valorEstrela <= nota) {
            estrela.style.color = "#FFD700"; // Dourado (Acesa)
            estrela.style.transform = "scale(1.1)"; // Leve aumento para dar destaque
            estrela.style.transition = "transform 0.2s"; 
        } else {
            estrela.style.color = "#ccc"; // Cinza (Apagada)
            estrela.style.transform = "scale(1)"; // Tamanho normal
        }
    });
}

// Atualiza as estrelas ONDE O USUÁRIO CLICA (Input)
function atualizarEstrelasInput(nota) {
    estrelas.forEach(estrela => {
        const valorEstrela = parseInt(estrela.getAttribute('data-value'));
        if (valorEstrela <= nota) {
            estrela.style.color = "#FFD700"; 
        } else {
            estrela.style.color = "#ccc"; 
        }
    });
}

// --- FUNÇÃO ATUALIZADA: ENVIAR PARA O BANCO DE DADOS ---
async function enviarAvaliacao() {
    const texto = document.getElementById('texto-avaliacao').value;
    
    if (notaSelecionada === 0) {
        alert("Por favor, selecione uma nota (estrelas).");
        return;
    }

    // Monta o objeto para enviar ao Java
    const novaAvaliacao = {
        nota: notaSelecionada,
        comentario: texto
    };

    try {
        // Faz a requisição POST para o Endpoint que criamos no Java
        const response = await fetch(`http://localhost:8080/api/avaliacoes/${idProduto}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novaAvaliacao)
        });

        if (response.ok) {
            alert("Avaliação enviada com sucesso!");
            // Recarrega a página para atualizar a média e mostrar a nova nota
            window.location.reload(); 
        } else {
            alert("Erro ao enviar avaliação. Tente novamente.");
        }

    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro de conexão com o servidor.");
    }
}