package backend.backend.repository;

import backend.backend.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Integer> {
    
    // O Spring Data JPA cria os métodos (findAll, save, deleteById, etc.)
    // automaticamente.
    // Método mágico do Spring Data JPA
    // "Containing" cria automaticamente um SQL com LIKE %nome%
    // "IgnoreCase" faz ignorar maiúsculas/minúsculas
    List<Produto> findByNomeContainingIgnoreCase(String nome);
}
