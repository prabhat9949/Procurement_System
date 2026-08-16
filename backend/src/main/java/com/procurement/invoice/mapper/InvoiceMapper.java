package com.procurement.invoice.mapper;

import com.procurement.invoice.dto.response.*;
import com.procurement.invoice.entity.*;
import org.springframework.stereotype.Component;

@Component
public class InvoiceMapper {
    public InvoiceResponse toResponse(Invoice e){return new InvoiceResponse(e.getId(),e.getInvoiceNumber(),e.getVendorInvoiceNumber(),e.getPurchaseOrder().getId(),e.getGoodsReceiptNote().getId(),e.getVendor().getId(),e.getVendor().getVendorName(),e.getInvoiceDate(),e.getDueDate(),e.getCurrency(),e.getSubtotal(),e.getGrandTotal(),e.getStatus());}
    public InvoiceLineResponse toLineResponse(InvoiceLine e){return new InvoiceLineResponse(e.getId(),e.getInvoice().getId(),e.getPurchaseOrderLine().getId(),e.getGoodsReceiptLine().getId(),e.getProduct().getId(),e.getProduct().getProductName(),e.getQuantity(),e.getUnitPrice(),e.getDiscountPercentage(),e.getTaxPercentage(),e.getLineAmount(),e.getRemarks());}
    public InvoiceAttachmentResponse toAttachmentResponse(InvoiceAttachment e){return new InvoiceAttachmentResponse(e.getId(),e.getInvoice().getId(),e.getFileName(),e.getFilePath(),e.getFileType(),e.getUploadedAt());}
    public InvoiceHistoryResponse toHistoryResponse(InvoiceHistory e){return new InvoiceHistoryResponse(e.getId(),e.getInvoice().getId(),e.getAction(),e.getOldStatus(),e.getNewStatus(),e.getRemarks(),e.getPerformedAt());}
}
