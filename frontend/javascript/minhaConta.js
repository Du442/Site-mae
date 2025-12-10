const API_ATUALIZAR = 'http://localhost:8080/api/clientes/atualizar';
let usuarioAtual = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Carrega dados
    const usuarioLogadoJSON = localStorage.getItem('usuarioLogado');

    if (!usuarioLogadoJSON) {
        alert("Você precisa estar logado.");
        window.location.href = 'telaCadastro.html';
        return;
    }

    usuarioAtual = JSON.parse(usuarioLogadoJSON);
    atualizarTela(usuarioAtual);

    // ============================================================
    // ★ NOVO: CONFIGURA O "ENTER" PARA SALVAR ★
    // ============================================================
    
    // Seleciona todos os inputs que possuem um ícone de edição ao lado
    const inputsEditaveis = document.querySelectorAll('.input-icon-container input');

    inputsEditaveis.forEach(input => {
        input.addEventListener('keydown', (event) => {
            // Verifica se a tecla apertada foi o ENTER (Código 'Enter')
            if (event.key === 'Enter') {
                event.preventDefault(); // Impede comportamentos estranhos do form

                // Só salva se o campo estiver destravado (readOnly = false)
                if (!input.readOnly) {
                    // Encontra o ícone que está no mesmo container do input
                    const icone = input.parentElement.querySelector('.action-icon');
                    
                    // Chama a função de salvar, passando o ID do input e o ícone
                    toggleEdicao(input.id, icone);
                    
                    // Remove o foco do input (efeito visual de "acabou")
                    input.blur();
                }
            }
        });
    });
});

// --- RESTO DO CÓDIGO (Igual ao anterior) ---

function atualizarTela(cliente) {
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(cliente.nome)}&background=random&color=fff&bold=true&size=128`;
    document.getElementById('img-avatar-grande').src = avatarUrl;
    document.getElementById('texto-nome-grande').innerText = cliente.nome;
    document.getElementById('texto-email-grande').innerText = cliente.email;

    document.getElementById('perfil-nome').value = cliente.nome;
    document.getElementById('perfil-email').value = cliente.email;
    document.getElementById('perfil-telefone').value = cliente.telefone || "";
    document.getElementById('perfil-endereco').value = cliente.endereco || "";
}

async function toggleEdicao(idInput, icone) {
    const input = document.getElementById(idInput);
    
    // MODO EDITAR (Destrava)
    if (input.readOnly) {
        input.readOnly = false;
        input.focus(); // Joga o cursor lá dentro automaticamente
        input.classList.add('editando');
        
        icone.classList.remove('fa-pen');
        icone.classList.add('fa-check', 'fa-beat');
        icone.style.color = "#28a745";
    
    } 
    // MODO SALVAR (Envia pro Java)
    else {
        input.readOnly = true;
        input.classList.remove('editando');
        
        icone.classList.remove('fa-check', 'fa-beat');
        icone.classList.add('fa-spinner', 'fa-spin');
        
        try {
            if(idInput === 'perfil-nome') usuarioAtual.nome = input.value;
            if(idInput === 'perfil-telefone') usuarioAtual.telefone = input.value;
            if(idInput === 'perfil-endereco') usuarioAtual.endereco = input.value;

            const response = await fetch(API_ATUALIZAR, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuarioAtual)
            });

            if (response.ok) {
                const clienteAtualizado = await response.json();
                localStorage.setItem('usuarioLogado', JSON.stringify(clienteAtualizado));
                atualizarTela(clienteAtualizado); 
                
                icone.classList.remove('fa-spinner', 'fa-spin');
                icone.classList.add('fa-pen');
                icone.style.color = "#d033d1"; 

            } else {
                alert("Erro ao atualizar dados.");
                window.location.reload();
            }

        } catch (error) {
            console.error(error);
            alert("Erro de conexão.");
            window.location.reload();
        }
    }
}

function fazerLogout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'paginaPrincipal.html';
}