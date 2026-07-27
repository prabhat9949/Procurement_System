package com.procurement.notification.mapper;

import com.procurement.notification.dto.response.*;
import com.procurement.notification.entity.*;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {
    public NotificationResponse toResponse(Notification e){return new NotificationResponse(e.getId(),e.getNotificationNumber(),e.getTitle(),e.getMessage(),e.getType(),e.getPriority(),e.getStatus(),e.getReferenceType(),e.getReferenceId(),e.getSender()==null?null:e.getSender().getId(),e.getSender()==null?null:e.getSender().getUsername(),e.getCreatedAt(),e.getScheduledAt(),e.getSentAt(),e.getExpiresAt());}
    public NotificationRecipientResponse toRecipientResponse(NotificationRecipient e){return new NotificationRecipientResponse(e.getId(),e.getNotification().getId(),e.getUser().getId(),e.getUser().getUsername(),e.getDeliveryChannel(),e.getReadFlag(),e.getReadAt(),e.getDeliveryStatus());}
    public NotificationTemplateResponse toTemplateResponse(NotificationTemplate e){return new NotificationTemplateResponse(e.getId(),e.getTemplateCode(),e.getTitleTemplate(),e.getBodyTemplate(),e.getNotificationType(),e.getActive());}
    public NotificationPreferenceResponse toPreferenceResponse(NotificationPreference e){return new NotificationPreferenceResponse(e.getId(),e.getUser().getId(),e.getEmailEnabled(),e.getSmsEnabled(),e.getInAppEnabled(),e.getApprovalNotifications(),e.getPaymentNotifications(),e.getRfqNotifications());}
}
