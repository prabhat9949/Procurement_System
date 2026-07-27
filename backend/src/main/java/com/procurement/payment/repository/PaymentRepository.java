package com.procurement.payment.repository;

import com.procurement.payment.entity.Payment;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment,Long>, JpaSpecificationExecutor<Payment> {
    Optional<Payment> findByPaymentNumber(String paymentNumber);
    boolean existsByPaymentNumber(String paymentNumber);
}
