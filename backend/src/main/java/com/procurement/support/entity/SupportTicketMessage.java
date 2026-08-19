package com.procurement.support.entity;

import com.procurement.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "support_ticket_messages", indexes = {
    @Index(name = "idx_ticket_msg_ticket", columnList = "ticket_id"),
    @Index(name = "idx_ticket_msg_sender", columnList = "sender_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SupportTicketMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private SupportTicket ticket;

    @Column(name = "message_text", nullable = false, length = 4000)
    private String messageText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(name = "sender_role", length = 50)
    private String senderRole;

    @Column(name = "is_read", nullable = false)
    private Boolean read = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void pre() {
        createdAt = LocalDateTime.now();
    }
}
