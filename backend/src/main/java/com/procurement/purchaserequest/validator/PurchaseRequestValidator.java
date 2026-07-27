package com.procurement.purchaserequest.validator;

import com.procurement.common.exception.BadRequestException;
import com.procurement.purchaserequest.dto.request.PurchaseRequestRequest;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class PurchaseRequestValidator {

    public void validate(PurchaseRequestRequest request) {
        if (!request.requiredDate().isAfter(LocalDate.now())) {
            throw new BadRequestException("Required date must be in the future");
        }
    }
}
