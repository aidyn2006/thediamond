package com.thediamond.notify;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Sends transactional email via the Resend Java SDK. If no API key is configured,
 * emails are logged to the console instead — never throws into the caller.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final String from;
    private final Resend resend;

    public EmailService(@Value("${app.mail.resend-api-key}") String apiKey,
                        @Value("${app.mail.from}") String from) {
        this.from = from;
        this.resend = (apiKey == null || apiKey.isBlank()) ? null : new Resend(apiKey);
    }

    public void send(String to, String subject, String text) {
        if (resend == null) {
            log.info("[EMAIL:console] to={} | {}\n{}", to, subject, text);
            return;
        }
        try {
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(from)
                    .to(to)
                    .subject(subject)
                    .text(text)
                    .build();
            CreateEmailResponse data = resend.emails().send(params);
            log.info("[EMAIL:sent] to={} | {} | id={}", to, subject, data.getId());
        } catch (Exception e) {
            log.warn("[EMAIL:failed] to={} | {} — {}", to, subject, e.getMessage());
        }
    }
}
