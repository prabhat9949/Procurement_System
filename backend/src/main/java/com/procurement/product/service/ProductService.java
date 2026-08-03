package com.procurement.product.service;

import com.procurement.common.response.PageResponse;
import com.procurement.product.dto.request.ProductRequest;
import com.procurement.product.dto.response.ProductResponse;
import org.springframework.data.domain.Pageable;

public interface ProductService {

    ProductResponse create(ProductRequest request);

    PageResponse<ProductResponse> search(String keyword, Long categoryId, Long vendorId,
                                         Boolean active, Pageable pageable);

    ProductResponse getById(Long id);

    ProductResponse update(Long id, ProductRequest request);

    void delete(Long id);
}
