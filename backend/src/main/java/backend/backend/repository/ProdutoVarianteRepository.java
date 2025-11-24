package backend.backend.repository; // (Verifique o pacote)

import backend.backend.model.ProdutoVariante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoVarianteRepository extends JpaRepository<ProdutoVariante, Integer> {
    // Nenhuma linha a mais é necessária
}