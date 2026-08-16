package com.procurement.audit.service;

import com.procurement.audit.dto.request.AuditCaseRequest;
import com.procurement.audit.dto.request.AuditConclusionRequest;
import com.procurement.audit.dto.request.AuditFindingRequest;
import com.procurement.audit.dto.request.AuditFindingStatusRequest;
import com.procurement.audit.dto.response.AuditCaseResponse;
import com.procurement.audit.dto.response.AuditFindingResponse;
import com.procurement.audit.entity.*;
import com.procurement.audit.repository.AuditCaseRepository;
import com.procurement.audit.repository.AuditFindingRepository;
import com.procurement.auditlog.service.AuditLogService;
import com.procurement.common.exception.ConflictException;
import com.procurement.common.exception.ForbiddenException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.goodsreceipt.repository.GoodsReceiptNoteRepository;
import com.procurement.invoice.repository.InvoiceRepository;
import com.procurement.payment.repository.PaymentRepository;
import com.procurement.purchaseorder.entity.PurchaseOrder;
import com.procurement.purchaseorder.repository.PurchaseOrderRepository;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.purchaserequest.repository.PurchaseRequestRepository;
import com.procurement.purchaserequestline.entity.PurchaseRequestLine;
import com.procurement.purchaserequestline.repository.PurchaseRequestLineRepository;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.Optional;

@Service
public class AuditServiceImpl implements AuditService {

    private final AuditCaseRepository caseRepo;
    private final AuditFindingRepository findingRepo;
    private final PurchaseRequestRepository prRepo;
    private final PurchaseRequestLineRepository lineRepo;
    private final PurchaseOrderRepository poRepo;
    private final GoodsReceiptNoteRepository grnRepo;
    private final InvoiceRepository invoiceRepo;
    private final PaymentRepository paymentRepo;
    private final UserRepository userRepo;
    private final AuditLogService auditLogService;

    public AuditServiceImpl(AuditCaseRepository caseRepo,
                            AuditFindingRepository findingRepo,
                            PurchaseRequestRepository prRepo,
                            PurchaseRequestLineRepository lineRepo,
                            PurchaseOrderRepository poRepo,
                            GoodsReceiptNoteRepository grnRepo,
                            InvoiceRepository invoiceRepo,
                            PaymentRepository paymentRepo,
                            UserRepository userRepo,
                            AuditLogService auditLogService) {
        this.caseRepo = caseRepo;
        this.findingRepo = findingRepo;
        this.prRepo = prRepo;
        this.lineRepo = lineRepo;
        this.poRepo = poRepo;
        this.grnRepo = grnRepo;
        this.invoiceRepo = invoiceRepo;
        this.paymentRepo = paymentRepo;
        this.userRepo = userRepo;
        this.auditLogService = auditLogService;
    }

