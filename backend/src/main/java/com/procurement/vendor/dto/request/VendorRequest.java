package com.procurement.vendor.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record VendorRequest(
        @NotBlank @Size(max = 30) String vendorCode,
        @NotBlank @Size(max = 200) String vendorName,
        @Size(max = 150) String contactPerson,
        @Email @Size(max = 150) String email,
        @Size(max = 30) String phone,
        @Size(max = 30) String mobile,
        @Size(max = 30) String gstNumber,
        @Size(max = 20) String panNumber,
        @Size(max = 50) String registrationNumber,
        @NotBlank @Size(max = 50) String vendorType,
        @Size(max = 100) String paymentTerms,
        @Size(max = 50) String paymentMethod,
        @DecimalMin(value = "0.0", inclusive = true) BigDecimal creditLimit,
        @Size(min = 3, max = 3) String currency,
        @Size(max = 150) String bankName,
        @Size(max = 50) String bankAccountNumber,
        @Size(max = 20) String ifscCode,
        @Size(max = 255) String website,
        @Size(max = 255) String addressLine1,
        @Size(max = 255) String addressLine2,
        @Size(max = 100) String city,
        @Size(max = 100) String state,
        @Size(max = 100) String country,
        @Size(max = 20) String postalCode,
        @Size(max = 30) String status,
        @DecimalMin(value = "0.0", inclusive = true) @DecimalMax(value = "5.0") BigDecimal rating,
        Boolean approved) {
}
