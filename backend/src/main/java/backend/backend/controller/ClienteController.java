package backend.backend.controller;

import backend.backend.model.Cliente;
import backend.backend.repository.ClienteRepository;
import backend.backend.service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*") // Permite que o site converse com o Java
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;
    private EmailService emailService;

    // Cadastrar Cliente
    @PostMapping("/cadastrar")
    public ResponseEntity<?> cadastrarCliente(@RequestBody Cliente cliente) {
        
        // 1. Verifica E-mail
        if (clienteRepository.findByEmail(cliente.getEmail()) != null) {
            return ResponseEntity.status(409).body("Este e-mail já está cadastrado.");
        }

        // 2. ★ VERIFICA TELEFONE (NOVO) ★
        if (clienteRepository.findByTelefone(cliente.getTelefone()) != null) {
            // Retorna erro 409 (Conflito) se o telefone já existir
            return ResponseEntity.status(409).body("Este telefone já está cadastrado.");
        }

        // 3. Se não existe, salva
        Cliente novoCliente = clienteRepository.save(cliente);

        try {
            String assunto = "Bem-vindo à Vipstyle Fitness!";
            String mensagem = "Olá " + cliente.getNome() + ",\n\n" +
                              "Seu cadastro foi realizado com sucesso!\n" +
                              "Aproveite nossas ofertas exclusivas.\n\n" +
                              "Att,\nEquipe Vipstyle.";

            emailService.enviarEmailTexto(cliente.getEmail(), assunto, mensagem);
        
        } catch (Exception e) {
            System.out.println("Erro ao enviar e-mail: " + e.getMessage());
            // Não paramos o cadastro por erro de e-mail, apenas logamos
        }

        return ResponseEntity.ok(novoCliente);
    }

    // Listar Clientes (Apenas para teste, cuidado com dados sensíveis)
    @GetMapping
    public List<Cliente> listarClientes() {
        return clienteRepository.findAll();
    }
}