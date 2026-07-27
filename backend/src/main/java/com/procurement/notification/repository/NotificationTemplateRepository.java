package com.procurement.notification.repository;

import com.procurement.notification.entity.NotificationTemplate;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate,Long> {
    Optional<NotificationTemplate> findByTemplateCode(String templateCode);
}
