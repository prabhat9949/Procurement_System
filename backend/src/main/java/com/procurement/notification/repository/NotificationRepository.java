package com.procurement.notification.repository;

import com.procurement.notification.entity.Notification;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification,Long>, JpaSpecificationExecutor<Notification> {
    Optional<Notification> findByNotificationNumber(String notificationNumber);
    boolean existsByNotificationNumber(String notificationNumber);
}
