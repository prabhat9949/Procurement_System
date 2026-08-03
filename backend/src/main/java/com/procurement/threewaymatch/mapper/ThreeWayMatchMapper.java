package com.procurement.threewaymatch.mapper;

import com.procurement.threewaymatch.dto.response.*;
import com.procurement.threewaymatch.entity.*;
import org.springframework.stereotype.Component;

@Component
public class ThreeWayMatchMapper {
    public ThreeWayMatchResponse toResponse(ThreeWayMatch e){return new ThreeWayMatchResponse(e.getId(),e.getMatchNumber(),e.getPurchaseOrder().getId(),e.getPurchaseOrder().getPoNumber(),e.getGoodsReceiptNote().getId(),e.getGoodsReceiptNote().getGrnNumber(),e.getInvoice().getId(),e.getInvoice().getInvoiceNumber(),e.getVendor().getId(),e.getVendor().getVendorName(),e.getMatchDate(),e.getPerformedBy(),e.getStatus(),e.getOverallResult(),e.getRemarks());}
    public ThreeWayMatchLineResponse toLineResponse(ThreeWayMatchLine e){return new ThreeWayMatchLineResponse(e.getId(),e.getThreeWayMatch().getId(),e.getPurchaseOrderLine().getId(),e.getGoodsReceiptLine().getId(),e.getInvoiceLine().getId(),e.getProduct().getId(),e.getProduct().getProductName(),e.getOrderedQuantity(),e.getReceivedQuantity(),e.getInvoicedQuantity(),e.getOrderedPrice(),e.getInvoicedPrice(),e.getQuantityMatched(),e.getPriceMatched(),e.getResult(),e.getRemarks());}
    public ThreeWayMatchHistoryResponse toHistoryResponse(ThreeWayMatchHistory e){return new ThreeWayMatchHistoryResponse(e.getId(),e.getThreeWayMatch().getId(),e.getAction(),e.getPerformedBy(),e.getOldStatus(),e.getNewStatus(),e.getRemarks(),e.getPerformedAt());}
}
