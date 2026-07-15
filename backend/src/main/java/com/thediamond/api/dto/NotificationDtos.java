package com.thediamond.api.dto;

import java.time.Instant;
import java.util.List;

public final class NotificationDtos {

    private NotificationDtos() {}

    public record NotificationItem(
            Long id,
            String title,
            String body,
            boolean read,
            Instant createdAt
    ) {}

    public record NotificationList(long unread, List<NotificationItem> items) {}
}
