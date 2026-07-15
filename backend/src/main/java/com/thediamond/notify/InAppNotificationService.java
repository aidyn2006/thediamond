package com.thediamond.notify;

import com.thediamond.domain.Notification;
import com.thediamond.domain.User;
import com.thediamond.repo.NotificationRepository;
import com.thediamond.repo.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * In-app notification center. The single entry point is {@link #send(Long, String, String)} —
 * call it from anywhere an event happens (e.g. a creator is accepted as UGC). Persists a row
 * the user can later read via {@code /api/notifications}. Never throws into the caller.
 */
@Service
public class InAppNotificationService {

    private static final Logger log = LoggerFactory.getLogger(InAppNotificationService.class);

    private final NotificationRepository notifications;
    private final UserRepository users;

    public InAppNotificationService(NotificationRepository notifications, UserRepository users) {
        this.notifications = notifications;
        this.users = users;
    }

    /** Fire-and-forget: create an in-app notification for a user. */
    @Transactional
    public void send(Long userId, String title, String body) {
        if (userId == null) return;
        try {
            User user = users.findById(userId).orElse(null);
            if (user == null) return;
            Notification n = new Notification();
            n.setUser(user);
            n.setTitle(title);
            n.setBody(body);
            notifications.save(n);
        } catch (Exception e) {
            log.warn("In-app notification failed for user {}: {}", userId, e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<Notification> list(Long userId) {
        return notifications.findTop50ByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return notifications.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notifications.findTop50ByUserIdOrderByCreatedAtDesc(userId).forEach(n -> {
            if (!n.isRead()) {
                n.setRead(true);
                notifications.save(n);
            }
        });
    }
}
