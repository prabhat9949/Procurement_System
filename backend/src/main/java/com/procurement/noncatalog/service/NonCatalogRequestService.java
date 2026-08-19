package com.procurement.noncatalog.service;

import com.procurement.common.response.PageResponse;
import com.procurement.noncatalog.dto.request.NonCatalogCreateRequest;
import com.procurement.noncatalog.dto.request.NonCatalogReviewRequest;
import com.procurement.noncatalog.dto.response.NonCatalogResponse;
import org.springframework.data.domain.Pageable;

public interface NonCatalogRequestService {

    NonCatalogResponse create(NonCatalogCreateRequest request);

    NonCatalogResponse getById(Long id);

    PageResponse<NonCatalogResponse> search(String status, Long departmentId, Long requesterId, Pageable pageable);

    PageResponse<NonCatalogResponse> getMyRequests(Pageable pageable);

    PageResponse<NonCatalogResponse> getPendingHrReview(Pageable pageable);

    PageResponse<NonCatalogResponse> getPendingProcurementReview(Pageable pageable);

    NonCatalogResponse reviewByHr(Long id, NonCatalogReviewRequest request);

    NonCatalogResponse processByProcurement(Long id, NonCatalogReviewRequest request);
}
