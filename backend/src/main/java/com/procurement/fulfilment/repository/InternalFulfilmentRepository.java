package com.procurement.fulfilment.repository;

import com.procurement.fulfilment.entity.InternalFulfilment;
import com.procurement.fulfilment.entity.InternalFulfilmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternalFulfilmentRepository extends JpaRepository<InternalFulfilment, Long>, JpaSpecificationExecutor<InternalFulfilment> {

    Optional<InternalFulfilment> findByFulfilmentNumber(String fulfilmentNumber);

    List<InternalFulfilment> findByPurchaseRequestIdOrderByCreatedAtAsc(Long purchaseRequestId);

    Page<InternalFulfilment> findBySpecializedTeam(String specializedTeam, Pageable pageable);

    Page<InternalFulfilment> findBySpecializedTeamAndStatus(String specializedTeam, InternalFulfilmentStatus status, Pageable pageable);

    Page<InternalFulfilment> findByAssignedEmployeeId(Long assignedEmployeeId, Pageable pageable);

    Page<InternalFulfilment> findByAssignedEmployeeIdAndStatus(Long assignedEmployeeId, InternalFulfilmentStatus status, Pageable pageable);

    Page<InternalFulfilment> findByRequesterId(Long requesterId, Pageable pageable);

    List<InternalFulfilment> findByStatus(InternalFulfilmentStatus status);

    long countBySpecializedTeamAndStatus(String specializedTeam, InternalFulfilmentStatus status);
}
