const API_URL = 'http://localhost:8080/api/clientes/cadastrar';

// --- 1. Elementos do DOM ---
const formCadastro = document.getElementById('form-cadastro-cliente');
const inputNome = document.getElementById('cliente-nome');
const inputEmail = document.getElementById('cliente-email');
const inputTelefone = document.getElementById('cliente-telefone');
const inputEndereco = document.getElementById('cliente-endereco');
const inputSenha = document.getElementById('cliente-senha');
const inputConfirma = document.getElementById('cliente-senha-confirma');
const msgErroSenha = document.getElementById('msg-erro-senha');

// --- 2. Máscara de Telefone (Formata enquanto digita) ---
if (inputTelefone) {
    inputTelefone.addEventListener('input', (e) => {
        let valor = e.target.value.replace(/\D/g, "");
        valor = valor.substring(0, 11); // Limita tamanho

        // Formata (XX) XXXXX-XXXX
        if (valor.length > 10) {
            valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
        } else if (valor.length > 5) {
            valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        } else if (valor.length > 2) {
            valor = valor.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
        } else {
            valor = valor.replace(/^(\d*)/, "($1");
        }
        e.target.value = valor;
    });
}

// --- 3. Funções Auxiliares de Validação ---

function validarEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
}

// ★ NOVA FUNÇÃO: Valida Força da Senha ★
function validarSenhaForte(senha) {
    // Regra 1: Mínimo de 8 caracteres
    if (senha.length < 8) {
        alert("A senha deve ter no mínimo 8 caracteres.");
        return false;
    }
    
    // Regra 2: Pelo menos 1 letra maiúscula (Regex: procura de A a Z)
    if (!/[A-Z]/.test(senha)) {
        alert("A senha deve conter pelo menos uma letra maiúscula.");
        return false;
    }

    // (Opcional) Se quiser exigir número também, descomente abaixo:
    /*
    if (!/[0-9]/.test(senha)) {
        alert("A senha deve conter pelo menos um número.");
        return false;
    }
    */

    return true;
}

// --- 4. EVENTO DE ENVIO (Onde tudo acontece) ---
if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede recarregar a página

        // --- A. Validação de Senha (Iguais) ---
        if (inputSenha.value !== inputConfirma.value) {
            alert("As senhas não coincidem!");
            if(msgErroSenha) msgErroSenha.style.display = 'block';
            inputConfirma.focus();
            return; // PARA TUDO
        }
        if(msgErroSenha) msgErroSenha.style.display = 'none';

        // --- ★ B. Validação de Senha (Força) - NOVO ★ ---
        if (!validarSenhaForte(inputSenha.value)) {
            inputSenha.focus();
            return; // PARA TUDO SE A SENHA FOR FRACA
        }

        // --- C. Validação de Telefone ---
        const telLimpo = inputTelefone.value.replace(/\D/g, "");
        if (telLimpo.length < 10) {
            alert("Telefone inválido. Digite o DDD + Número.");
            inputTelefone.focus();
            return; 
        }

        // --- D. Validação de Email (Regex) ---
        if (!validarEmail(inputEmail.value)) {
            alert("Formato de e-mail inválido.");
            inputEmail.focus();
            return; 
        }

        // --- E. Validação Hunter.io (API Externa) ---
        const HUNTER_API_KEY = 'bd3feea0639878b7ae3641a23c289db710b35b67'; 
        const urlHunter = `https://api.hunter.io/v2/email-verifier?email=${inputEmail.value}&api_key=${HUNTER_API_KEY}`;
        
        const btnSubmit = formCadastro.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit.innerText;

        try {
            btnSubmit.innerText = "Verificando...";
            btnSubmit.disabled = true;

            const responseHunter = await fetch(urlHunter);
            const dataHunter = await responseHunter.json();

            if (dataHunter.data && dataHunter.data.result === 'undeliverable') {
                alert("Este e-mail parece não existir. Verifique a digitação.");
                btnSubmit.innerText = textoOriginal;
                btnSubmit.disabled = false;
                return; 
            }

        } catch (error) {
            console.warn("Hunter.io falhou ou sem internet. Pulando verificação...");
        }

        // --- F. Envio para o Backend Java ---
        btnSubmit.innerText = "Cadastrando...";

        const cliente = {
            nome: inputNome.value,
            email: inputEmail.value,
            telefone: inputTelefone.value,
            endereco: inputEndereco.value,
            senha: inputSenha.value 
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cliente)
            });

            if (response.ok) {
                alert('Cadastro realizado com sucesso! Bem-vindo(a).');
                window.location.href = 'paginaPrincipal.html';
                
            } else if (response.status === 409) {
                // ★ CORREÇÃO AQUI ★
                // Lê a mensagem de texto que o Java enviou
                const mensagemErro = await response.text(); 
                
                // Mostra a mensagem exata (Se foi email ou telefone)
                alert("Erro: " + mensagemErro);

                // Tenta descobrir qual campo ficar vermelho
                if (mensagemErro.toLowerCase().includes("telefone")) {
                    document.getElementById('cliente-telefone').style.borderColor = "red";
                } else {
                    document.getElementById('cliente-email').style.borderColor = "red";
                }

            } else {
                alert('Erro ao cadastrar. Tente novamente.');
            }

        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão com o servidor.');
        } finally {
            btnSubmit.innerText = textoOriginal;
            btnSubmit.disabled = false;
        }
    });
} else {
    console.error("ERRO CRÍTICO: Formulário 'form-cadastro-cliente' não encontrado no HTML.");
}