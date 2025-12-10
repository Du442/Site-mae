package backend.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.Arrays;
import java.util.Hashtable;
import java.util.List;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // 1. Método para enviar e-mail
    public void enviarEmailTexto(String para, String assunto, String mensagem) {
        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(para);
        email.setSubject(assunto);
        email.setText(mensagem);
        email.setFrom("SEU_EMAIL@gmail.com");

        mailSender.send(email);
        System.out.println("E-mail enviado com sucesso para: " + para);
    }

    // 2. Método para validar se o domínio existe (DNS/MX)
    public boolean isDomainValid(String email) {
        int pos = email.indexOf('@');
        if (pos == -1) return false;
        
        String domain = email.substring(pos + 1);

        try {
            Hashtable<String, String> env = new Hashtable<>();
            env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
            
            DirContext ictx = new InitialDirContext(env);
            Attributes attrs = ictx.getAttributes(domain, new String[] { "MX" });
            Attribute attr = attrs.get("MX");

            return (attr != null) && (attr.size() > 0);
        } catch (NamingException e) {
            return false; // Domínio não existe (ex: gmial.com)
        }
    }

    // 3. Método de Whitelist (Permitir apenas domínios específicos) 
    public boolean isEmailPermitido(String email) {
        List<String> dominiosPermitidos = Arrays.asList(
            "gmail.com", 
            "outlook.com", 
            "hotmail.com", 
            "vipstyle.com.br",
            "yahoo.com.br",
            "icloud.com"
        );

        String dominioUsuario = email.substring(email.indexOf("@") + 1).toLowerCase();
        return dominiosPermitidos.contains(dominioUsuario);
    }
}