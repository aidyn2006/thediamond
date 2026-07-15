package com.thediamond.notify;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Composes and dispatches the product's transactional emails (spec 1.7).
 * All methods swallow errors so notifications never break the main flow.
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final EmailService email;

    public NotificationService(EmailService email) {
        this.email = email;
    }

    private void safeSend(String to, String subject, String body) {
        try {
            if (to != null && !to.isBlank()) email.send(to, subject, body);
        } catch (Exception e) {
            log.warn("Notification failed for {}: {}", to, e.getMessage());
        }
    }

    // --- Auth ---
    public void emailVerificationCode(String to, String code) {
        safeSend(to, "Код подтверждения TheDiamond",
                "Ваш код подтверждения: " + code + "\n"
                        + "Введите его на сайте, чтобы подтвердить почту. Код действует 15 минут.");
    }

    // --- Creator ---
    public void creatorProfileApproved(String to) {
        safeSend(to, "Профиль одобрен",
                "Ваш профиль на TheDiamond одобрен. Загляните в кампании и откликнитесь на подходящую.");
    }

    public void applicationAccepted(String to, String campaignTitle) {
        safeSend(to, "Ваш отклик приняли",
                "Бренд принял ваш отклик на кампанию «" + campaignTitle + "». "
                        + "Выполните задание и сдайте ссылку на публикацию в разделе «Мои отклики».");
    }

    public void workApproved(String to, String campaignTitle) {
        safeSend(to, "Работа одобрена",
                "Ваша работа по кампании «" + campaignTitle + "» одобрена. Отличный результат!");
    }

    public void workRejected(String to, String campaignTitle, String reason) {
        safeSend(to, "Работу вернули на доработку",
                "Работу по кампании «" + campaignTitle + "» отклонили. Причина: " + reason
                        + "\nВы можете сдать заново один раз в разделе «Мои отклики».");
    }

    // --- Brand ---
    public void brandProfileApproved(String to) {
        safeSend(to, "Профиль компании одобрен",
                "Профиль вашей компании одобрен. Создайте первую кампанию — и креаторы откликнутся.");
    }

    public void campaignApproved(String to, String campaignTitle) {
        safeSend(to, "Кампания одобрена",
                "Кампания «" + campaignTitle + "» прошла модерацию и теперь видна креаторам.");
    }

    public void campaignRejected(String to, String campaignTitle, String reason) {
        safeSend(to, "Кампанию отклонили",
                "Кампанию «" + campaignTitle + "» отклонили. Причина: " + reason
                        + "\nОтредактируйте её и отправьте на модерацию снова.");
    }

    public void newApplication(String to, String creatorName, String campaignTitle) {
        safeSend(to, "Новый отклик на кампанию",
                creatorName + " откликнулся на вашу кампанию «" + campaignTitle + "». "
                        + "Посмотрите профиль и примите решение в кабинете.");
    }
}
