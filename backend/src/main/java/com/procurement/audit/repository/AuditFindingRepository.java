package com.procurement.audit.repository;

import com.procurement.audit.entity.AuditFinding;
import com.procurement.audit.entity.FindingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditFindingRepository extends JpaRepository<AuditFinding, Long> {

    List<AuditFinding> findByAuditCaseId(Long auditCaseId);

    Page<AuditFinding> findByAuditCaseId(Long auditCaseId, Pageable pageable);

    long countByAuditCaseIdAndStatus(Long auditCaseId, FindingStatus status);
}
