package com.procurement.notification.repository;

import com.procurement.notification.entity.NotificationPreference;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference,Long> {
    Optional<NotificationPreference> findByUserId(Long userId);
}
