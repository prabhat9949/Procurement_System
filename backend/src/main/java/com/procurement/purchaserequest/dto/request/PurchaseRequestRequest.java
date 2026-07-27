package com.procurement.purchaserequest.dto.request;

import com.procurement.purchaserequest.entity.PurchaseRequestPriority;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PurchaseRequestRequest(
        @NotNull Long requesterId,
        @NotNull Long departmentId,
        @NotNull Long costCenterId,
        @NotNull @Future LocalDate requiredDate,
        @NotNull PurchaseRequestPriority priority,
        @Size(max = 1000) String purpose,
        @Size(max = 1000) String remarks,
        @NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal estimatedAmount) {
}
