package com.thediamond.notify;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

/**
 * Sends transactional email. Transport is chosen at runtime:
 * <ol>
 *   <li>SMTP (e.g. Mail.ru) when {@code spring.mail.host}+username are configured;</li>
 *   <li>Resend HTTP API when a {@code RESEND_API_KEY} is set;</li>
 *   <li>otherwise the message is logged to the console.</li>
 * </ol>
 * Bodies are HTML. This service never throws into the caller.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final String from;
    private final String smtpHost;
    private final String smtpUsername;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final Resend resend;

    public EmailService(@Value("${app.mail.from}") String from,
                        @Value("${app.mail.resend-api-key:}") String resendApiKey,
                        @Value("${spring.mail.host:}") String smtpHost,
                        @Value("${spring.mail.username:}") String smtpUsername,
                        ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.from = from;
        this.smtpHost = smtpHost;
        this.smtpUsername = smtpUsername;
        this.mailSenderProvider = mailSenderProvider;
        this.resend = (resendApiKey == null || resendApiKey.isBlank()) ? null : new Resend(resendApiKey);
    }

    private boolean smtpEnabled() {
        return smtpHost != null && !smtpHost.isBlank()
                && smtpUsername != null && !smtpUsername.isBlank();
    }

    /** Send an HTML email. {@code html} is the full message body. */
    public void send(String to, String subject, String html) {
        if (smtpEnabled()) {
            sendViaSmtp(to, subject, html);
        } else if (resend != null) {
            sendViaResend(to, subject, html);
        } else {
            log.info("[EMAIL:console] to={} | {}\n{}", to, subject, html);
        }
    }

    private void sendViaSmtp(String to, String subject, String html) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null) {
            log.warn("[EMAIL:failed] SMTP configured but no JavaMailSender bean — to={} | {}", to, subject);
            return;
        }
        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
            // Mail.ru requires the From to match the authenticated mailbox.
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            sender.send(message);
            log.info("[EMAIL:sent:smtp] to={} | {}", to, subject);
        } catch (Exception e) {
            log.warn("[EMAIL:failed:smtp] to={} | {} — {}", to, subject, e.getMessage());
        }
    }

    private void sendViaResend(String to, String subject, String html) {
        try {
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(from)
                    .to(to)
                    .subject(subject)
                    .html(html)
                    .build();
            CreateEmailResponse data = resend.emails().send(params);
            log.info("[EMAIL:sent:resend] to={} | {} | id={}", to, subject, data.getId());
        } catch (Exception e) {
            log.warn("[EMAIL:failed:resend] to={} | {} — {}", to, subject, e.getMessage());
        }
    }
}
