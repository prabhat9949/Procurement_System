package com.procurement.config;

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
import com.procurement.vendor.entity.Vendor;
import com.procurement.vendor.repository.VendorRepository;
import com.procurement.vendorquotation.entity.VendorQuotation;
import com.procurement.vendorquotation.entity.VendorQuotationLine;
import com.procurement.vendorquotation.entity.VendorQuotationStatus;
import com.procurement.vendorquotation.repository.VendorQuotationLineRepository;
import com.procurement.vendorquotation.repository.VendorQuotationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.Optional;

/**
 * Seeds a realistic, fully-linked demo workflow so the mentor briefing can walk
 * through: employee request -> manager approval queue -> approval decision ->
 * approved request -> RFQ -> vendor bidding -> quotation comparison -> PO.
 *
 * Runs after {@link VendorAccountSeeder} and {@link DemoDataSeeder}. Everything
 * is idempotent (only inserted when missing), so it is safe on every startup.
 */
@Configuration
@Order(4)
public class DemoWorkflowSeeder {

    private static final Logger log = LoggerFactory.getLogger(DemoWorkflowSeeder.class);

    @Bean
    @org.springframework.core.annotation.Order(4)
    @Transactional
    public CommandLineRunner seedDemoWorkflow(
            @Value("${app.seed.demo-transactions-enabled:false}") boolean demoTransactionsEnabled,
            DepartmentRepository departmentRepository,
            RoleRepository roleRepository,
            ApprovalRuleRepository ruleRepository,
            ApprovalStageRepository stageRepository,
            EmployeeRepository employeeRepository,
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
            PurchaseOrderLineRepository poLineRepository
    ) {
        return args -> {
            if (!demoTransactionsEnabled) {
                log.info("Demo transaction workflow seeding disabled.");
                return;
            }

            Department it = departmentRepository.findByDepartmentCode("IT").orElse(null);
            Role managerRole = roleRepository.findByRoleCode("DEPARTMENT_MANAGER").orElse(null);
            Role seniorRole = roleRepository.findByRoleCode("SENIOR_MANAGER").orElse(null);
            Role headRole = roleRepository.findByRoleCode("HEAD").orElse(null);
            if (it == null || managerRole == null) {
                log.warn("Demo workflow skipped: IT department / manager role missing.");
                return;
            }

            // ============================================================
            // 1. Approval rule + stages (IT): Manager -> Senior -> Head
            // ============================================================
            ApprovalRule rule = ruleRepository.findByRuleCode("IT-STD").orElse(null);
            if (rule == null) {
                rule = ruleRepository.save(ApprovalRule.builder()
                        .ruleCode("IT-STD")
                        .ruleName("IT Standard Approval")
                        .department(it)
                        .minimumAmount(BigDecimal.ZERO)
                        .maximumAmount(new BigDecimal("1000000"))
                        .active(true)
                        .description("Manager -> Senior Manager -> Head for IT department requests up to ₹10L")
                        .createdBy("system").updatedBy("system")
                        .build());
                log.info("Seeded approval rule IT-STD");
            }

            ApprovalStage mgrStage = stageRepository.existsByApprovalRuleIdAndSequence(rule.getId(), 1)
                    ? stageRepository.findByApprovalRuleIdAndActiveTrueOrderBySequenceAsc(rule.getId()).get(0)
                    : stageRepository.save(ApprovalStage.builder()
                            .approvalRule(rule).stageNumber(1).stageName("Department Manager Review")
                            .approverRole(managerRole).minimumApprovers(1).mandatoryApproval(true)
                            .sequence(1).active(true).build());
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

            // ============================================================
            // 2. Pending approval task for the department manager
            //    (PR-2026-000001 -> Sandeep Kumar, DEPARTMENT_MANAGER)
            // ============================================================
            PurchaseRequest pr1 = requestRepository.findByRequestNumber("PR-2026-000001").orElse(null);
            Employee deptManager = employeeRepository.findFirstByRoleIdAndActiveTrue(managerRole.getId()).orElse(null);
            if (pr1 != null && deptManager != null
                    && !taskRepository.existsByPurchaseRequestIdAndApprovalStageId(pr1.getId(), mgrStage.getId())) {
                // Ensure the PR is in the pending/under-review state.
                pr1.setStatus(PurchaseRequestStatus.UNDER_REVIEW);
                pr1.setApprovalStatus(ApprovalStatus.PENDING);
                requestRepository.save(pr1);
                ApprovalTask task = taskRepository.save(ApprovalTask.builder()
                        .taskNumber("AT-" + Year.now().getValue() + "-" + String.format("%06d", taskRepository.count() + 1))
                        .purchaseRequest(pr1).approvalStage(mgrStage)
                        .assignedEmployee(deptManager).assignedRole(managerRole)
                        .status(ApprovalTaskStatus.PENDING)
                        .approvedAmount(pr1.getEstimatedAmount())
                        .assignedDate(LocalDateTime.now())
                        .build());
                historyRepository.save(ApprovalHistory.builder()
                        .purchaseRequest(pr1).approvalTask(task).action(ApprovalAction.SUBMITTED)
                        .performedBy(deptManager).comments("Purchase request submitted for approval")
                        .build());
                log.info("Seeded pending manager approval task for {}", pr1.getRequestNumber());
            }

            // ============================================================
            // 3. Approved demo flow: PR-2026-000002 -> RFQ -> bids -> PO
            // ============================================================
            PurchaseRequest pr2 = requestRepository.findByRequestNumber("PR-2026-000002").orElse(null);
            Product paper = productRepository.findByProductCode("PRD-APER-1").orElse(null);
            Product pens = productRepository.findByProductCode("PRD-PEN-01").orElse(null);
            Vendor mumbai = vendorRepository.findByVendorCode("VEN-2026-002").orElse(null);
            Vendor delhi = vendorRepository.findByVendorCode("VEN-2026-001").orElse(null);
            Vendor bengaluru = vendorRepository.findByVendorCode("VEN-2026-003").orElse(null);
            CostCenter itCC = costCenterRepository.findByCode("IT-001").orElse(null);

            if (pr2 != null && paper != null && mumbai != null && delhi != null && bengaluru != null
                    && itCC != null && !rfqRepository.findByPurchaseRequestId(pr2.getId()).isPresent()) {
                // Keep the approved request fully approved so the RFQ stays valid.
                pr2.setStatus(PurchaseRequestStatus.APPROVED);
                pr2.setApprovalStatus(ApprovalStatus.APPROVED);
                requestRepository.save(pr2);

                Rfq rfq = rfqRepository.save(Rfq.builder()
                        .rfqNumber("RFQ-" + Year.now().getValue() + "-" + String.format("%06d", rfqRepository.count() + 1))
                        .purchaseRequest(pr2)
                        .issueDate(LocalDate.now())
                        .closingDate(LocalDate.now().plusDays(10))
                        .quotationOpeningDate(LocalDate.now().plusDays(11))
                        .currency("INR")
                        .status(RfqStatus.OPEN)
                        .remarks("Q3 stationery & consumables — demo RFQ for mentor briefing")
                        .createdBy("system").updatedBy("system")
                        .build());

                RfqLine paperLine = rfqLineRepository.save(RfqLine.builder()
                        .rfq(rfq).product(paper).quantity(new BigDecimal("60"))
                        .requiredDate(LocalDate.now().plusDays(20))
                        .estimatedUnitPrice(new BigDecimal("1450"))
                        .remarks("A4 premium copier paper (pack of 5)")
                        .build());
                if (pens != null) {
                    rfqLineRepository.save(RfqLine.builder()
                            .rfq(rfq).product(pens).quantity(new BigDecimal("40"))
                            .requiredDate(LocalDate.now().plusDays(20))
                            .estimatedUnitPrice(new BigDecimal("750"))
                            .remarks("Gel pen blue (box of 50)")
                            .build());
                }

                rfqVendorRepository.saveAll(java.util.List.of(
                        RfqVendor.builder().rfq(rfq).vendor(mumbai).responseStatus(RfqVendorStatus.INVITED).remarks("Invited for bidding").build(),
                        RfqVendor.builder().rfq(rfq).vendor(delhi).responseStatus(RfqVendorStatus.INVITED).remarks("Invited for bidding").build(),
                        RfqVendor.builder().rfq(rfq).vendor(bengaluru).responseStatus(RfqVendorStatus.INVITED).remarks("Invited for bidding").build()
                ));

                // Quotations from two vendors (Mumbai lower price, Delhi best value).
                VendorQuotation mumbaiQuote = quotationRepository.save(VendorQuotation.builder()
                        .quotationNumber("VQ-" + Year.now().getValue() + "-000001")
                        .rfq(rfq).vendor(mumbai)
                        .validUntil(LocalDate.now().plusDays(30)).currency("INR")
                        .paymentTerms("Net 15").deliveryDays(5).deliveryLocation("Mumbai Central Warehouse")
                        .warrantyMonths(0).remarks("Competitive quote")
                        .status(VendorQuotationStatus.SUBMITTED).submissionDate(LocalDate.now())
                        .createdBy("vendor2@123").updatedBy("vendor2@123")
                        .build());
                BigDecimal mumbaiUnit = new BigDecimal("1420");
                quotationLineRepository.save(VendorQuotationLine.builder()
                        .vendorQuotation(mumbaiQuote).rfqLine(paperLine).product(paper)
                        .quantity(new BigDecimal("60")).unitPrice(mumbaiUnit)
                        .discountPercentage(BigDecimal.ZERO).taxPercentage(new BigDecimal("5"))
                        .lineAmount(new BigDecimal("60").multiply(mumbaiUnit))
                        .remarks("Discounted bulk price").build());
                mumbaiQuote.setSubtotal(new BigDecimal("60").multiply(mumbaiUnit));
                mumbaiQuote.setTaxAmount(mumbaiQuote.getSubtotal().multiply(new BigDecimal("0.05")));
                mumbaiQuote.setGrandTotal(mumbaiQuote.getSubtotal().add(mumbaiQuote.getTaxAmount()));
                quotationRepository.save(mumbaiQuote);

                VendorQuotation delhiQuote = quotationRepository.save(VendorQuotation.builder()
                        .quotationNumber("VQ-" + Year.now().getValue() + "-000002")
                        .rfq(rfq).vendor(delhi)
                        .validUntil(LocalDate.now().plusDays(30)).currency("INR")
                        .paymentTerms("Net 30").deliveryDays(7).deliveryLocation("Delhi HQ")
                        .warrantyMonths(0).remarks("Bulk stationery supplier")
                        .status(VendorQuotationStatus.SUBMITTED).submissionDate(LocalDate.now())
                        .createdBy("vendor@123").updatedBy("vendor@123")
                        .build());
                BigDecimal delhiUnit = new BigDecimal("1390");
                quotationLineRepository.save(VendorQuotationLine.builder()
                        .vendorQuotation(delhiQuote).rfqLine(paperLine).product(paper)
                        .quantity(new BigDecimal("60")).unitPrice(delhiUnit)
                        .discountPercentage(new BigDecimal("2")).taxPercentage(new BigDecimal("5"))
                        .lineAmount(new BigDecimal("60").multiply(delhiUnit))
                        .remarks("Volume discount applied").build());
                delhiQuote.setSubtotal(new BigDecimal("60").multiply(delhiUnit));
                delhiQuote.setTaxAmount(delhiQuote.getSubtotal().multiply(new BigDecimal("0.05")));
                delhiQuote.setGrandTotal(delhiQuote.getSubtotal().add(delhiQuote.getTaxAmount()));
                quotationRepository.save(delhiQuote);

                // Comparison: recommend Delhi Tech (winning vendor).
                QuotationComparison comparison = comparisonRepository.save(QuotationComparison.builder()
                        .comparisonNumber("QC-" + Year.now().getValue() + "-000001")
                        .rfq(rfq).comparisonMethod(ComparisonMethod.LOWEST_PRICE)
                        .comparisonDate(LocalDate.now())
                        .preparedBy("procurement@123")
                        .status(ComparisonStatus.APPROVED)
                        .createdBy("procurement@123").updatedBy("procurement@123")
                        .build());
                comparisonLineRepository.save(QuotationComparisonLine.builder()
                        .comparison(comparison).vendorQuotation(delhiQuote).vendor(delhi)
                        .priceScore(new BigDecimal("98")).technicalScore(new BigDecimal("95"))
                        .qualityScore(new BigDecimal("97")).deliveryScore(new BigDecimal("90"))
                        .warrantyScore(new BigDecimal("80")).commercialScore(new BigDecimal("96"))
                        .overallScore(new BigDecimal("96.2")).rank(1).recommended(true)
                        .remarks("Recommended winner — best overall value").build());
                comparisonLineRepository.save(QuotationComparisonLine.builder()
                        .comparison(comparison).vendorQuotation(mumbaiQuote).vendor(mumbai)
                        .priceScore(new BigDecimal("96")).technicalScore(new BigDecimal("92"))
                        .qualityScore(new BigDecimal("94")).deliveryScore(new BigDecimal("85"))
                        .warrantyScore(new BigDecimal("75")).commercialScore(new BigDecimal("93"))
                        .overallScore(new BigDecimal("93.4")).rank(2).recommended(false)
                        .remarks("Runner up").build());
                rfq.setStatus(RfqStatus.AWARDED);
                rfqRepository.save(rfq);
                delhiQuote.setStatus(VendorQuotationStatus.ACCEPTED);
                mumbaiQuote.setStatus(VendorQuotationStatus.REJECTED);
                quotationRepository.save(delhiQuote);
                quotationRepository.save(mumbaiQuote);

                // Purchase order for the winning vendor (visible ONLY in their portal).
                if (!poRepository.existsByQuotationComparisonId(comparison.getId())) {
                    PurchaseOrder po = poRepository.save(PurchaseOrder.builder()
                            .poNumber("PO-" + Year.now().getValue() + "-" + String.format("%06d", poRepository.count() + 1))
                            .quotationComparison(comparison).vendorQuotation(delhiQuote)
                            .vendor(delhi).purchaseRequest(pr2)
                            .department(it).costCenter(itCC)
                            .orderDate(LocalDate.now()).expectedDeliveryDate(LocalDate.now().plusDays(15))
                            .currency("INR")
                            .subtotal(delhiQuote.getSubtotal()).taxAmount(delhiQuote.getTaxAmount())
                            .grandTotal(delhiQuote.getGrandTotal())
                            .paymentTerms("Net 30").deliveryAddress("Delhi HQ — Receiving Bay")
                            .billingAddress("Finance Office — Delhi HQ")
                            .remarks("Demo PO issued to winning vendor")
                            .status(PurchaseOrderStatus.SENT)
                            .createdBy("procurement@123").updatedBy("procurement@123")
                            .build());
                    poLineRepository.save(PurchaseOrderLine.builder()
                            .purchaseOrder(po).product(paper)
                            .quantityOrdered(new BigDecimal("60")).unitPrice(delhiUnit)
                            .discountPercentage(new BigDecimal("2")).taxPercentage(new BigDecimal("5"))
                            .lineAmount(new BigDecimal("60").multiply(delhiUnit))
                            .build());
                    log.info("Seeded demo PO {} -> {}", po.getPoNumber(), delhi.getVendorName());
                }
                log.info("Demo workflow seeded for {} (RFQ {}, comparison {}, award -> {})",
                        pr2.getRequestNumber(), rfq.getRfqNumber(), comparison.getComparisonNumber(),
                        delhi.getVendorName());
            } else if (pr2 != null) {
                log.info("Demo workflow for PR-2026-000002 already present or missing dependencies, skipping.");
            }

            log.info("Demo workflow seeder finished.");
        };
    }
}
