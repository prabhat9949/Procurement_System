package com.procurement.notification.repository;

import com.procurement.notification.entity.NotificationRecipient;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRecipientRepository extends JpaRepository<NotificationRecipient,Long> {
    List<NotificationRecipient> findByNotificationId(Long id);
    List<NotificationRecipient> findByUserId(Long userId);
}
