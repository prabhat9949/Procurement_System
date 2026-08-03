package com.procurement.purchaserequestline.service;

import com.procurement.common.response.PageResponse;
import com.procurement.purchaserequestline.dto.request.PurchaseRequestLineRequest;
import com.procurement.purchaserequestline.dto.response.PurchaseRequestLineResponse;
import org.springframework.data.domain.Pageable;

public interface PurchaseRequestLineService {

    PurchaseRequestLineResponse create(PurchaseRequestLineRequest request);

    PageResponse<PurchaseRequestLineResponse> search(String keyword, Long purchaseRequestId,
                                                     Long productId, Pageable pageable);

    PurchaseRequestLineResponse getById(Long id);

    PurchaseRequestLineResponse update(Long id, PurchaseRequestLineRequest request);

    void delete(Long id);
}
