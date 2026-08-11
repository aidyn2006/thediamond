package com.thediamond.notify;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Composes and dispatches the marketplace's transactional emails as branded HTML.
 * All methods swallow errors so notifications never break the main flow.
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

    // --- Account ---

    /** Sent right after registration. */
    public void welcome(String to, String siteUrl) {
        String html = EmailTemplates.render("Добро пожаловать в TheDiamond",
                p("Аккаунт создан. Теперь можно смотреть телефоны в каталоге и выставлять свои "
                        + "на продажу — без комиссии сайта.")
                        + p("Заполните профиль: покупателям нужен ваш город и телефон для связи."),
                siteUrl == null || siteUrl.isBlank() ? null : "Открыть каталог",
                siteUrl == null || siteUrl.isBlank() ? null : siteUrl + "/listings",
                null);
        safeSend(to, "Добро пожаловать в TheDiamond", html);
    }

    public void accountBanned(String to) {
        safeSend(to, "Аккаунт заблокирован", EmailTemplates.render("Аккаунт заблокирован",
                p("Администратор заблокировал ваш аккаунт: вход и публикация объявлений недоступны.")
                        + p("Если считаете это ошибкой — ответьте на это письмо.")));
    }

    public void accountUnbanned(String to) {
        safeSend(to, "Аккаунт разблокирован", EmailTemplates.render("Аккаунт разблокирован",
                p("Блокировка снята — вы снова можете войти и продавать телефоны.")));
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

    // --- Listing moderation (to the seller) ---
    public void listingApproved(String to, String title) {
        safeSend(to, "Объявление опубликовано", EmailTemplates.render("Объявление опубликовано",
                p("Ваше объявление «" + title + "» прошло проверку и теперь видно покупателям.")
                        + p("Заявки на покупку придут в раздел «Сделки».")));
    }

    public void listingRejected(String to, String title, String reason) {
        safeSend(to, "Объявление отклонено", EmailTemplates.render("Объявление отклонено",
                p("Объявление «" + title + "» не прошло проверку."
                        + (reason != null && !reason.isBlank() ? " Причина: " + reason : ""))
                        + p("Отредактируйте его и отправьте на проверку снова.")));
    }

    /** The seller took the listing down — sent to buyers who were still waiting for an answer. */
    public void listingWithdrawn(String to, String title) {
        safeSend(to, "Объявление снято с продажи", EmailTemplates.render("Объявление снято с продажи",
                p("Продавец снял «" + title + "» с продажи, поэтому ваша заявка закрыта.")
                        + p("Посмотрите другие телефоны в каталоге — их добавляют каждый день.")));
    }

    // --- Deals ---
    public void newDealRequest(String to, String buyerName, String title) {
        safeSend(to, "Новая заявка на покупку", EmailTemplates.render("Новая заявка на покупку",
                p(buyerName + " хочет купить «" + title + "».")
                        + p("Примите заявку в разделе «Сделки» — после этого вы обменяетесь телефонами.")));
    }

    public void dealAccepted(String to, String title, String sellerPhone) {
        safeSend(to, "Продавец принял вашу заявку", EmailTemplates.render("Продавец принял вашу заявку",
                p("Заявка на «" + title + "» принята.")
                        + (sellerPhone != null && !sellerPhone.isBlank()
                            ? p("Телефон продавца: <b>" + sellerPhone + "</b>")
                            : "")
                        + p("Свяжитесь с продавцом и договоритесь о встрече. Оплата проходит вне сайта — "
                            + "проверяйте телефон при получении.")));
    }

    public void dealDeclined(String to, String title, String reason) {
        safeSend(to, "Заявку отклонили", EmailTemplates.render("Заявку отклонили",
                p("Продавец отклонил вашу заявку на «" + title + "»."
                        + (reason != null && !reason.isBlank() ? " Причина: " + reason : ""))
                        + p("Посмотрите другие предложения в каталоге.")));
    }
}
