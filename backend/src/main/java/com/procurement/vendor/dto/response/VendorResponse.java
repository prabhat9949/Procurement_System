package com.procurement.vendor.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VendorResponse(
        Long id,
        String vendorCode,
        String vendorName,
        String contactPerson,
        String email,
        String phone,
        String mobile,
        String gstNumber,
        String panNumber,
        String registrationNumber,
        String vendorType,
        String paymentTerms,
        String paymentMethod,
        BigDecimal creditLimit,
        String currency,
        String bankName,
        String bankAccountNumber,
        String ifscCode,
        String website,
        String addressLine1,
        String addressLine2,
        String city,
        String state,
        String country,
        String postalCode,
        String status,
        BigDecimal rating,
        Boolean approved,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String updatedBy) {
}
