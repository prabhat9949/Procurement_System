package com.procurement.notification.service;

import com.procurement.common.response.PageResponse;
import com.procurement.notification.dto.request.*;
import com.procurement.notification.dto.response.*;
import com.procurement.notification.entity.*;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    NotificationResponse create(NotificationRequest request);
    PageResponse<NotificationResponse> search(String keyword, Long userId, NotificationStatus status, NotificationPriority priority, NotificationType type, Pageable pageable);
    NotificationResponse get(Long id);
    NotificationResponse send(Long id, NotificationSendRequest request);
    NotificationResponse markRead(Long id);
    NotificationResponse archive(Long id);
    PageResponse<NotificationRecipientResponse> recipients(Long id, Pageable pageable);
    NotificationTemplateResponse createTemplate(NotificationTemplateRequest request);
    PageResponse<NotificationTemplateResponse> templates(Pageable pageable);
    NotificationTemplateResponse updateTemplate(Long id, NotificationTemplateRequest request);
    NotificationPreferenceResponse getPreference(Long userId);
    NotificationPreferenceResponse updatePreference(Long userId, NotificationPreferenceRequest request);
    PageResponse<NotificationPreferenceResponse> preferences(Pageable pageable);
}
