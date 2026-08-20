package com.procurement.threewaymatch.dto.response;

import com.procurement.threewaymatch.entity.ThreeWayMatchResult;

import java.math.BigDecimal;

public record ThreeWayMatchLineResponse(
        Long id,
        Long threeWayMatchId,
        Long purchaseOrderLineId,
        Long goodsReceiptLineId,
        Long invoiceLineId,
        Long productId,
        String productName,
        BigDecimal orderedQuantity,
        BigDecimal receivedQuantity,
        BigDecimal invoicedQuantity,
        BigDecimal orderedPrice,
        BigDecimal invoicedPrice,
        Boolean quantityMatched,
        Boolean priceMatched,
        ThreeWayMatchResult result,
        String remarks
) {}
