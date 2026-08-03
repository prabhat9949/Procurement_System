package com.procurement.payment.entity;

public enum PaymentStatus {
    DRAFT,
    SCHEDULED,
    APPROVED,
    PROCESSING,
    PARTIALLY_PAID,
    PAID,
    FAILED,
    CANCELLED,
    REFUNDED
}
