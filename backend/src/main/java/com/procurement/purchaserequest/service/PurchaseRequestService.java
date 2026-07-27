package com.procurement.purchaserequest.service;

import com.procurement.common.response.PageResponse;
import com.procurement.purchaserequest.dto.request.PurchaseRequestRequest;
import com.procurement.purchaserequest.dto.response.PurchaseRequestResponse;
import com.procurement.purchaserequest.entity.ApprovalStatus;
import com.procurement.purchaserequest.entity.PurchaseRequestPriority;
import com.procurement.purchaserequest.entity.PurchaseRequestStatus;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface PurchaseRequestService {

    PurchaseRequestResponse create(PurchaseRequestRequest request);

    PageResponse<PurchaseRequestResponse> search(String keyword, Long requesterId,
                                                 Long departmentId, Long costCenterId,
                                                 PurchaseRequestPriority priority,
                                                 PurchaseRequestStatus status,
                                                 ApprovalStatus approvalStatus,
                                                 LocalDate requiredDateFrom,
                                                 LocalDate requiredDateTo,
                                                 LocalDate createdDateFrom,
                                                 LocalDate createdDateTo,
                                                 Pageable pageable);

    PurchaseRequestResponse getById(Long id);

    PurchaseRequestResponse update(Long id, PurchaseRequestRequest request);

    void delete(Long id);

    PurchaseRequestResponse submit(Long id);
}