    private String user() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @Override
    @Transactional
    public AuditCaseResponse createCase(AuditCaseRequest request, String username) {
        PurchaseRequest pr = prRepo.findById(request.purchaseRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Purchase request not found: " + request.purchaseRequestId()));
        Optional<AuditCase> existing = caseRepo.findByPurchaseRequestId(pr.getId()).stream().findFirst();
        if (existing.isPresent()) {
            throw new ConflictException("An audit case already exists for " + pr.getRequestNumber());
        }
        User me = userRepo.findByUsername(username).orElse(null);
        AuditRiskLevel risk = riskLevel(pr.getEstimatedAmount());
        AuditCase c = AuditCase.builder()
                .caseNumber("AUD-" + Year.now().getValue() + "-" + String.format("%06d", caseRepo.count() + 1))
                .purchaseRequest(pr)
                .assignedTo(me)
                .assignedBy(me)
                .status(AuditStatus.PENDING)
                .riskLevel(risk)
                .assignedDate(LocalDate.now())
                .dueDate(request.dueDate() != null ? request.dueDate() : LocalDate.now().plusDays(7))
                .createdBy(username)
                .build();
        c = caseRepo.save(c);
        auditLogService.record("AUDIT", "AuditCase", c.getId(), "AUDIT_CASE_CREATED",
                c.getCaseNumber(), "AUDIT_CASE", true, null, c.getStatus().name(),
                "Audit case created for " + pr.getRequestNumber() + " by " + username);
        return toResponse(c);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditCaseResponse> myCases(String username, AuditStatus status, Pageable pageable) {
        User me = userRepo.findByUsername(username).orElse(null);
        Page<AuditCase> page = me == null ? Page.empty() :
                (status == null ? caseRepo.findByAssignedToId(me.getId(), pageable)
                        : caseRepo.findByAssignedToIdAndStatus(me.getId(), status, pageable));
        return page.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditCaseResponse> search(String keyword, AuditStatus status, Pageable pageable) {
        Page<AuditCase> page = caseRepo.findAll((root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            if (status != null) predicates.add(cb.equal(root.get("status"), status));
            if (keyword != null && !keyword.isBlank()) {
                String like = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("caseNumber")), like),
                        cb.like(cb.lower(root.get("purchaseRequest").get("requestNumber")), like)
                ));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        }, pageable);
        return page.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AuditCaseResponse getCase(Long id, String username) {
        AuditCase c = caseRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit case not found: " + id));
        return toResponse(c);
    }

    @Override
    @Transactional
    public AuditFindingResponse addFinding(Long caseId, AuditFindingRequest request, String username) {
        AuditCase c = caseRepo.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Audit case not found: " + caseId));
        if (c.getStatus() == AuditStatus.CLOSED) {
            throw new ConflictException("Audit case is closed — findings can no longer be added");
        }
        AuditFinding f = AuditFinding.builder()
                .auditCase(c)
                .findingType(request.findingType())
                .severity(request.severity())
                .status(FindingStatus.OPEN)
                .description(request.description())
                .relatedRecord(request.relatedRecord())
                .recommendation(request.recommendation())
                .evidenceRef(request.evidenceRef())
                .createdBy(username)
                .build();
        f = findingRepo.save(f);
        c.setStatus(AuditStatus.UNDER_REVIEW);
        caseRepo.save(c);
        auditLogService.record("AUDIT", "AuditFinding", f.getId(), "AUDIT_FINDING_CREATED",
                c.getCaseNumber(), "AUDIT_CASE", true, null, f.getStatus().name(),
                request.findingType() + " (" + request.severity() + ") by " + username);
        return toFinding(f);
    }

    @Override
    @Transactional
    public AuditFindingResponse updateFindingStatus(Long caseId, Long findingId, AuditFindingStatusRequest request, String username) {
        AuditFinding f = findingRepo.findById(findingId)
                .orElseThrow(() -> new ResourceNotFoundException("Finding not found: " + findingId));
        if (!f.getAuditCase().getId().equals(caseId)) {
            throw new ForbiddenException("Finding does not belong to this audit case");
        }
        FindingStatus old = f.getStatus();
        f.setStatus(request.status());
        if (request.status() == FindingStatus.RESOLVED || request.status() == FindingStatus.VERIFIED
                || request.status() == FindingStatus.CLOSED) {
            f.setResolvedAt(java.time.LocalDateTime.now());
        }
        findingRepo.save(f);
        auditLogService.record("AUDIT", "AuditFinding", f.getId(), "AUDIT_FINDING_STATUS_CHANGED",
                f.getAuditCase().getCaseNumber(), "AUDIT_CASE", true, old.name(), f.getStatus().name(),
                "Finding status updated by " + username);
        return toFinding(f);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditFindingResponse> findings(Long caseId, Pageable pageable) {
        return findingRepo.findByAuditCaseId(caseId, pageable).map(this::toFinding);
    }

    @Override
    @Transactional
    public AuditCaseResponse conclude(Long caseId, AuditConclusionRequest request, String username) {
        AuditCase c = caseRepo.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Audit case not found: " + caseId));
        long open = findingRepo.countByAuditCaseIdAndStatus(caseId, FindingStatus.OPEN)
                + findingRepo.countByAuditCaseIdAndStatus(caseId, FindingStatus.ACTION_REQUIRED);
        if (open > 0 && !"NON_COMPLIANT".equalsIgnoreCase(request.conclusion())) {
            throw new ConflictException("Open findings remain (" + open + ") — resolve or conclude as NON_COMPLIANT");
        }
        AuditStatus newStatus = switch (request.conclusion().toUpperCase()) {
            case "COMPLIANT" -> AuditStatus.COMPLIANT;
            case "PARTIALLY_COMPLIANT" -> AuditStatus.PARTIALLY_COMPLIANT;
            case "NON_COMPLIANT" -> AuditStatus.NON_COMPLIANT;
            case "REQUIRES_ACTION" -> AuditStatus.REQUIRES_CLARIFICATION;
            default -> throw new com.procurement.common.exception.BadRequestException("Invalid conclusion");
        };
        c.setStatus(newStatus);
        c.setAuditSummary(request.auditSummary());
        c.setConclusion(request.conclusion());
        c.setRecommendation(request.recommendation());
        c.setConcludedBy(username);
        c.setConcludedAt(java.time.LocalDateTime.now());
        caseRepo.save(c);
        auditLogService.record("AUDIT", "AuditCase", c.getId(), "AUDIT_CONCLUDED",
                c.getCaseNumber(), "AUDIT_CASE", true, null, c.getConclusion(),
                "Audit concluded as " + c.getConclusion() + " by " + username);
        return toResponse(c);
    }

    @Override
    @Transactional(readOnly = true)
    public long pendingCount(String username) {
        User me = userRepo.findByUsername(username).orElse(null);
        if (me == null) return 0;
        return caseRepo.countByAssignedToIdAndStatus(me.getId(), AuditStatus.PENDING)
                + caseRepo.countByAssignedToIdAndStatus(me.getId(), AuditStatus.UNDER_REVIEW)
                + caseRepo.countByAssignedToIdAndStatus(me.getId(), AuditStatus.REQUIRES_CLARIFICATION);
    }

    private AuditRiskLevel riskLevel(BigDecimal amount) {
        if (amount == null) return AuditRiskLevel.LOW;
        if (amount.compareTo(new BigDecimal("10000000")) >= 0) return AuditRiskLevel.CRITICAL;
        if (amount.compareTo(new BigDecimal("5000000")) >= 0) return AuditRiskLevel.HIGH;
        if (amount.compareTo(new BigDecimal("1000000")) >= 0) return AuditRiskLevel.MEDIUM;
        return AuditRiskLevel.LOW;
    }

    private AuditCaseResponse toResponse(AuditCase c) {
        PurchaseRequest pr = c.getPurchaseRequest();
        String requester = pr.getRequester() == null ? "" : pr.getRequester().getFirstName() + " " + pr.getRequester().getLastName();
        String empId = pr.getRequester() == null ? "" : pr.getRequester().getEmployeeCode();
        String dept = pr.getDepartment() == null ? "" : pr.getDepartment().getDepartmentName();
        String category = "";
        List<PurchaseRequestLine> lines = lineRepo.findByPurchaseRequestId(pr.getId());
        if (!lines.isEmpty() && lines.get(0).getProduct() != null
                && lines.get(0).getProduct().getCategory() != null) {
            category = lines.get(0).getProduct().getCategory().getCategoryName();
        }
        Long poId = null; String poNumber = null;
        Optional<PurchaseOrder> po = poRepo.findAll((r, q, cb) ->
                cb.equal(r.get("purchaseRequest").get("id"), pr.getId()),
                org.springframework.data.domain.PageRequest.of(0, 1)).getContent().stream().findFirst();
        if (po.isPresent()) { poId = po.get().getId(); poNumber = po.get().getPoNumber(); }
        Long grnId = null; String grnNumber = null;
        if (poId != null) {
            var grns = grnRepo.findByPurchaseOrderId(poId);
            if (!grns.isEmpty()) { grnId = grns.get(0).getId(); grnNumber = grns.get(0).getGrnNumber(); }
        }
        Long invoiceId = null; String invoiceNumber = null;
        if (poId != null) {
            var invs = invoiceRepo.findByPurchaseOrderId(poId);
            if (!invs.isEmpty()) { invoiceId = invs.get(0).getId(); invoiceNumber = invs.get(0).getInvoiceNumber(); }
        }
        Long paymentId = null; String paymentNumber = null;
        if (poId != null) {
            var pays = paymentRepo.findByPurchaseOrderId(poId);
            if (!pays.isEmpty()) { paymentId = pays.get(0).getId(); paymentNumber = pays.get(0).getPaymentNumber(); }
        }
        return new AuditCaseResponse(
                c.getId(), c.getCaseNumber(), pr.getId(), pr.getRequestNumber(), requester, empId, dept, category,
                pr.getEstimatedAmount(), pr.getPriority() == null ? null : pr.getPriority().name(),
                poId, poNumber, grnId, grnNumber, invoiceId, invoiceNumber, paymentId, paymentNumber,
                c.getStatus(), c.getRiskLevel(),
                c.getAssignedTo() == null ? null : c.getAssignedTo().getUsername(),
                c.getAssignedBy() == null ? null : c.getAssignedBy().getUsername(),
                c.getAssignedDate(), c.getDueDate(), c.getAuditSummary(), c.getConclusion(),
                c.getRecommendation(), c.getConcludedBy(), c.getConcludedAt(), c.getCreatedAt());
    }

    private AuditFindingResponse toFinding(AuditFinding f) {
        return new AuditFindingResponse(
                f.getId(), f.getAuditCase().getId(), f.getFindingType(), f.getSeverity(), f.getStatus(),
                f.getDescription(), f.getRelatedRecord(), f.getRecommendation(), f.getEvidenceRef(),
                f.getCreatedBy(), f.getCreatedAt(), f.getResolvedAt());
    }
}
