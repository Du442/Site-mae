package backend.backend.controller;

import backend.backend.model.Produto;
import backend.backend.model.ProdutoVariante;
import backend.backend.repository.ProdutoRepository;
import backend.backend.repository.ProdutoVarianteRepository;
import backend.backend.service.StorageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin(origins = "*") // Permite acesso do Frontend
public class ProdutoController {

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private ProdutoVarianteRepository produtoVarianteRepository;

    @Autowired
    private StorageService storageService;

    // =================================================================
    // 1. UPLOAD DE IMAGENS (Mantido igual)
    // =================================================================
    @PostMapping("/upload")
    public ResponseEntity<List<String>> uploadImagem(@RequestParam("imagens") MultipartFile[] arquivos) {
        List<String> urls = new ArrayList<>();

        for (MultipartFile arquivo : arquivos) {
            String urlImagem = storageService.salvarImagem(arquivo);
            urls.add(urlImagem);
        }
        return ResponseEntity.ok(urls);
    }

    // =================================================================
    // 2. CRUD DO PRODUTO (O "PAI")
    // =================================================================

    // LISTAR TODOS (Traz os produtos e suas variantes dentro)
    @GetMapping
    public List<Produto> listarProdutos() {
        return produtoRepository.findAll();
    }

    // BUSCAR UM (Pelo ID)
    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarProdutoPorId(@PathVariable Integer id) {
        return produtoRepository.findById(id)
                .map(produto -> ResponseEntity.ok().body(produto))
                .orElse(ResponseEntity.notFound().build());
    }

    // CRIAR PRODUTO (Cria apenas o "Pai" - Nome, Descrição, Tipo)
    @PostMapping
    public Produto criarProduto(@RequestBody Produto produto) {
        // Se vierem variantes no JSON inicial, precisamos vincular o pai a elas
        if (produto.getVariantes() != null) {
            for (ProdutoVariante v : produto.getVariantes()) {
                v.setProduto(produto);
            }
        }
        return produtoRepository.save(produto);
    }

    // ATUALIZAR PRODUTO (Atualiza dados gerais do Pai)
    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizarProduto(@PathVariable Integer id, @RequestBody Produto produtoDetalhes) {
        return produtoRepository.findById(id)
                .map(produtoExistente -> {
                    produtoExistente.setNome(produtoDetalhes.getNome());
                    produtoExistente.setDescricao(produtoDetalhes.getDescricao());
                    produtoExistente.setTipo(produtoDetalhes.getTipo());
                    produtoExistente.setCategoria(produtoDetalhes.getCategoria());
                    
                    Produto atualizado = produtoRepository.save(produtoExistente);
                    return ResponseEntity.ok().body(atualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETAR PRODUTO (Apaga o Pai e, por cascata, todos os Filhos/Variantes)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarProduto(@PathVariable Integer id) {
        return produtoRepository.findById(id)
                .map(produto -> {
                    produtoRepository.delete(produto);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // =================================================================
    // 3. CRUD DAS VARIANTES (OS "FILHOS") - ★ NOVO ★
    // =================================================================

    // ADICIONAR VARIANTE A UM PRODUTO ESPECÍFICO
    // Ex: POST /api/produtos/1/variantes (Adiciona uma variação ao produto ID 1)
    @PostMapping("/{idProduto}/variantes")
    public ResponseEntity<ProdutoVariante> adicionarVariante(@PathVariable Integer idProduto, @RequestBody ProdutoVariante variante) {
        return produtoRepository.findById(idProduto)
                .map(produtoPai -> {
                    // 1. Vincula o filho ao pai
                    variante.setProduto(produtoPai);
                    
                    // 2. Salva o filho na tabela 'produto_variantes'
                    ProdutoVariante novaVariante = produtoVarianteRepository.save(variante);
                    
                    return ResponseEntity.ok().body(novaVariante);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    // DELETAR UMA VARIANTE ESPECÍFICA
    @DeleteMapping("/variantes/{idVariante}")
    public ResponseEntity<?> deletarVariante(@PathVariable Integer idVariante) {
        return produtoVarianteRepository.findById(idVariante)
            .map(variante -> {
                produtoVarianteRepository.delete(variante);
                return ResponseEntity.ok().build();
            }).orElse(ResponseEntity.notFound().build());
    }
}