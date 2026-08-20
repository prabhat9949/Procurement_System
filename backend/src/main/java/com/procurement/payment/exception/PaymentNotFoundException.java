package com.procurement.payment.exception;

import com.procurement.common.exception.ResourceNotFoundException;

public class PaymentNotFoundException extends ResourceNotFoundException {
    public PaymentNotFoundException(Long id){super("Payment not found: "+id);}
}
