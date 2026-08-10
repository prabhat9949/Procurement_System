package com.procurement.vendor.service;

import com.procurement.common.response.PageResponse;
import com.procurement.vendor.dto.request.VendorRequest;
import com.procurement.vendor.dto.response.VendorResponse;
import org.springframework.data.domain.Pageable;

public interface VendorService {

    VendorResponse create(VendorRequest request);

    PageResponse<VendorResponse> search(String keyword, String vendorType, String status,
                                        Boolean approved, Pageable pageable);

    VendorResponse getById(Long id);

    VendorResponse update(Long id, VendorRequest request);

    VendorResponse updateStatus(Long id, String status, Boolean approved);

    VendorResponse updateKyc(Long id, String decision, String reason);

    void delete(Long id);
}
