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
import java.util.Date;

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
            // MULTIPART_MODE_MIXED_RELATED lets us attach both a plain-text and an HTML
            // body (multipart/alternative) — HTML-only mail scores higher as spam.
            MimeMessageHelper helper = new MimeMessageHelper(
                    message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());
            // Mail.ru requires the From to match the authenticated mailbox.
            helper.setFrom(from);
            helper.setTo(to);
            helper.setReplyTo(from);
            helper.setSubject(subject);
            // A Date header is expected by spam filters; JavaMail also sets one on send.
            helper.setSentDate(new Date());
            // Order matters: plain-text first, HTML second (preferred alternative).
            helper.setText(htmlToText(html), html);
            // One-click unsubscribe signals a legitimate (non-spam) sender.
            message.addHeader("List-Unsubscribe", "<mailto:" + fromAddress() + "?subject=unsubscribe>");
            message.addHeader("List-Unsubscribe-Post", "List-Unsubscribe=One-Click");
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
                    .replyTo(from)
                    .subject(subject)
                    .html(html)
                    .text(htmlToText(html))
                    .build();
            CreateEmailResponse data = resend.emails().send(params);
            log.info("[EMAIL:sent:resend] to={} | {} | id={}", to, subject, data.getId());
        } catch (Exception e) {
            log.warn("[EMAIL:failed:resend] to={} | {} — {}", to, subject, e.getMessage());
        }
    }

    /** Bare email address inside a "Name <addr>" from string (or the string itself). */
    private String fromAddress() {
        int lt = from.indexOf('<');
        int gt = from.indexOf('>');
        return (lt >= 0 && gt > lt) ? from.substring(lt + 1, gt).trim() : from.trim();
    }

    /** Crude HTML→text for the plain-text alternative part (spam filters expect one). */
    static String htmlToText(String html) {
        if (html == null) return "";
        String text = html
                .replaceAll("(?is)<(script|style)[^>]*>.*?</\\1>", " ")
                .replaceAll("(?i)<br\\s*/?>", "\n")
                .replaceAll("(?i)</(p|div|h1|h2|h3|tr|li)>", "\n")
                .replaceAll("(?i)<a[^>]*href=\"([^\"]*)\"[^>]*>(.*?)</a>", "$2 ($1)")
                .replaceAll("<[^>]+>", " ");
        text = text
                .replace("&nbsp;", " ").replace("&amp;", "&")
                .replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"")
                .replaceAll("[ \\t]+", " ")
                .replaceAll("\\n\\s*\\n\\s*\\n+", "\n\n");
        return text.trim();
    }
}
