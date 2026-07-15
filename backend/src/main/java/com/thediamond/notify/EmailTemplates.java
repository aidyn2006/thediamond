package com.thediamond.notify;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Branded HTML wrappers for transactional email. Uses inline styles only
 * (email clients strip &lt;style&gt;/external CSS) and the TheDiamond palette.
 */
final class EmailTemplates {

    private EmailTemplates() {}

    private static final ZoneId ZONE = ZoneId.of("Asia/Almaty");
    private static final DateTimeFormatter STAMP =
            DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss.SSS");

    /** Full timestamp shown in the header — also makes each email body unique. */
    private static String stamp() {
        return ZonedDateTime.now(ZONE).format(STAMP);
    }

    private static final String BG = "#101114";
    private static final String SURFACE = "#17181d";
    private static final String BORDER = "#2a2c34";
    private static final String TEXT = "#f2f3f5";
    private static final String TEXT_DIM = "#9a9da7";
    private static final String ACCENT = "#7fd4ff";

    /** Full HTML document: heading + body paragraphs, optional CTA button, optional highlighted code. */
    static String render(String heading, String bodyHtml, String ctaLabel, String ctaUrl, String code) {
        StringBuilder inner = new StringBuilder();
        inner.append("<h1 style=\"margin:0 0 16px;font-size:22px;line-height:1.15;color:").append(TEXT)
                .append(";font-weight:600;\">").append(heading).append("</h1>");
        inner.append("<div style=\"font-size:15px;line-height:1.5;color:").append(TEXT_DIM).append(";\">")
                .append(bodyHtml).append("</div>");

        if (code != null && !code.isBlank()) {
            inner.append("<div style=\"margin:24px 0;padding:16px;border:1px solid ").append(BORDER)
                    .append(";border-radius:10px;background:").append(BG)
                    .append(";text-align:center;font-size:28px;font-weight:700;letter-spacing:8px;color:")
                    .append(ACCENT).append(";\">").append(code).append("</div>");
        }
        if (ctaLabel != null && ctaUrl != null) {
            inner.append("<div style=\"margin:24px 0 8px;\">")
                    .append("<a href=\"").append(ctaUrl)
                    .append("\" style=\"display:inline-block;padding:12px 24px;border-radius:8px;background:")
                    .append(ACCENT).append(";color:#0b0c0f;font-size:15px;font-weight:600;text-decoration:none;\">")
                    .append(ctaLabel).append("</a></div>")
                    .append("<p style=\"font-size:13px;color:").append(TEXT_DIM)
                    .append(";word-break:break-all;\">Если кнопка не работает, скопируйте ссылку: <br>")
                    .append("<a href=\"").append(ctaUrl).append("\" style=\"color:").append(ACCENT).append(";\">")
                    .append(ctaUrl).append("</a></p>");
        }

        return "<!doctype html><html lang=\"ru\"><body style=\"margin:0;padding:0;background:" + BG
                + ";\"><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:"
                + BG + ";padding:32px 16px;\"><tr><td align=\"center\">"
                + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:480px;background:"
                + SURFACE + ";border:1px solid " + BORDER + ";border-radius:12px;overflow:hidden;\">"
                + "<tr><td style=\"padding:28px 28px 0;\">"
                + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\"><tr>"
                + "<td style=\"font-size:17px;font-weight:700;color:" + TEXT + ";letter-spacing:0.5px;\">"
                + "The<span style=\"color:" + ACCENT + ";\">Diamond</span></td>"
                + "<td align=\"right\" style=\"font-size:11px;color:" + TEXT_DIM + ";white-space:nowrap;\">"
                + stamp() + "</td></tr></table></td></tr>"
                + "<tr><td style=\"padding:20px 28px 28px;\">" + inner + "</td></tr>"
                + "<tr><td style=\"padding:16px 28px;border-top:1px solid " + BORDER + ";\">"
                + "<p style=\"margin:0;font-size:12px;color:" + TEXT_DIM
                + ";\">TheDiamond — платформа для брендов и креаторов Казахстана.</p></td></tr>"
                + "</table></td></tr></table></body></html>";
    }

    static String render(String heading, String bodyHtml) {
        return render(heading, bodyHtml, null, null, null);
    }
}
