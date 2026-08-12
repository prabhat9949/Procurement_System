package com.procurement.demo.service;

import com.procurement.approvalhistory.entity.ApprovalAction;
import com.procurement.approvalhistory.entity.ApprovalHistory;
import com.procurement.approvalhistory.repository.ApprovalHistoryRepository;
import com.procurement.approvalrule.entity.ApprovalRule;
import com.procurement.approvalrule.repository.ApprovalRuleRepository;
import com.procurement.approvalstage.entity.ApprovalStage;
import com.procurement.approvalstage.repository.ApprovalStageRepository;
import com.procurement.approvaltask.entity.ApprovalTask;
import com.procurement.approvaltask.entity.ApprovalTaskStatus;
import com.procurement.approvaltask.repository.ApprovalTaskRepository;
import com.procurement.costcenter.entity.CostCenter;
import com.procurement.costcenter.repository.CostCenterRepository;
import com.procurement.department.entity.Department;
import com.procurement.department.repository.DepartmentRepository;
import com.procurement.employee.entity.Employee;
import com.procurement.employee.repository.EmployeeRepository;
import com.procurement.product.entity.Product;
import com.procurement.product.repository.ProductRepository;
import com.procurement.purchaseorder.entity.PurchaseOrder;
import com.procurement.purchaseorder.entity.PurchaseOrderLine;
import com.procurement.purchaseorder.entity.PurchaseOrderStatus;
import com.procurement.purchaseorder.repository.PurchaseOrderLineRepository;
import com.procurement.purchaseorder.repository.PurchaseOrderRepository;
import com.procurement.purchaserequest.entity.ApprovalStatus;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.purchaserequest.entity.PurchaseRequestPriority;
import com.procurement.purchaserequest.entity.PurchaseRequestStatus;
import com.procurement.purchaserequest.repository.PurchaseRequestRepository;
import com.procurement.purchaserequestline.entity.PurchaseRequestLine;
import com.procurement.purchaserequestline.repository.PurchaseRequestLineRepository;
import com.procurement.quotationcomparison.entity.ComparisonMethod;
import com.procurement.quotationcomparison.entity.ComparisonStatus;
import com.procurement.quotationcomparison.entity.QuotationComparison;
import com.procurement.quotationcomparison.entity.QuotationComparisonLine;
import com.procurement.quotationcomparison.repository.QuotationComparisonLineRepository;
import com.procurement.quotationcomparison.repository.QuotationComparisonRepository;
import com.procurement.rfq.entity.Rfq;
import com.procurement.rfq.entity.RfqLine;
import com.procurement.rfq.entity.RfqStatus;
import com.procurement.rfq.entity.RfqVendor;
import com.procurement.rfq.entity.RfqVendorStatus;
import com.procurement.rfq.repository.RfqLineRepository;
import com.procurement.rfq.repository.RfqRepository;
import com.procurement.rfq.repository.RfqVendorRepository;
import com.procurement.role.entity.Role;
import com.procurement.role.repository.RoleRepository;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import com.procurement.vendor.entity.Vendor;
import com.procurement.vendor.repository.VendorRepository;
import com.procurement.vendorquotation.entity.VendorQuotation;
import com.procurement.vendorquotation.entity.VendorQuotationLine;
import com.procurement.vendorquotation.entity.VendorQuotationStatus;
import com.procurement.vendorquotation.repository.VendorQuotationLineRepository;
import com.procurement.vendorquotation.repository.VendorQuotationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Creates a complete, database-backed demonstration workflow so the mentor
 * briefing can walk through the entire lifecycle: employee PR -> manager
 * approval -> RFQ -> 3 vendor quotations -> comparison -> vendor selection ->
 * PO. Every record is real (inserted into MySQL) and tagged with the demo
 * scenario marker so {@link #resetDemoScenario()} can remove ONLY the demo
 * records without touching real data.
 *
 * <p>Idempotent: running twice does not duplicate — the PR number
 * PR-DEMO-2026-001 is used as the business key.</p>
 */
@Service
public class DemoScenarioService {

    public static final String DEMO_SCENARIO_ID = "DEMO-2026-001";
    public static final String DEMO_PR_NUMBER = "PR-DEMO-2026-001";
    public static final String DEMO_MARKER = "[DEMO-2026-001]";

    private static final Logger log = LoggerFactory.getLogger(DemoScenarioService.class);

    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final ApprovalRuleRepository ruleRepository;
    private final ApprovalStageRepository stageRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PurchaseRequestRepository requestRepository;
    private final PurchaseRequestLineRepository requestLineRepository;
    private final ApprovalTaskRepository taskRepository;
    private final ApprovalHistoryRepository historyRepository;
    private final CostCenterRepository costCenterRepository;
    private final ProductRepository productRepository;
    private final VendorRepository vendorRepository;
    private final RfqRepository rfqRepository;
    private final RfqLineRepository rfqLineRepository;
    private final RfqVendorRepository rfqVendorRepository;
    private final VendorQuotationRepository quotationRepository;
    private final VendorQuotationLineRepository quotationLineRepository;
    private final QuotationComparisonRepository comparisonRepository;
    private final QuotationComparisonLineRepository comparisonLineRepository;
    private final PurchaseOrderRepository poRepository;
    private final PurchaseOrderLineRepository poLineRepository;

    public DemoScenarioService(DepartmentRepository departmentRepository,
                               RoleRepository roleRepository,
                               ApprovalRuleRepository ruleRepository,
                               ApprovalStageRepository stageRepository,
                               EmployeeRepository employeeRepository,
                               UserRepository userRepository,
                               PurchaseRequestRepository requestRepository,
                               PurchaseRequestLineRepository requestLineRepository,
                               ApprovalTaskRepository taskRepository,
                               ApprovalHistoryRepository historyRepository,
                               CostCenterRepository costCenterRepository,
                               ProductRepository productRepository,
                               VendorRepository vendorRepository,
                               RfqRepository rfqRepository,
                               RfqLineRepository rfqLineRepository,
                               RfqVendorRepository rfqVendorRepository,
                               VendorQuotationRepository quotationRepository,
                               VendorQuotationLineRepository quotationLineRepository,
                               QuotationComparisonRepository comparisonRepository,
                               QuotationComparisonLineRepository comparisonLineRepository,
                               PurchaseOrderRepository poRepository,
                               PurchaseOrderLineRepository poLineRepository) {
        this.departmentRepository = departmentRepository;
        this.roleRepository = roleRepository;
        this.ruleRepository = ruleRepository;
        this.stageRepository = stageRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.requestRepository = requestRepository;
        this.requestLineRepository = requestLineRepository;
        this.taskRepository = taskRepository;
        this.historyRepository = historyRepository;
        this.costCenterRepository = costCenterRepository;
        this.productRepository = productRepository;
        this.vendorRepository = vendorRepository;
        this.rfqRepository = rfqRepository;
        this.rfqLineRepository = rfqLineRepository;
        this.rfqVendorRepository = rfqVendorRepository;
        this.quotationRepository = quotationRepository;
        this.quotationLineRepository = quotationLineRepository;
        this.comparisonRepository = comparisonRepository;
        this.comparisonLineRepository = comparisonLineRepository;
        this.poRepository = poRepository;
        this.poLineRepository = poLineRepository;
    }

    /**
     * Creates (or returns) the complete demo scenario. Returns a summary map
     * with every stage and its created reference numbers.
     */
    @Transactional
    public Map<String, Object> createCompleteDemoScenario() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("demoScenarioId", DEMO_SCENARIO_ID);

        Department it = departmentRepository.findByDepartmentCode("IT").orElse(null);
        Role employeeRole = roleRepository.findByRoleCode("EMPLOYEE").orElse(null);
        Role managerRole = roleRepository.findByRoleCode("DEPARTMENT_MANAGER").orElse(null);
        Role seniorRole = roleRepository.findByRoleCode("SENIOR_MANAGER").orElse(null);
        Role headRole = roleRepository.findByRoleCode("HEAD").orElse(null);
        if (it == null || employeeRole == null || managerRole == null) {
            result.put("status", "ERROR");
            result.put("message", "Required master data (IT department / roles) is missing.");
            return result;
        }

        // ----- 1. Employee (Rahul Kumar, linked to employee@123) -----
        Employee rahul = userRepository.findByUsername("employee@123")
                .map(User::getEmployee).orElse(null);
        if (rahul == null) {
            result.put("status", "ERROR");
            result.put("message", "employee@123 is not linked to an employee record.");
            return result;
        }
        result.put("employee", rahul.getFirstName() + " " + rahul.getLastName());
        result.put("employeeCode", rahul.getEmployeeCode());

        // ----- 2. Demo Purchase Request (5 workstations, ₹4,00,000) -----
        PurchaseRequest pr = requestRepository.findByRequestNumber(DEMO_PR_NUMBER).orElse(null);
        CostCenter itCC = rahul.getCostCenter();
        Product workstation = productRepository.findByProductCode("PRD-LAP-01")
                .or(() -> productRepository.findByProductCode("PRD-DESK-01"))
                .orElse(null);

        if (pr == null) {
            pr = PurchaseRequest.builder()
                    .requestNumber(DEMO_PR_NUMBER)
                    .requestDate(LocalDate.now())
                    .requiredDate(LocalDate.now().plusDays(21))
                    .requester(rahul)
                    .department(it)
                    .costCenter(itCC)
                    .priority(PurchaseRequestPriority.HIGH)
                    .status(PurchaseRequestStatus.UNDER_REVIEW)
                    .approvalStatus(ApprovalStatus.PENDING)
                    .purpose("IT Development Workstation — demo scenario " + DEMO_MARKER)
                    .remarks("Mentor briefing demo. " + DEMO_MARKER)
                    .estimatedAmount(new BigDecimal("400000"))
                    .createdBy("demo:DEMO-2026-001")
                    .updatedBy("demo:DEMO-2026-001")
                    .build();
            pr = requestRepository.save(pr);
            log.info("Demo scenario: created {}", pr.getRequestNumber());
        }
        result.put("purchaseRequest", pr.getRequestNumber());
        result.put("prStatus", pr.getStatus().name());

        // ----- 3. Demo PR lines (5 units @ ₹80,000) -----
        if (workstation != null && requestLineRepository.findByPurchaseRequestId(pr.getId()).isEmpty()) {
            requestLineRepository.save(PurchaseRequestLine.builder()
                    .purchaseRequest(pr).product(workstation)
                    .quantity(new BigDecimal("5")).unitPrice(new BigDecimal("80000"))
                    .remarks("Business laptop for developer onboarding " + DEMO_MARKER)
                    .build());
        }
        result.put("items", workstation == null ? "custom workstation item" : workstation.getProductName());

        // ----- 4. Approval rule + stages (reuse IT-STD when present) -----
        ApprovalRule rule = ruleRepository.findByRuleCode("IT-STD").orElse(null);
        if (rule == null) {
            rule = ruleRepository.save(ApprovalRule.builder()
                    .ruleCode("IT-STD").ruleName("IT Standard Approval")
                    .department(it).minimumAmount(BigDecimal.ZERO)
                    .maximumAmount(new BigDecimal("1000000")).active(true)
                    .description("Manager -> Senior Manager -> Head for IT requests " + DEMO_MARKER)
                    .createdBy("demo:DEMO-2026-001").updatedBy("demo:DEMO-2026-001")
                    .build());
        }
        if (!stageRepository.existsByApprovalRuleIdAndSequence(rule.getId(), 1)) {
            stageRepository.save(ApprovalStage.builder()
                    .approvalRule(rule).stageNumber(1).stageName("Department Manager Review")
                    .approverRole(managerRole).minimumApprovers(1).mandatoryApproval(true)
                    .sequence(1).active(true).build());
        }
        if (!stageRepository.existsByApprovalRuleIdAndSequence(rule.getId(), 2) && seniorRole != null) {
            stageRepository.save(ApprovalStage.builder()
                    .approvalRule(rule).stageNumber(2).stageName("Senior Manager Review")
                    .approverRole(seniorRole).minimumApprovers(1).mandatoryApproval(true)
                    .sequence(2).active(true).build());
        }
        if (!stageRepository.existsByApprovalRuleIdAndSequence(rule.getId(), 3) && headRole != null) {
            stageRepository.save(ApprovalStage.builder()
                    .approvalRule(rule).stageNumber(3).stageName("Head / Executive Review")
                    .approverRole(headRole).minimumApprovers(1).mandatoryApproval(true)
                    .sequence(3).active(true).build());
        }

        // ----- 5. Approval tasks: Manager APPROVED, Senior APPROVED, Head APPROVED -----
        Employee manager = employeeRepository.findFirstByRoleIdAndActiveTrue(managerRole.getId()).orElse(null);
        Employee senior = seniorRole == null ? null : employeeRepository.findFirstByRoleIdAndActiveTrue(seniorRole.getId()).orElse(null);
        Employee head = headRole == null ? null : employeeRepository.findFirstByRoleIdAndActiveTrue(headRole.getId()).orElse(null);

        List<ApprovalStage> stages = stageRepository.findByApprovalRuleIdAndActiveTrueOrderBySequenceAsc(rule.getId());
        int level = 0;
        for (ApprovalStage stage : stages) {
            Employee approver = switch (stage.getSequence()) {
                case 1 -> manager;
                case 2 -> senior;
                case 3 -> head;
                default -> null;
            };
            if (approver == null) {
                continue;
            }
            level++;
            if (taskRepository.existsByPurchaseRequestIdAndApprovalStageId(pr.getId(), stage.getId())) {
                continue;
            }
            {
                ApprovalTask task = taskRepository.save(ApprovalTask.builder()
                        .taskNumber("AT-DEMO-" + Year() + "-" + String.format("%02d", level))
                        .purchaseRequest(pr).approvalStage(stage)
                        .assignedEmployee(approver).assignedRole(stage.getApproverRole())
                        .status(ApprovalTaskStatus.APPROVED)
                        .approvedAmount(pr.getEstimatedAmount())
                        .assignedDate(LocalDateTime.now())
                        .completedDate(LocalDateTime.now())
                        .comments("Approved as part of demo scenario " + DEMO_MARKER)
                        .build());
                historyRepository.save(ApprovalHistory.builder()
                        .purchaseRequest(pr).approvalTask(task).action(ApprovalAction.APPROVED)
                        .performedBy(approver)
                        .comments("Approved as part of demo scenario " + DEMO_MARKER)
                        .build());
            }
        }
        result.put("approvalLevels", level);

        // ----- 6. Mark request APPROVED + move to procurement -----
        if (pr.getApprovalStatus() != ApprovalStatus.APPROVED) {
            pr.setStatus(PurchaseRequestStatus.APPROVED);
            pr.setApprovalStatus(ApprovalStatus.APPROVED);
            requestRepository.save(pr);
        }
        result.put("approvalStatus", "APPROVED");

        // ----- 7. RFQ with 3 invited vendors -----
        Vendor techNova = vendorRepository.findByVendorCode("VEN-2026-001").orElse(null);
        Vendor officeTech = vendorRepository.findByVendorCode("VEN-2026-002").orElse(null);
        Vendor secureSoft = vendorRepository.findByVendorCode("VEN-2026-003").orElse(null);

        Rfq rfq = rfqRepository.findByPurchaseRequestId(pr.getId()).orElse(null);
        if (rfq == null && techNova != null && officeTech != null && secureSoft != null) {
            rfq = rfqRepository.save(Rfq.builder()
                    .rfqNumber("RFQ-DEMO-2026-001")
                    .purchaseRequest(pr).issueDate(LocalDate.now())
                    .closingDate(LocalDate.now().plusDays(10))
                    .quotationOpeningDate(LocalDate.now().plusDays(11))
                    .currency("INR").status(RfqStatus.OPEN)
                    .remarks("Mentor briefing demo RFQ " + DEMO_MARKER)
                    .createdBy("demo:DEMO-2026-001").updatedBy("demo:DEMO-2026-001")
                    .build());
            RfqLine rfqLine = workstation == null ? null : rfqLineRepository.save(RfqLine.builder()
                    .rfq(rfq).product(workstation).quantity(new BigDecimal("5"))
                    .requiredDate(LocalDate.now().plusDays(21))
                    .estimatedUnitPrice(new BigDecimal("80000"))
                    .remarks("IT Development Workstation " + DEMO_MARKER)
                    .build());
            result.put("rfqLineId", rfqLine == null ? null : rfqLine.getId());

            rfqVendorRepository.saveAll(List.of(
                    RfqVendor.builder().rfq(rfq).vendor(techNova).responseStatus(RfqVendorStatus.INVITED).remarks(DEMO_MARKER).build(),
                    RfqVendor.builder().rfq(rfq).vendor(officeTech).responseStatus(RfqVendorStatus.INVITED).remarks(DEMO_MARKER).build(),
                    RfqVendor.builder().rfq(rfq).vendor(secureSoft).responseStatus(RfqVendorStatus.INVITED).remarks(DEMO_MARKER).build()
            ));
            result.put("invitedVendors", 3);
        } else if (rfq == null) {
            result.put("invitedVendors", 0);
        } else {
            result.put("invitedVendors", rfqVendorRepository.findByRfqId(rfq.getId()).size());
        }
        result.put("rfq", rfq == null ? "SKIPPED" : rfq.getRfqNumber());
        result.put("rfqStatus", rfq == null ? null : rfq.getStatus().name());

        // ----- 8. Quotations: TechNova ₹3,95,000 / OfficeTech ₹3,82,000 / SecureSoft ₹4,05,000 -----
        if (rfq != null) {
            createDemoQuotation(rfq, techNova, "VQ-DEMO-2026-001", "395000", "Net 30", 10, 0);
            createDemoQuotation(rfq, officeTech, "VQ-DEMO-2026-002", "382000", "Net 45", 12, 24);
            createDemoQuotation(rfq, secureSoft, "VQ-DEMO-2026-003", "405000", "Net 15", 7, 6);
        }
        result.put("quotations", "3 submitted");

        // ----- 9. Comparison + recommend OfficeTech (winner) -----
        QuotationComparison comparison = rfq == null ? null : comparisonRepository.findByRfqId(rfq.getId()).orElse(null);
        VendorQuotation officeQuote = officeTech == null || rfq == null ? null
                : quotationRepository.findByRfqIdAndVendorId(rfq.getId(), officeTech.getId()).orElse(null);

        if (comparison == null && rfq != null && officeQuote != null) {
            comparison = comparisonRepository.save(QuotationComparison.builder()
                    .comparisonNumber("QC-DEMO-2026-001").rfq(rfq)
                    .comparisonMethod(ComparisonMethod.LOWEST_PRICE)
                    .comparisonDate(LocalDate.now())
                    .preparedBy("procurement@123")
                    .status(ComparisonStatus.APPROVED)
                    .createdBy("demo:DEMO-2026-001").updatedBy("demo:DEMO-2026-001")
                    .build());
            int rank = 0;
            final Rfq finalRfq = rfq;
            for (VendorQuotation q : quotationRepository.findAll((root, query, b) -> b.equal(root.get("rfq").get("id"), finalRfq.getId()))) {
                boolean recommended = officeTech != null && q.getVendor().getId().equals(officeTech.getId());
                rank++;
                comparisonLineRepository.save(QuotationComparisonLine.builder()
                        .comparison(comparison).vendorQuotation(q).vendor(q.getVendor())
                        .priceScore(new BigDecimal(recommended ? "98" : "90"))
                        .technicalScore(new BigDecimal("95")).qualityScore(new BigDecimal("96"))
                        .deliveryScore(new BigDecimal(recommended ? "92" : "85"))
                        .warrantyScore(new BigDecimal("80")).commercialScore(new BigDecimal(recommended ? "97" : "88"))
                        .overallScore(new BigDecimal(recommended ? "96.4" : "89.6"))
                        .rank(rank).recommended(recommended)
                        .remarks((recommended ? "Recommended winner — best evaluated combination " : "Alternate quote ") + DEMO_MARKER)
                        .build());
                q.setStatus(recommended ? VendorQuotationStatus.ACCEPTED : VendorQuotationStatus.REJECTED);
                quotationRepository.save(q);
            }
            if (rfq.getStatus() == RfqStatus.OPEN) {
                rfq.setStatus(RfqStatus.AWARDED);
                rfqRepository.save(rfq);
            }
        }
        result.put("comparison", comparison == null ? "SKIPPED" : comparison.getComparisonNumber());
        result.put("selectedVendor", officeTech == null ? null : officeTech.getVendorName());

        // ----- 10. PO for OfficeTech (visible ONLY to vendor2@123) -----
        final QuotationComparison finalComparison = comparison;
        PurchaseOrder po = finalComparison == null ? null : poRepository.findAll((root, q, b) -> b.equal(root.get("quotationComparison").get("id"), finalComparison.getId())).stream().findFirst().orElse(null);
        if (po == null && comparison != null && officeQuote != null) {
            po = poRepository.save(PurchaseOrder.builder()
                    .poNumber("PO-DEMO-2026-001")
                    .quotationComparison(comparison).vendorQuotation(officeQuote)
                    .vendor(officeTech).purchaseRequest(pr)
                    .department(it).costCenter(itCC)
                    .orderDate(LocalDate.now()).expectedDeliveryDate(LocalDate.now().plusDays(15))
                    .currency("INR")
                    .subtotal(officeQuote.getSubtotal()).taxAmount(officeQuote.getTaxAmount())
                    .grandTotal(officeQuote.getGrandTotal())
                    .paymentTerms("Net 45").deliveryAddress("IT Development Centre — Ground Floor")
                    .billingAddress("Finance Office — HQ")
                    .remarks("Demo PO issued to winning vendor " + DEMO_MARKER)
                    .status(PurchaseOrderStatus.SENT)
                    .createdBy("demo:DEMO-2026-001").updatedBy("demo:DEMO-2026-001")
                    .build());
            VendorQuotationLine winnerLine = quotationLineRepository.findByVendorQuotationId(officeQuote.getId()).stream().findFirst().orElse(null);
            if (winnerLine != null) {
                poLineRepository.save(PurchaseOrderLine.builder()
                        .purchaseOrder(po).product(winnerLine.getProduct())
                        .quantityOrdered(winnerLine.getQuantity()).unitPrice(winnerLine.getUnitPrice())
                        .discountPercentage(winnerLine.getDiscountPercentage())
                        .taxPercentage(winnerLine.getTaxPercentage())
                        .lineAmount(winnerLine.getLineAmount())
                        .build());
            }
        }
        result.put("purchaseOrder", po == null ? "SKIPPED" : po.getPoNumber());
        result.put("poStatus", po == null ? null : po.getStatus().name());
        result.put("poVendor", po == null ? null : po.getVendor().getVendorName());

        result.put("status", "COMPLETE");
        return result;
    }

    private void createDemoQuotation(Rfq rfq, Vendor vendor, String quotationNumber,
                                     String total, String paymentTerms, int deliveryDays, int warrantyMonths) {
        if (vendor == null) {
            return;
        }
        if (quotationRepository.existsByQuotationNumber(quotationNumber)) {
            return;
        }
        BigDecimal grandTotal = new BigDecimal(total);
        BigDecimal subtotal = grandTotal.divide(new BigDecimal("1.05"), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal tax = grandTotal.subtract(subtotal);
        RfqLine line = rfqLineRepository.findByRfqId(rfq.getId()).stream().findFirst().orElse(null);
        VendorQuotation q = quotationRepository.save(VendorQuotation.builder()
                .quotationNumber(quotationNumber).rfq(rfq).vendor(vendor)
                .validUntil(LocalDate.now().plusDays(30)).currency("INR")
                .paymentTerms(paymentTerms).deliveryDays(deliveryDays)
                .deliveryLocation(vendor.getVendorName() + " — Dispatch Hub")
                .warrantyMonths(warrantyMonths).remarks("Demo scenario quotation " + DEMO_MARKER)
                .subtotal(subtotal).taxAmount(tax).grandTotal(grandTotal)
                .status(VendorQuotationStatus.SUBMITTED).submissionDate(LocalDate.now())
                .createdBy("demo:DEMO-2026-001").updatedBy("demo:DEMO-2026-001")
                .build());
        if (line != null) {
            BigDecimal unit = grandTotal.divide(line.getQuantity(), 2, java.math.RoundingMode.HALF_UP);
            quotationLineRepository.save(VendorQuotationLine.builder()
                    .vendorQuotation(q).rfqLine(line).product(line.getProduct())
                    .quantity(line.getQuantity()).unitPrice(unit)
                    .discountPercentage(BigDecimal.ZERO).taxPercentage(new BigDecimal("5"))
                    .lineAmount(grandTotal)
                    .remarks("Demo quotation line " + DEMO_MARKER)
                    .build());
        }
        log.info("Demo scenario: created quotation {} for {}", quotationNumber, vendor.getVendorName());
    }

    /**
     * Returns the current state of the demo scenario (which stages have records).
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getDemoScenarioStatus() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("demoScenarioId", DEMO_SCENARIO_ID);
        PurchaseRequest pr = requestRepository.findByRequestNumber(DEMO_PR_NUMBER).orElse(null);
        result.put("purchaseRequest", pr == null ? null : pr.getRequestNumber());
        result.put("prStatus", pr == null ? null : pr.getStatus().name());
        result.put("approvalStatus", pr == null ? null : pr.getApprovalStatus().name());
        Rfq rfq = pr == null ? null : rfqRepository.findByPurchaseRequestId(pr.getId()).orElse(null);
        result.put("rfq", rfq == null ? null : rfq.getRfqNumber());
        result.put("rfqStatus", rfq == null ? null : rfq.getStatus().name());
        result.put("quotations", rfq == null ? 0 : quotationRepository.count((root, q, b) -> b.equal(root.get("rfq").get("id"), rfq.getId())));
        final QuotationComparison comparison = rfq == null ? null : comparisonRepository.findByRfqId(rfq.getId()).orElse(null);
        result.put("comparison", comparison == null ? null : comparison.getComparisonNumber());
        result.put("comparisonStatus", comparison == null ? null : comparison.getStatus().name());
        final QuotationComparison finalComp = comparison;
        PurchaseOrder po = finalComp == null ? null : poRepository.findAll((root, q, b) -> b.equal(root.get("quotationComparison").get("id"), finalComp.getId())).stream().findFirst().orElse(null);
        result.put("purchaseOrder", po == null ? null : po.getPoNumber());
        result.put("poStatus", po == null ? null : po.getStatus().name());
        result.put("poVendor", po == null ? null : po.getVendor().getVendorName());
        return result;
    }

    /**
     * Deletes ONLY records created by the demo scenario (business-key based).
     * Real data is never touched.
     */
    @Transactional
    public Map<String, Object> resetDemoScenario() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("demoScenarioId", DEMO_SCENARIO_ID);

        PurchaseRequest pr = requestRepository.findByRequestNumber(DEMO_PR_NUMBER).orElse(null);
        Rfq rfq = pr == null ? null : rfqRepository.findByPurchaseRequestId(pr.getId()).orElse(null);
        QuotationComparison comparison = rfq == null ? null : comparisonRepository.findByRfqId(rfq.getId()).orElse(null);
        final QuotationComparison finalComp = comparison;
        PurchaseOrder po = finalComp == null ? null : poRepository.findAll((root, q, b) -> b.equal(root.get("quotationComparison").get("id"), finalComp.getId())).stream().findFirst().orElse(null);

        if (po != null) {
            poLineRepository.deleteAll(poLineRepository.findByPurchaseOrderId(po.getId()));
            poRepository.delete(po);
            result.put("purchaseOrder", "deleted");
        }
        if (comparison != null) {
            comparisonLineRepository.deleteAll(comparisonLineRepository.findByComparisonIdOrderByRankAsc(comparison.getId()));
            comparisonRepository.delete(comparison);
            result.put("comparison", "deleted");
        }
        if (rfq != null) {
            quotationRepository.findAll((root, q, b) -> b.equal(root.get("rfq").get("id"), rfq.getId()))
                    .forEach(q -> quotationLineRepository.deleteAll(quotationLineRepository.findByVendorQuotationId(q.getId())));
            quotationRepository.deleteAll(quotationRepository.findAll((root, q, b) -> b.equal(root.get("rfq").get("id"), rfq.getId())));
            rfqVendorRepository.deleteAll(rfqVendorRepository.findByRfqId(rfq.getId()));
            rfqLineRepository.deleteAll(rfqLineRepository.findByRfqId(rfq.getId()));
            rfqRepository.delete(rfq);
            result.put("rfq", "deleted");
        }
        if (pr != null) {
            taskRepository.deleteAll(taskRepository.findByPurchaseRequestIdOrderByApprovalStageSequenceAsc(pr.getId()));
            historyRepository.deleteAll(historyRepository.findByPurchaseRequestIdOrderByPerformedAtAsc(pr.getId()));
            requestLineRepository.deleteAll(requestLineRepository.findByPurchaseRequestId(pr.getId()));
            requestRepository.delete(pr);
            result.put("purchaseRequest", "deleted");
        }
        result.put("status", "RESET");
        return result;
    }

    private static int Year() {
        return LocalDate.now().getYear();
    }
}
