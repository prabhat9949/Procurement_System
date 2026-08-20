package com.procurement.notification.entity;

import com.procurement.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="notification_recipients",indexes={@Index(name="idx_notification_recipient_notification",columnList="notification_id"),@Index(name="idx_notification_recipient_user",columnList="user_id")})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationRecipient {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name="notification_recipient_id")
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="notification_id",nullable=false)
    private Notification notification;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="user_id",nullable=false)
    private User user;
    @Enumerated(EnumType.STRING) @Column(name="delivery_channel",nullable=false,length=20)
    private DeliveryChannel deliveryChannel;
    @Column(name="read_flag",nullable=false)
    @Builder.Default private Boolean readFlag=false;
    @Column(name="read_at")
    private LocalDateTime readAt;
    @Enumerated(EnumType.STRING) @Column(name="delivery_status",nullable=false,length=20)
    @Builder.Default private DeliveryStatus deliveryStatus=DeliveryStatus.PENDING;
}
