package com.procurement.notification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="notification_templates",uniqueConstraints=@UniqueConstraint(columnNames="template_code"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationTemplate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name="notification_template_id")
    private Long id;
    @Column(name="template_code",nullable=false,length=100)
    private String templateCode;
    @Column(name="title_template",nullable=false,length=500)
    private String titleTemplate;
    @Column(name="body_template",nullable=false,length=4000)
    private String bodyTemplate;
    @Enumerated(EnumType.STRING) @Column(name="notification_type",nullable=false,length=30)
    private NotificationType notificationType;
    @Builder.Default @Column(name="active",nullable=false)
    private Boolean active=true;
    @Column(name="created_at",updatable=false)
    private LocalDateTime createdAt;
    @Column(name="updated_at")
    private LocalDateTime updatedAt;
    @PrePersist void pre(){var n=LocalDateTime.now();createdAt=n;updatedAt=n;}
    @PreUpdate void upd(){updatedAt=LocalDateTime.now();}
}
