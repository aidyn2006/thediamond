package com.thediamond.notify;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Sends transactional email via Resend (HTTP API). If no API key is configured,
 * emails are logged to the console instead — never throws into the caller.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final String apiKey;
    private final String from;
    private final RestClient http = RestClient.create();

    public EmailService(@Value("${app.mail.resend-api-key}") String apiKey,
                        @Value("${app.mail.from}") String from) {
        this.apiKey = apiKey;
        this.from = from;
    }

    public void send(String to, String subject, String text) {
        if (apiKey == null || apiKey.isBlank()) {
            log.info("[EMAIL:console] to={} | {}\n{}", to, subject, text);
            return;
        }
        try {
            http.post()
                    .uri("https://api.resend.com/emails")
                    .header("Authorization", "Bearer " + apiKey)
                    .body(Map.of("from", from, "to", to, "subject", subject, "text", text))
                    .retrieve()
                    .toBodilessEntity();
            log.info("[EMAIL:sent] to={} | {}", to, subject);
        } catch (Exception e) {
            log.warn("[EMAIL:failed] to={} | {} — {}", to, subject, e.getMessage());
        }
    }
}
