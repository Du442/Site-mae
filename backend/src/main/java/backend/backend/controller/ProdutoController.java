package backend.backend.controller;

import backend.backend.model.Produto;
import backend.backend.repository.ProdutoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin(origins = "*") // Permite a comunicação com o frontend
public class ProdutoController {

    @Autowired
    private ProdutoRepository produtoRepository;

    // CREATE (Cadastrar)
    @PostMapping
    public Produto criarProduto(@RequestBody Produto produto) {
        return produtoRepository.save(produto);
    }

    // READ (Ler Todos)
    @GetMapping
    public List<Produto> listarProdutos() {
        return produtoRepository.findAll();
    }

    // READ (Ler Um por ID)
    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarProdutoPorId(@PathVariable Integer id) {
        return produtoRepository.findById(id)
                .map(produto -> ResponseEntity.ok().body(produto))
                .orElse(ResponseEntity.notFound().build());
    }

    // UPDATE (Alterar)
    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizarProduto(@PathVariable Integer id, @RequestBody Produto produtoDetalhes) {
        return produtoRepository.findById(id)
                .map(produtoExistente -> {
                    produtoExistente.setNome(produtoDetalhes.getNome());
                    produtoExistente.setPreco(produtoDetalhes.getPreco());
                    produtoExistente.setUrlImagem(produtoDetalhes.getUrlImagem());
                    produtoExistente.setCategoria(produtoDetalhes.getCategoria());
                    
                    Produto produtoAtualizado = produtoRepository.save(produtoExistente);
                    return ResponseEntity.ok().body(produtoAtualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE (Remover)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarProduto(@PathVariable Integer id) {
        return produtoRepository.findById(id)
                .map(produto -> {
                    produtoRepository.delete(produto);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

}