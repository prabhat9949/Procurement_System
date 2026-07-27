package com.procurement.payment.repository;

import com.procurement.payment.entity.PaymentAttachment;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentAttachmentRepository extends JpaRepository<PaymentAttachment,Long> {
    List<PaymentAttachment> findByPaymentId(Long id);
}
