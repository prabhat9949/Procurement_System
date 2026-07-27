package com.procurement.threewaymatch.dto.response;

import com.procurement.threewaymatch.entity.*;

import java.time.LocalDate;

public record ThreeWayMatchResponse(
        Long id,
        String matchNumber,
        Long purchaseOrderId,
        String purchaseOrderNumber,
        Long goodsReceiptNoteId,
        String goodsReceiptNoteNumber,
        Long invoiceId,
        String invoiceNumber,
        Long vendorId,
        String vendorName,
        LocalDate matchDate,
        String performedBy,
        ThreeWayMatchStatus status,
        ThreeWayMatchResult overallResult,
        String remarks
) {}
