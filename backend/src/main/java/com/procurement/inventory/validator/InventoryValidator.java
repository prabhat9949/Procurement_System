package com.procurement.inventory.validator;

import com.procurement.common.exception.BadRequestException;
import com.procurement.inventory.dto.request.InventoryRequest;
import org.springframework.stereotype.Component;

@Component
public class InventoryValidator {

    public void validate(InventoryRequest request) {
        if (request.maximumStock().compareTo(request.minimumStock()) < 0) {
            throw new BadRequestException("Maximum stock must be greater than or equal to minimum stock");
        }
    }
}
