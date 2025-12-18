window.onload = function() {
    // 1. Pega o parâmetro da URL (ex: ?colecao=verao)
    const params = new URLSearchParams(window.location.search);
    const colecaoDesejada = params.get('colecao'); // retorna 'verao', 'inverno' ou null

    // Se não tiver filtro (clicou em Catálogo geral), para por aqui e mostra tudo.
    if (!colecaoDesejada) return; 

    // 2. Seleciona todos os produtos
    const todosProdutos = document.querySelectorAll('.produto');

    // 3. Passa por cada produto e decide se mostra ou esconde
    todosProdutos.forEach(produto => {
        const categoriaDoProduto = produto.getAttribute('data-category');

        if (categoriaDoProduto === colecaoDesejada) {
            produto.style.display = 'block'; // Mostra
        } else {
            produto.style.display = 'none'; // Esconde
        }
    });
};