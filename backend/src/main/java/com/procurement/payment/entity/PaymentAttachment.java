package com.procurement.payment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="payment_attachments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentAttachment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name="payment_attachment_id")
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="payment_id",nullable=false)
    private Payment payment;
    @Column(nullable=false)
    private String fileName;
    @Column(nullable=false,length=1000)
    private String filePath;
    @Column(nullable=false)
    private String fileType;
    @Column(nullable=false)
    private LocalDateTime uploadedAt;
    @PrePersist void pre(){if(uploadedAt==null)uploadedAt=LocalDateTime.now();}
}
