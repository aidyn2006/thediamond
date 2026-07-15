package com.thediamond.notify;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Composes and dispatches the product's transactional emails (spec 1.7) as
 * branded HTML. All methods swallow errors so notifications never break the main flow.
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final EmailService email;

    public NotificationService(EmailService email) {
        this.email = email;
    }

    private void safeSend(String to, String subject, String html) {
        try {
            if (to != null && !to.isBlank()) email.send(to, subject, html);
        } catch (Exception e) {
            log.warn("Notification failed for {}: {}", to, e.getMessage());
        }
    }

    private static String p(String text) {
        return "<p style=\"margin:0 0 12px;\">" + text + "</p>";
    }

    // --- Auth ---
    public void emailVerificationCode(String to, String code) {
        String html = EmailTemplates.render("Подтвердите почту",
                p("Ваш код подтверждения TheDiamond. Введите его на сайте, чтобы подтвердить почту.")
                        + p("Код действует 15 минут."),
                null, null, code);
        safeSend(to, "Код подтверждения TheDiamond", html);
    }

    public void passwordReset(String to, String resetUrl) {
        String html = EmailTemplates.render("Сброс пароля",
                p("Вы запросили сброс пароля в TheDiamond. Нажмите кнопку ниже, чтобы задать новый пароль.")
                        + p("Ссылка действует 30 минут. Если вы не запрашивали сброс — просто проигнорируйте это письмо."),
                "Задать новый пароль", resetUrl, null);
        safeSend(to, "Сброс пароля — TheDiamond", html);
    }

    // --- Creator ---
    public void creatorProfileApproved(String to) {
        safeSend(to, "Профиль одобрен", EmailTemplates.render("Профиль одобрен",
                p("Ваш профиль на TheDiamond одобрен. Загляните в кампании и откликнитесь на подходящую.")));
    }

    public void applicationAccepted(String to, String campaignTitle) {
        safeSend(to, "Ваш отклик приняли", EmailTemplates.render("Ваш отклик приняли",
                p("Бренд принял ваш отклик на кампанию «" + campaignTitle + "».")
                        + p("Выполните задание и сдайте ссылку на публикацию в разделе «Мои отклики».")));
    }

    public void workApproved(String to, String campaignTitle) {
        safeSend(to, "Работа одобрена", EmailTemplates.render("Работа одобрена",
                p("Ваша работа по кампании «" + campaignTitle + "» одобрена. Отличный результат!")));
    }

    public void workRejected(String to, String campaignTitle, String reason) {
        safeSend(to, "Работу вернули на доработку", EmailTemplates.render("Работу вернули на доработку",
                p("Работу по кампании «" + campaignTitle + "» отклонили. Причина: " + reason)
                        + p("Вы можете сдать заново один раз в разделе «Мои отклики».")));
    }

    // --- Brand ---
    public void brandProfileApproved(String to) {
        safeSend(to, "Профиль компании одобрен", EmailTemplates.render("Профиль компании одобрен",
                p("Профиль вашей компании одобрен. Создайте первую кампанию — и креаторы откликнутся.")));
    }

    public void campaignApproved(String to, String campaignTitle) {
        safeSend(to, "Кампания одобрена", EmailTemplates.render("Кампания одобрена",
                p("Кампания «" + campaignTitle + "» прошла модерацию и теперь видна креаторам.")));
    }

    public void campaignRejected(String to, String campaignTitle, String reason) {
        safeSend(to, "Кампанию отклонили", EmailTemplates.render("Кампанию отклонили",
                p("Кампанию «" + campaignTitle + "» отклонили. Причина: " + reason)
                        + p("Отредактируйте её и отправьте на модерацию снова.")));
    }

    public void newApplication(String to, String creatorName, String campaignTitle) {
        safeSend(to, "Новый отклик на кампанию", EmailTemplates.render("Новый отклик на кампанию",
                p(creatorName + " откликнулся на вашу кампанию «" + campaignTitle + "».")
                        + p("Посмотрите профиль и примите решение в кабинете.")));
    }
}
