package com.procurement.product.validator;

import com.procurement.common.exception.BadRequestException;
import com.procurement.product.dto.request.ProductRequest;
import org.springframework.stereotype.Component;

@Component
public class ProductValidator {

    public void validate(ProductRequest request) {
        if (request.maximumStock() < request.minimumStock()) {
            throw new BadRequestException("Maximum stock must be greater than or equal to minimum stock");
        }
    }
}
