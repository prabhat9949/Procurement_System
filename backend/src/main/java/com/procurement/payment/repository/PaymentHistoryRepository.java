package com.procurement.payment.repository;

import com.procurement.payment.entity.PaymentHistory;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentHistoryRepository extends JpaRepository<PaymentHistory,Long> {
    List<PaymentHistory> findByPaymentIdOrderByPerformedAtDesc(Long id);
}
