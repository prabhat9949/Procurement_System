package com.procurement.payment.repository;

import com.procurement.payment.entity.PaymentAllocation;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentAllocationRepository extends JpaRepository<PaymentAllocation,Long> {
    List<PaymentAllocation> findByPaymentId(Long id);
    List<PaymentAllocation> findByInvoiceId(Long invoiceId);
}
