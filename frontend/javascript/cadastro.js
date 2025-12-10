/* =============================================
   CONFIGURAÇÕES GERAIS
   ============================================= */
const API_URL = 'http://localhost:8080/api/clientes/cadastrar';
const API_LOGIN_URL = 'http://localhost:8080/api/clientes/login';

// --- Elementos do DOM (Cadastro) ---
const formCadastro = document.getElementById('form-cadastro-cliente');
const inputNome = document.getElementById('cliente-nome');
const inputEmail = document.getElementById('cliente-email');
const inputTelefone = document.getElementById('cliente-telefone');
const inputEndereco = document.getElementById('cliente-endereco');
const inputSenha = document.getElementById('cliente-senha');
const inputConfirma = document.getElementById('cliente-senha-confirma');
const msgErroSenha = document.getElementById('msg-erro-senha');

// --- Elementos do DOM (Login) ---
const formLogin = document.getElementById('form-login-cliente');
const boxCadastro = document.getElementById('box-cadastro');
const boxLogin = document.getElementById('box-login');
const linkIrLogin = document.getElementById('link-ir-para-login');
const linkIrCadastro = document.getElementById('link-ir-para-cadastro');
const tituloPagina = document.getElementById('titulo-pagina');


/* =============================================
   FUNÇÕES AUXILIARES (VALIDAÇÃO E MÁSCARA)
   ============================================= */

// 1. Máscara de Telefone
if (inputTelefone) {
    inputTelefone.addEventListener('input', (e) => {
        let valor = e.target.value.replace(/\D/g, "").substring(0, 11);
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

// 2. Validação de Email (Regex)
function validarEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
}

// 3. Validação de Typos
function verificarTyposEmail(email) {
    const dominiosErrados = ["gmial.com", "hotmial.com", "outlok.com", "yahooo.com"];
    const partes = email.split('@');
    if (partes.length === 2) {
        const dominioDigitado = partes[1].toLowerCase();
        if (dominiosErrados.some(d => dominioDigitado.includes(d))) return true;
    }
    return false;
}


/* =============================================
   LÓGICA DE ALTERNÂNCIA (LOGIN <-> CADASTRO)
   ============================================= */
if (linkIrLogin) {
    linkIrLogin.addEventListener('click', (e) => {
        e.preventDefault();
        boxCadastro.style.display = 'none';
        boxLogin.style.display = 'block';
        if(tituloPagina) tituloPagina.innerText = "Bem-vindo de volta!";
    });
}

if (linkIrCadastro) {
    linkIrCadastro.addEventListener('click', (e) => {
        e.preventDefault();
        boxLogin.style.display = 'none';
        boxCadastro.style.display = 'block';
        if(tituloPagina) tituloPagina.innerText = "Crie sua conta";
    });
}


/* =============================================
   LÓGICA DE ENVIO DO CADASTRO (SEU CÓDIGO ANTIGO)
   ============================================= */
if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        // A. Validação de Senha
        if (inputSenha.value !== inputConfirma.value) {
            alert("As senhas não coincidem!");
            if(msgErroSenha) msgErroSenha.style.display = 'block';
            inputConfirma.focus();
            return; 
        }
        if(msgErroSenha) msgErroSenha.style.display = 'none';

        // B. Validação de Telefone
        const telLimpo = inputTelefone.value.replace(/\D/g, "");
        if (telLimpo.length < 10) {
            alert("Telefone inválido. Digite o DDD + Número.");
            inputTelefone.focus();
            return; 
        }

        // C. Validação de Email (Regex e Typos)
        if (!validarEmail(inputEmail.value)) {
            alert("Formato de e-mail inválido.");
            inputEmail.focus();
            return; 
        }
        if (verificarTyposEmail(inputEmail.value)) {
            alert("Parece que você digitou o e-mail errado (ex: 'gmial'). Verifique.");
            inputEmail.focus();
            return; 
        }

        // D. Envio para o Backend
        const btnSubmit = formCadastro.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit.innerText;
        btnSubmit.innerText = "Cadastrando...";
        btnSubmit.disabled = true;

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
                const clienteSalvo = await response.json();
                
                // Salva login e redireciona
                localStorage.setItem('usuarioLogado', JSON.stringify(clienteSalvo));
                alert(`Cadastro realizado! Bem-vindo(a), ${clienteSalvo.nome}!`);
                window.location.href = 'paginaPrincipal.html'; // ou paginaPrincipal.html
            
            } else if (response.status === 409) {
                alert('Erro: Este e-mail ou telefone já possui cadastro.');
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
}


/* =============================================
   ★ LÓGICA DE LOGIN (NOVA PARTE) ★
   ============================================= */
if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailLogin = document.getElementById('login-email').value;
        const senhaLogin = document.getElementById('login-senha').value;
        const btnEntrar = formLogin.querySelector('button');
        const textoOriginal = btnEntrar.innerText;

        try {
            btnEntrar.innerText = "Entrando...";
            btnEntrar.disabled = true;

            const response = await fetch(API_LOGIN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: emailLogin, 
                    senha: senhaLogin 
                })
            });

            if (response.ok) {
                // SUCESSO!
                const cliente = await response.json();

                // Salva a sessão
                localStorage.setItem('usuarioLogado', JSON.stringify(cliente));

                alert(`Bem-vindo de volta, ${cliente.nome}!`);
                window.location.href = 'paginaPrincipal.html';

            } else {
                alert("E-mail ou senha incorretos.");
            }

        } catch (error) {
            console.error("Erro no login:", error);
            alert("Erro de conexão com o servidor.");
        } finally {
            btnEntrar.innerText = textoOriginal;
            btnEntrar.disabled = false;
        }
    });
}