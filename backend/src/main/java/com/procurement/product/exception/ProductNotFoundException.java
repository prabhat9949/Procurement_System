package com.procurement.product.exception;

import com.procurement.common.exception.ResourceNotFoundException;

public class ProductNotFoundException extends ResourceNotFoundException {

    public ProductNotFoundException(Long id) {
        super("Product not found: " + id);
    }
}
