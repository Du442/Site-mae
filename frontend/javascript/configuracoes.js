document.addEventListener('DOMContentLoaded', () => {
    // Verifica login
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        window.location.href = 'telaCadastro.html';
    }
});

// --- 1. LÓGICA DE TROCAR SENHA ---
const formSenha = document.getElementById('form-trocar-senha');

formSenha.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const senhaAtual = document.getElementById('senha-atual').value;
    const senhaNova = document.getElementById('senha-nova').value;
    const senhaConfirma = document.getElementById('senha-confirma').value;
    const btn = formSenha.querySelector('button');

    // Validações básicas
    if (senhaNova.length < 8) {
        alert("A nova senha deve ter no mínimo 8 caracteres.");
        return;
    }
    if (senhaNova !== senhaConfirma) {
        alert("A confirmação da senha não bate.");
        return;
    }

    try {
        btn.innerText = "Atualizando...";
        btn.disabled = true;

        const response = await fetch('http://localhost:8080/api/clientes/trocar-senha', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: usuarioLogado.id.toString(),
                senhaAtual: senhaAtual,
                novaSenha: senhaNova
            })
        });

        if (response.ok) {
            alert("Senha alterada com sucesso! Faça login novamente.");
            fazerLogout(); // Força logout para ele entrar com a nova senha
        } else {
            // Pega a mensagem de erro do Java (ex: "Senha atual incorreta")
            const erro = await response.text();
            alert("Erro: " + erro);
        }

    } catch (error) {
        console.error(error);
        alert("Erro de conexão.");
    } finally {
        btn.innerText = "Atualizar Senha";
        btn.disabled = false;
        formSenha.reset(); // Limpa os campos
    }
});

// --- 2. LÓGICA DE EXCLUIR CONTA ---
async function excluirConta() {
    const confirmacao = confirm("TEM CERTEZA? Essa ação não pode ser desfeita e você perderá seu histórico de compras.");
    
    if (confirmacao) {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        
        try {
            const response = await fetch(`http://localhost:8080/api/clientes/excluir/${usuarioLogado.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("Sua conta foi excluída. Sentiremos sua falta!");
                fazerLogout();
            } else {
                alert("Erro ao excluir conta.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão.");
        }
    }
}