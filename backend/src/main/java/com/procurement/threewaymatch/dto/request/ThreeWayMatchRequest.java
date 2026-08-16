package com.procurement.threewaymatch.dto.request;

import jakarta.validation.constraints.NotNull;

public record ThreeWayMatchRequest(
        @NotNull Long purchaseOrderId,
        @NotNull Long goodsReceiptNoteId,
        @NotNull Long invoiceId,
        String remarks
) {}
