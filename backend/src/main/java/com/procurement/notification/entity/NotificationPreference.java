package com.procurement.notification.entity;

import com.procurement.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="notification_preferences",uniqueConstraints=@UniqueConstraint(columnNames="user_id"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationPreference {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name="notification_preference_id")
    private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="user_id",nullable=false,unique=true)
    private User user;
    @Builder.Default @Column(name="email_enabled",nullable=false) private Boolean emailEnabled=true;
    @Builder.Default @Column(name="sms_enabled",nullable=false) private Boolean smsEnabled=false;
    @Builder.Default @Column(name="in_app_enabled",nullable=false) private Boolean inAppEnabled=true;
    @Builder.Default @Column(name="approval_notifications",nullable=false) private Boolean approvalNotifications=true;
    @Builder.Default @Column(name="payment_notifications",nullable=false) private Boolean paymentNotifications=true;
    @Builder.Default @Column(name="rfq_notifications",nullable=false) private Boolean rfqNotifications=true;
}
