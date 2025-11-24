package backend.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID; // Para gerar nomes únicos

@Service
public class StorageService {

    // Define o caminho da pasta que criamos (static/uploads)
    private final String UPLOAD_DIR = "src/main/resources/static/uploads/";

    public StorageService() {
        // Cria a pasta de upload se ela não existir
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível criar a pasta de upload", e);
        }
    }

    public String salvarImagem(MultipartFile arquivo) {
        try {
            // 1. Gera um nome de arquivo único (para evitar nomes iguais)
            // Ex: bermuda.png -> 123e4567-e89b-12d3-a456-426614174000-bermuda.png
            String nomeOriginal = arquivo.getOriginalFilename();
            String nomeUnico = UUID.randomUUID().toString() + "-" + nomeOriginal;

            // 2. Define o caminho completo onde o arquivo será salvo
            Path caminhoCompleto = Paths.get(UPLOAD_DIR + nomeUnico);

            // 3. Salva o arquivo no disco
            Files.copy(arquivo.getInputStream(), caminhoCompleto);

            // 4. Retorna o CAMINHO (URL) que o frontend pode usar
            // (Ex: "/uploads/123e4567-bermuda.png")
            return "/uploads/" + nomeUnico;

        } catch (IOException e) {
            throw new RuntimeException("Falha ao salvar a imagem: " + e.getMessage());
        }
    }
}
