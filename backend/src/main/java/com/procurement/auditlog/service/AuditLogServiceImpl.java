package com.procurement.auditlog.service;

import com.procurement.auditlog.dto.request.AuditLogRequest;
import com.procurement.auditlog.dto.response.*;
import com.procurement.auditlog.entity.AuditLog;
import com.procurement.auditlog.exception.AuditLogException;
import com.procurement.auditlog.mapper.AuditLogMapper;
import com.procurement.auditlog.repository.AuditLogRepository;
import com.procurement.auditlog.specification.AuditLogSpecification;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.response.PageResponse;
import com.procurement.user.repository.UserRepository;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Base64;

@Service
public class AuditLogServiceImpl implements AuditLogService {
    private final AuditLogRepository repo;
    private final UserRepository userRepo;
    private final AuditLogMapper mapper;

    public AuditLogServiceImpl(AuditLogRepository repo, UserRepository userRepo, AuditLogMapper mapper) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.mapper = mapper;
    }

    private String currentUsername() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth == null ? null : auth.getName();
    }

    @Transactional
    public AuditLogResponse record(AuditLogRequest request) {
        var user = request.userId() != null
                ? userRepo.findById(request.userId()).orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.userId()))
                : (currentUsername() == null ? null : userRepo.findByUsername(currentUsername()).orElse(null));
        var log = AuditLog.builder()
                .moduleName(request.moduleName())
                .entityName(request.entityName())
                .entityId(request.entityId())
                .operation(request.operation())
                .referenceNumber(request.referenceNumber())
                .referenceType(request.referenceType())
                .user(user)
                .performedBy(currentUsername() == null ? "system" : currentUsername())
                .success(request.success() == null || request.success())
                .oldValue(request.oldValue())
                .newValue(request.newValue())
                .details(request.details())
                .build();
        return mapper.toResponse(repo.save(log));
    }

    @Transactional
    public AuditLogResponse record(String moduleName, String entityName, Long entityId, String operation, String referenceNumber, String referenceType, boolean success, String oldValue, String newValue, String details) {
        return record(new AuditLogRequest(moduleName, entityName, entityId, operation, referenceNumber, referenceType, null, success, oldValue, newValue, details));
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> search(String moduleName, String entityName, String operation, Long userId, LocalDate startDate, LocalDate endDate, Boolean success, String referenceNumber, Pageable pageable) {
        var page = repo.findAll(AuditLogSpecification.search(moduleName, entityName, operation, userId, startDate, endDate, success, referenceNumber), pageable).map(mapper::toResponse);
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Transactional(readOnly = true)
    public AuditLogResponse get(Long id) {
        return repo.findById(id).map(mapper::toResponse).orElseThrow(() -> new AuditLogException(id));
    }

    @Transactional(readOnly = true)
    public AuditLogExportResponse export(String moduleName, String entityName, String operation, Long userId, LocalDate startDate, LocalDate endDate, Boolean success, String referenceNumber) {
        var logs = repo.findAll(AuditLogSpecification.search(moduleName, entityName, operation, userId, startDate, endDate, success, referenceNumber), Sort.by(Sort.Direction.DESC, "performedAt"));
        var sb = new StringBuilder("moduleName,entityName,entityId,operation,referenceNumber,referenceType,userId,performedBy,success,oldValue,newValue,details,performedAt\n");
        for (var l : logs) {
            sb.append(csv(l.getModuleName())).append(',')
                    .append(csv(l.getEntityName())).append(',')
                    .append(csv(l.getEntityId())).append(',')
                    .append(csv(l.getOperation())).append(',')
                    .append(csv(l.getReferenceNumber())).append(',')
                    .append(csv(l.getReferenceType())).append(',')
                    .append(csv(l.getUser() == null ? null : l.getUser().getId())).append(',')
                    .append(csv(l.getPerformedBy())).append(',')
                    .append(csv(l.getSuccess())).append(',')
                    .append(csv(l.getOldValue())).append(',')
                    .append(csv(l.getNewValue())).append(',')
                    .append(csv(l.getDetails())).append(',')
                    .append(csv(l.getPerformedAt())).append('\n');
        }
        return new AuditLogExportResponse("audit-logs.csv", "text/csv", Base64.getEncoder().encodeToString(sb.toString().getBytes(StandardCharsets.UTF_8)));
    }

    private String csv(Object v) {
        return v == null ? "" : String.valueOf(v).replace(",", ";");
    }
}
