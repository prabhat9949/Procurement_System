package com.procurement.inventory.repository;

import com.procurement.inventory.entity.InventoryTransaction;
import com.procurement.inventory.entity.InventoryTransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long>, JpaSpecificationExecutor<InventoryTransaction> {

    Optional<InventoryTransaction> findByTransactionNumber(String transactionNumber);

    List<InventoryTransaction> findByProductIdOrderByCreatedAtDesc(Long productId);

    Page<InventoryTransaction> findByProductId(Long productId, Pageable pageable);

    List<InventoryTransaction> findByReferenceTypeAndReferenceIdOrderByCreatedAtAsc(String referenceType, Long referenceId);

    List<InventoryTransaction> findByReferenceNumberOrderByCreatedAtAsc(String referenceNumber);

    Page<InventoryTransaction> findByTransactionType(InventoryTransactionType transactionType, Pageable pageable);
}
