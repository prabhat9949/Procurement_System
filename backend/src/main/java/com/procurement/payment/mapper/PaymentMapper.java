package com.procurement.payment.mapper;

import com.procurement.payment.dto.response.*;
import com.procurement.payment.entity.*;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {
    public PaymentResponse toResponse(Payment e){return new PaymentResponse(e.getId(),e.getPaymentNumber(),e.getVendor().getId(),e.getVendor().getVendorName(),e.getInvoice()==null?null:e.getInvoice().getId(),e.getInvoice()==null?null:e.getInvoice().getInvoiceNumber(),e.getThreeWayMatch()==null?null:e.getThreeWayMatch().getId(),e.getThreeWayMatch()==null?null:e.getThreeWayMatch().getMatchNumber(),e.getPurchaseOrder()==null?null:e.getPurchaseOrder().getId(),e.getPurchaseOrder()==null?null:e.getPurchaseOrder().getPoNumber(),e.getPaymentDate(),e.getScheduledDate(),e.getPaymentMethod(),e.getPaymentReference(),e.getBankReference(),e.getCurrency(),e.getGrossAmount(),e.getDiscountAmount(),e.getTaxDeduction(),e.getOtherDeduction(),e.getNetAmount(),e.getPaidAmount(),e.getBalanceAmount(),e.getStatus(),e.getRemarks());}
    public PaymentAllocationResponse toAllocationResponse(PaymentAllocation e){return new PaymentAllocationResponse(e.getId(),e.getPayment().getId(),e.getInvoice().getId(),e.getAllocatedAmount(),e.getRemainingAmount(),e.getRemarks());}
    public PaymentAttachmentResponse toAttachmentResponse(PaymentAttachment e){return new PaymentAttachmentResponse(e.getId(),e.getPayment().getId(),e.getFileName(),e.getFilePath(),e.getFileType(),e.getUploadedAt());}
    public PaymentHistoryResponse toHistoryResponse(PaymentHistory e){return new PaymentHistoryResponse(e.getId(),e.getPayment().getId(),e.getAction(),e.getPerformedBy(),e.getOldStatus(),e.getNewStatus(),e.getRemarks(),e.getPerformedAt());}
}
