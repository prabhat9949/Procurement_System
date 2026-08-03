package com.procurement.warehouse.validator;

import com.procurement.common.exception.BadRequestException;
import com.procurement.warehouse.dto.request.WarehouseRequest;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class WarehouseValidator {

    private static final Set<String> ALLOWED_STATUSES = Set.of("ACTIVE", "INACTIVE");

    public void validate(WarehouseRequest request) {
        if (request.status() != null
                && !ALLOWED_STATUSES.contains(request.status().trim().toUpperCase())) {
            throw new BadRequestException("Status must be ACTIVE or INACTIVE");
        }
    }
}
