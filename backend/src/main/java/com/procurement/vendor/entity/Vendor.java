package com.procurement.vendor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "vendors",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "vendor_code"),
                @UniqueConstraint(columnNames = "gst_number")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vendor_id")
    private Long id;

    @Column(name = "vendor_code", nullable = false, length = 30)
    private String vendorCode;

    @Column(name = "vendor_name", nullable = false, length = 200)
    private String vendorName;

    @Column(name = "contact_person", length = 150)
    private String contactPerson;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "mobile", length = 30)
    private String mobile;

    @Column(name = "gst_number", length = 30)
    private String gstNumber;

    @Column(name = "pan_number", length = 20)
    private String panNumber;

    @Column(name = "registration_number", length = 50)
    private String registrationNumber;

    @Column(name = "vendor_type", nullable = false, length = 50)
    private String vendorType;

    @Column(name = "payment_terms", length = 100)
    private String paymentTerms;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "credit_limit", precision = 15, scale = 2)
    private BigDecimal creditLimit;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "bank_name", length = 150)
    private String bankName;

    @Column(name = "bank_account_number", length = 50)
    private String bankAccountNumber;

    @Column(name = "ifsc_code", length = 20)
    private String ifscCode;

    @Column(name = "website", length = 255)
    private String website;

    @Column(name = "address_line1", length = 255)
    private String addressLine1;

    @Column(name = "address_line2", length = 255)
    private String addressLine2;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Builder.Default
    @Column(name = "status", nullable = false, length = 30)
    private String status = "ACTIVE";

    @Column(name = "rating", precision = 3, scale = 2)
    private BigDecimal rating;

    @Builder.Default
    @Column(name = "approved", nullable = false)
    private Boolean approved = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 100, updatable = false)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
