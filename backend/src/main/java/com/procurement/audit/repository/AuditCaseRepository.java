package com.procurement.audit.repository;

import com.procurement.audit.entity.AuditCase;
import com.procurement.audit.entity.AuditStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface AuditCaseRepository extends JpaRepository<AuditCase, Long>, JpaSpecificationExecutor<AuditCase> {

    Page<AuditCase> findByAssignedToId(Long assignedToId, Pageable pageable);

    Page<AuditCase> findByAssignedToIdAndStatus(Long assignedToId, AuditStatus status, Pageable pageable);

    List<AuditCase> findByPurchaseRequestId(Long purchaseRequestId);

    Optional<AuditCase> findByCaseNumber(String caseNumber);

    long countByAssignedToIdAndStatus(Long assignedToId, AuditStatus status);
}
