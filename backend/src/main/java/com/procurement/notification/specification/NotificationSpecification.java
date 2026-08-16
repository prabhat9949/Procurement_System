package com.procurement.notification.specification;

import com.procurement.notification.entity.*;
import org.springframework.data.jpa.domain.Specification;

public final class NotificationSpecification {
    private NotificationSpecification(){}
    public static Specification<Notification> search(String keyword, Long userId, NotificationStatus status, NotificationPriority priority, NotificationType type) {
        return (root, query, cb) -> {
            var p = cb.conjunction();
            if (keyword != null && !keyword.isBlank()) {
                var k = "%" + keyword.toLowerCase() + "%";
                p = cb.and(p, cb.or(
                        cb.like(cb.lower(root.get("notificationNumber")), k),
                        cb.like(cb.lower(root.get("title")), k),
                        cb.like(cb.lower(root.get("message")), k),
                        cb.like(cb.lower(root.get("referenceType")), k)
                ));
            }
            if (userId != null) p = cb.and(p, cb.equal(root.get("sender").get("id"), userId));
            if (status != null) p = cb.and(p, cb.equal(root.get("status"), status));
            if (priority != null) p = cb.and(p, cb.equal(root.get("priority"), priority));
            if (type != null) p = cb.and(p, cb.equal(root.get("type"), type));
            return p;
        };
    }
}
