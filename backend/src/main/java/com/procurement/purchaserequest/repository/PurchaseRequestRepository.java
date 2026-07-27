package com.procurement.purchaserequest.repository;

import com.procurement.purchaserequest.entity.PurchaseRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PurchaseRequestRepository extends JpaRepository<PurchaseRequest, Long>,
        JpaSpecificationExecutor<PurchaseRequest> {

    Optional<PurchaseRequest> findByRequestNumber(String requestNumber);

    boolean existsByRequestNumber(String requestNumber);
}
