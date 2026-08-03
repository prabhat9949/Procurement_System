package com.procurement.vendor.validator;

import com.procurement.common.exception.BadRequestException;
import com.procurement.vendor.dto.request.VendorRequest;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class VendorValidator {

    private static final Set<String> ALLOWED_STATUSES = Set.of("ACTIVE", "INACTIVE", "BLOCKED");

    public void validate(VendorRequest request) {
        if (request.status() != null
                && !ALLOWED_STATUSES.contains(request.status().trim().toUpperCase())) {
            throw new BadRequestException("Status must be ACTIVE, INACTIVE, or BLOCKED");
        }
    }
}
