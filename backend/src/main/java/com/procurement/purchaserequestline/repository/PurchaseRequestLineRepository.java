package com.procurement.purchaserequestline.repository;

import com.procurement.purchaserequestline.entity.PurchaseRequestLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseRequestLineRepository extends JpaRepository<PurchaseRequestLine, Long>,
        JpaSpecificationExecutor<PurchaseRequestLine> {

    List<PurchaseRequestLine> findByPurchaseRequestId(Long purchaseRequestId);

    Optional<PurchaseRequestLine> findByPurchaseRequestIdAndProductId(Long purchaseRequestId,
                                                                        Long productId);
}
