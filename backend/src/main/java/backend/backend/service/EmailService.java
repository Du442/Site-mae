package backend.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Método genérico para enviar e-mail
    public void enviarEmailTexto(String para, String assunto, String mensagem) {
        SimpleMailMessage email = new SimpleMailMessage();
        
        email.setTo(para);
        email.setSubject(assunto);
        email.setText(mensagem);
        
        // Coloque o seu e-mail aqui também para evitar spam
        email.setFrom("SEU_EMAIL@gmail.com"); 

        mailSender.send(email);
        System.out.println("E-mail enviado com sucesso para: " + para);
    }
}