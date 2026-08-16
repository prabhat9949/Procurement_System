package com.procurement.purchaserequestline.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PurchaseRequestLineResponse(
        Long id,
        Long purchaseRequestId,
        String requestNumber,
        Long productId,
        String productCode,
        String productName,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal estimatedAmount,
        String remarks,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
