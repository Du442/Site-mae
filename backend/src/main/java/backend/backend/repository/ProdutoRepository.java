package backend.backend.repository;

import backend.backend.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Integer> {
    
    // O Spring Data JPA cria os métodos (findAll, save, deleteById, etc.)
    // automaticamente.
}
