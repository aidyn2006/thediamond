package com.thediamond.notify;

import com.thediamond.api.dto.NotificationDtos.NotificationItem;
import com.thediamond.api.dto.NotificationDtos.NotificationList;
import com.thediamond.security.AuthPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** In-app notifications for the current user. */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final InAppNotificationService service;

    public NotificationController(InAppNotificationService service) {
        this.service = service;
    }

    @GetMapping
    public NotificationList list(@AuthenticationPrincipal AuthPrincipal me) {
        var items = service.list(me.userId()).stream()
                .map(n -> new NotificationItem(n.getId(), n.getTitle(), n.getBody(), n.isRead(), n.getCreatedAt()))
                .toList();
        return new NotificationList(service.unreadCount(me.userId()), items);
    }

    @PostMapping("/read")
    public void markAllRead(@AuthenticationPrincipal AuthPrincipal me) {
        service.markAllRead(me.userId());
    }
}
