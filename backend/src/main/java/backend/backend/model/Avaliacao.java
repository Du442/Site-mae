package backend.backend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Avaliacao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private int nota; // 1 a 5
    private String comentario;
    
    @ManyToOne
    @JoinColumn(name = "produto_id")
    @JsonIgnore
    private Produto produto;

    // Construtores, Getters e Setters...
    public Integer getId() { 
        return id; 
    }
    public void setId(Integer id) { 
        this.id = id; 
    }
    public int getNota() { 
        return nota; 
    }
    public void setNota(int nota) { 
        this.nota = nota; 
    }
    public String getComentario() { 
        return comentario; 
    }
    public void setComentario(String comentario) { 
        this.comentario = comentario; 
    }
    public Produto getProduto() { 
        return produto; 
    }
    public void setProduto(Produto produto) { 
        this.produto = produto; 
    }
}