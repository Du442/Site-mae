package backend.backend.repository;

import backend.backend.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    // O Spring cria a query automaticamente baseado no nome do método
    Cliente findByEmail(String email);

    Cliente findByTelefone(String telefone);
}