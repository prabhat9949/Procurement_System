package com.procurement.audit.service;

import com.procurement.audit.dto.request.AuditCaseRequest;
import com.procurement.audit.dto.request.AuditConclusionRequest;
import com.procurement.audit.dto.request.AuditFindingRequest;
import com.procurement.audit.dto.request.AuditFindingStatusRequest;
import com.procurement.audit.dto.response.AuditCaseResponse;
import com.procurement.audit.dto.response.AuditFindingResponse;
import com.procurement.audit.entity.AuditStatus;
import org.springframework.data.domain.Pageable;

public interface AuditService {

    AuditCaseResponse createCase(AuditCaseRequest request, String username);

    org.springframework.data.domain.Page<AuditCaseResponse> myCases(String username, AuditStatus status, Pageable pageable);

    org.springframework.data.domain.Page<AuditCaseResponse> search(String keyword, AuditStatus status, Pageable pageable);

    AuditCaseResponse getCase(Long id, String username);

    AuditFindingResponse addFinding(Long caseId, AuditFindingRequest request, String username);

    AuditFindingResponse updateFindingStatus(Long caseId, Long findingId, AuditFindingStatusRequest request, String username);

    org.springframework.data.domain.Page<AuditFindingResponse> findings(Long caseId, Pageable pageable);

    AuditCaseResponse conclude(Long caseId, AuditConclusionRequest request, String username);

    long pendingCount(String username);
}
