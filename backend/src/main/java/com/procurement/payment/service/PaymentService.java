package com.procurement.payment.service;

import com.procurement.common.response.PageResponse;
import com.procurement.payment.dto.request.*;
import com.procurement.payment.dto.response.*;
import com.procurement.payment.entity.PaymentStatus;
import org.springframework.data.domain.Pageable;

public interface PaymentService {
    PaymentResponse create(PaymentRequest request);
    PageResponse<PaymentResponse> search(String keyword, Long vendorId, PaymentStatus status, String paymentMethod, Pageable pageable);
    PaymentResponse get(Long id);
    PaymentResponse update(Long id, PaymentRequest request);
    void delete(Long id);
    PaymentResponse approve(Long id);
    PaymentResponse process(Long id);
    PaymentResponse complete(Long id);
    PaymentResponse fail(Long id);
    PaymentResponse cancel(Long id);
    PaymentAllocationResponse addAllocation(Long id, PaymentAllocationRequest request);
    PageResponse<PaymentAllocationResponse> allocations(Long id, Pageable pageable);
    PaymentAttachmentResponse addAttachment(Long id, String fileName, String filePath, String fileType);
    PageResponse<PaymentAttachmentResponse> attachments(Long id, Pageable pageable);
    void deleteAttachment(Long id, Long attachmentId);
    PageResponse<PaymentHistoryResponse> history(Long id, Pageable pageable);
}
