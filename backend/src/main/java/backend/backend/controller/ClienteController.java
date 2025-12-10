package backend.backend.controller;

import backend.backend.model.Cliente;
import backend.backend.repository.ClienteRepository;
import backend.backend.service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private EmailService emailService;

    // ========================================================
    // 1. CADASTRO DE CLIENTE
    // ========================================================
    @PostMapping("/cadastrar")
    public ResponseEntity<?> cadastrarCliente(@RequestBody Cliente cliente) {
        
        // --- A. VALIDAÇÕES DE E-MAIL (NOVO) ---
        
        // 1. Valida se o domínio existe de verdade (MX Record)
        if (!emailService.isDomainValid(cliente.getEmail())) {
             return ResponseEntity.status(400).body("O domínio do e-mail é inválido ou não existe.");
        }

        // 2. Valida se é um provedor permitido (Whitelist/Blacklist)
        if (!emailService.isEmailPermitido(cliente.getEmail())) {
            return ResponseEntity.status(400).body("Este provedor de e-mail não é aceito.");
        }

        // --- B. VALIDAÇÕES DE DUPLICIDADE (BANCO) ---

        // 3. Verifica E-mail duplicado no banco
        if (clienteRepository.findByEmail(cliente.getEmail()) != null) {
            return ResponseEntity.status(409).body("Este e-mail já está cadastrado.");
        }

        // 4. Verifica Telefone duplicado no banco
        if (clienteRepository.findByTelefone(cliente.getTelefone()) != null) {
            return ResponseEntity.status(409).body("Este telefone já está cadastrado.");
        }

        // --- C. SALVAR E ENVIAR E-MAIL ---

        // 5. Salva o Cliente no Banco
        Cliente novoCliente = clienteRepository.save(cliente);

        // 6. Tenta enviar o e-mail de boas-vindas
        try {
            String assunto = "Bem-vindo à Vipstyle Fitness!";
            String mensagem = "Olá " + novoCliente.getNome() + ",\n\n" +
                              "Seu cadastro foi realizado com sucesso!\n" +
                              "Aproveite nossas ofertas exclusivas.\n\n" +
                              "Att,\nEquipe Vipstyle.";

            emailService.enviarEmailTexto(novoCliente.getEmail(), assunto, mensagem);
        
        } catch (Exception e) {
            System.out.println("Erro ao enviar e-mail: " + e.getMessage());
            // Segue o fluxo mesmo se o email falhar
        }

        // 7. Limpa a senha para não devolver ao frontend (Segurança)
        novoCliente.setSenha(null);

        return ResponseEntity.ok(novoCliente);
    }


    // ========================================================
    // 2. LOGIN DE CLIENTE
    // ========================================================
    @PostMapping("/login")
    public ResponseEntity<?> loginCliente(@RequestBody Cliente dadosLogin) {
        // 1. Busca o cliente no banco pelo email
        Cliente clienteEncontrado = clienteRepository.findByEmail(dadosLogin.getEmail());

        // 2. Verifica se achou E se a senha bate
        if (clienteEncontrado != null && clienteEncontrado.getSenha().equals(dadosLogin.getSenha())) {
            
            // 3. Limpa a senha antes de enviar de volta (Segurança)
            clienteEncontrado.setSenha(null);
            return ResponseEntity.ok(clienteEncontrado);
            
        } else {
            // 4. Se errou email ou senha
            return ResponseEntity.status(401).body("E-mail ou senha incorretos.");
        }
    }


    // ========================================================
    // 3. LISTAR (APENAS PARA TESTES)
    // ========================================================
    @GetMapping
    public List<Cliente> listarClientes() {
        return clienteRepository.findAll();
    }

    // ========================================================
    // 4. ATUALIZAR DADOS DO CLIENTE
    // ========================================================
    @PutMapping("/atualizar")
    public ResponseEntity<?> atualizarCliente(@RequestBody Cliente novosDados) {
        
        // 1. Busca o cliente original pelo ID (que virá no JSON)
        return clienteRepository.findById(novosDados.getId())
                .map(clienteExistente -> {
                    
                    // 2. Atualiza apenas os campos permitidos
                    clienteExistente.setNome(novosDados.getNome());
                    clienteExistente.setTelefone(novosDados.getTelefone());
                    clienteExistente.setEndereco(novosDados.getEndereco());
                    
                    // (Opcional: Se quiser permitir mudar senha, adicione aqui)

                    // 3. Salva no banco
                    Cliente clienteAtualizado = clienteRepository.save(clienteExistente);
                    
                    // 4. Limpa senha antes de devolver
                    clienteAtualizado.setSenha(null);
                    
                    return ResponseEntity.ok(clienteAtualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/trocar-senha")
    public ResponseEntity<?> trocarSenha(@RequestBody Map<String, String> dados) {
        Integer id = Integer.parseInt(dados.get("id"));
        String senhaAtual = dados.get("senhaAtual");
        String novaSenha = dados.get("novaSenha");

        return clienteRepository.findById(id)
            .map(cliente -> {
                // 1. Verifica se a senha atual bate com a do banco
                if (!cliente.getSenha().equals(senhaAtual)) {
                    return ResponseEntity.status(401).body("A senha atual está incorreta.");
                }

                // 2. Atualiza para a nova senha
                cliente.setSenha(novaSenha);
                clienteRepository.save(cliente);

                return ResponseEntity.ok("Senha alterada com sucesso!");
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // 6. EXCLUIR CONTA (Para a Zona de Perigo)
    @DeleteMapping("/excluir/{id}")
    public ResponseEntity<?> excluirConta(@PathVariable Integer id) {
        if (!clienteRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        clienteRepository.deleteById(id);
        return ResponseEntity.ok("Conta excluída com sucesso.");
    }
}