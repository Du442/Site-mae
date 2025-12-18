package backend.backend.model;

import backend.backend.model.ProdutoVariante;
import jakarta.persistence.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "produtos")
public class Produto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nome;
    private String descricao;
    private String tipo;
    private String categoria;
    private Double mediaAvaliacoes = 0.0;
    private Integer totalAvaliacoes = 0;

    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProdutoVariante> variantes;

    public Produto(){}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNome(){
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao(){
        return descricao;
    }

    public void setDescricao(String descricao){
        this.descricao = descricao;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public List<ProdutoVariante> getVariantes() {
        return variantes;
    }

    public void setVariantes(List<ProdutoVariante> variantes) {
        this.variantes = variantes;
    }

    public Double getMediaAvaliacoes() {
        return mediaAvaliacoes == null ? 0.0 : mediaAvaliacoes;
    }
    public void setMediaAvaliacoes(Double mediaAvaliacoes) {
        this.mediaAvaliacoes = mediaAvaliacoes;
    }

    public Integer getTotalAvaliacoes() {
        return totalAvaliacoes == null ? 0 : totalAvaliacoes;
    }
    public void setTotalAvaliacoes(Integer totalAvaliacoes) {
        this.totalAvaliacoes = totalAvaliacoes;
    }



}