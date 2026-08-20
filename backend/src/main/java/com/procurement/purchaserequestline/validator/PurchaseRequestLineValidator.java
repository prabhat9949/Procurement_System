package com.procurement.purchaserequestline.validator;

import com.procurement.purchaserequestline.dto.request.PurchaseRequestLineRequest;
import org.springframework.stereotype.Component;

@Component
public class PurchaseRequestLineValidator {

    public void validate(PurchaseRequestLineRequest request) {
        // Bean Validation handles field-level quantity and price constraints.
    }
}
