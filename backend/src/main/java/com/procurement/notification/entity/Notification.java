package com.procurement.notification.entity;

import com.procurement.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="notifications",uniqueConstraints={@UniqueConstraint(columnNames="notification_number")},indexes={@Index(name="idx_notification_number",columnList="notification_number"),@Index(name="idx_notification_status",columnList="status"),@Index(name="idx_notification_type",columnList="type"),@Index(name="idx_notification_created_at",columnList="created_at")})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name="notification_id")
    private Long id;
    @Column(name="notification_number",nullable=false,length=50)
    private String notificationNumber;
    @Column(nullable=false,length=200)
    private String title;
    @Column(nullable=false,length=4000)
    private String message;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=30)
    private NotificationType type;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20)
    private NotificationPriority priority;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20)
    private NotificationStatus status;
    @Column(name="reference_type",length=100)
    private String referenceType;
    @Column(name="reference_id")
    private Long referenceId;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="sender_id")
    private User sender;
    @Column(name="created_at",nullable=false,updatable=false)
    private LocalDateTime createdAt;
    @Column(name="scheduled_at")
    private LocalDateTime scheduledAt;
    @Column(name="sent_at")
    private LocalDateTime sentAt;
    @Column(name="expires_at")
    private LocalDateTime expiresAt;
    @Column(name="created_by",nullable=false)
    private String createdBy;
    @Column(name="updated_by")
    private String updatedBy;
    @Column(name="updated_at")
    private LocalDateTime updatedAt;
    @PrePersist void pre(){var n=LocalDateTime.now();createdAt=n;updatedAt=n;if(status==null)status=NotificationStatus.DRAFT;}
    @PreUpdate void upd(){updatedAt=LocalDateTime.now();}
}
