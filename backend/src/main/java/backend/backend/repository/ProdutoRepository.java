package backend.backend.repository;

import backend.backend.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Integer> {

    // Mantém os métodos que já existem...
    List<Produto> findByNomeContainingIgnoreCase(String nome);

    // --- NOVO MÉTODO DE FILTRAGEM INTELIGENTE ---
    @Query("SELECT p FROM Produto p WHERE " +
       "(:termo IS NULL OR LOWER(p.nome) LIKE LOWER(CONCAT('%', :termo, '%'))) AND " +
       "(:categorias IS NULL OR p.tipo IN :categorias)")
    List<Produto> buscarComFiltros(
        @Param("termo") String termo, 
        @Param("categorias") List<String> categorias
);
}