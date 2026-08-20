package com.procurement.vendor.controller;

import com.procurement.common.exception.ForbiddenException;
import com.procurement.common.response.ApiResponse;
import com.procurement.common.response.PageResponse;
import com.procurement.product.entity.Product;
import com.procurement.purchaseorder.dto.response.PurchaseOrderResponse;
import com.procurement.purchaseorder.entity.PurchaseOrder;
import com.procurement.purchaseorder.mapper.PurchaseOrderMapper;
import com.procurement.purchaseorder.repository.PurchaseOrderRepository;
import com.procurement.purchaseorder.service.PurchaseOrderService;
import com.procurement.rfq.entity.Rfq;
import com.procurement.rfq.entity.RfqLine;
import com.procurement.rfq.entity.RfqVendor;
import com.procurement.rfq.entity.RfqVendorStatus;
import com.procurement.rfq.repository.RfqLineRepository;
import com.procurement.rfq.repository.RfqVendorRepository;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import com.procurement.vendor.dto.response.VendorResponse;
import com.procurement.vendor.entity.Vendor;
import com.procurement.vendor.mapper.VendorMapper;
import com.procurement.vendorquotation.dto.response.VendorQuotationResponse;
import com.procurement.vendorquotation.entity.VendorQuotation;
import com.procurement.vendorquotation.repository.VendorQuotationRepository;
import com.procurement.vendorquotation.service.VendorQuotationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Vendor self-service portal endpoints.
 * <p>
 * Every request resolves the Vendor from the authenticated user (User.vendor),
 * so a supplier can only ever see RFQs they were invited to, their own
 * quotations, and purchase orders issued to their own company.
 */
@RestController
@RequestMapping("/api/vendor/my")
@Transactional(readOnly = true)
public class VendorPortalController {

    private final UserRepository users;
    private final VendorMapper vendorMapper;
    private final RfqVendorRepository rfqVendors;
    private final RfqLineRepository rfqLines;
    private final VendorQuotationRepository quotations;
    private final VendorQuotationService quotationService;
    private final PurchaseOrderRepository pos;
    private final PurchaseOrderService poService;
    private final PurchaseOrderMapper poMapper;
    private final com.procurement.invoice.repository.InvoiceRepository invoices;
    private final com.procurement.payment.repository.PaymentRepository payments;
    private final com.procurement.goodsreceipt.repository.GoodsReceiptNoteRepository grnRepo;

    public VendorPortalController(UserRepository users,
                                  VendorMapper vendorMapper,
                                  RfqVendorRepository rfqVendors,
                                  RfqLineRepository rfqLines,
                                  VendorQuotationRepository quotations,
                                  VendorQuotationService quotationService,
                                  PurchaseOrderRepository pos,
                                  PurchaseOrderService poService,
                                  PurchaseOrderMapper poMapper,
                                  com.procurement.invoice.repository.InvoiceRepository invoices,
                                  com.procurement.payment.repository.PaymentRepository payments,
                                  com.procurement.goodsreceipt.repository.GoodsReceiptNoteRepository grnRepo) {
        this.users = users;
        this.vendorMapper = vendorMapper;
        this.rfqVendors = rfqVendors;
        this.rfqLines = rfqLines;
        this.quotations = quotations;
        this.quotationService = quotationService;
        this.pos = pos;
        this.poService = poService;
        this.poMapper = poMapper;
        this.invoices = invoices;
        this.payments = payments;
        this.grnRepo = grnRepo;
    }

    private String username() {
        var a = SecurityContextHolder.getContext().getAuthentication();
        return a == null ? "system" : a.getName();
    }

    private User currentUser() {
        return users.findByUsername(username())
                .orElseThrow(() -> new ForbiddenException("Authenticated user not found"));
    }

    private Vendor myVendor() {
        Vendor vendor = currentUser().getVendor();
        if (vendor == null) {
            throw new ForbiddenException("Your account is not linked to a vendor company");
        }
        return vendor;
    }

    private Pageable p(int page, int size, String sort, String direction) {
        return PageRequest.of(page, size,
                Sort.by("desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC, sort));
    }

    @GetMapping("/profile")
    public ApiResponse<VendorResponse> profile() {
        return ApiResponse.success(vendorMapper.toResponse(myVendor()));
    }

    /** RFQs where this vendor was invited, with the invitation/response state. */
    @GetMapping("/rfqs")
    public ApiResponse<PageResponse<Map<String, Object>>> rfqs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Vendor vendor = myVendor();
        Page<RfqVendor> invited = rfqVendors.findAll(
                (root, query, cb) -> cb.equal(root.get("vendor").get("id"), vendor.getId()),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "invitationDate")));

        List<Map<String, Object>> rows = new ArrayList<>();
        for (RfqVendor invite : invited.getContent()) {
            Rfq rfq = invite.getRfq();
            List<RfqLine> lines = rfqLines.findByRfqId(rfq.getId());
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("rfqId", rfq.getId());
            row.put("rfqNumber", rfq.getRfqNumber());
            row.put("status", rfq.getStatus());
            row.put("issueDate", rfq.getIssueDate());
            row.put("closingDate", rfq.getClosingDate());
            row.put("currency", rfq.getCurrency());
            row.put("remarks", rfq.getRemarks());
            row.put("invitationStatus", invite.getResponseStatus());
            row.put("responded", invite.getResponseStatus() == RfqVendorStatus.RESPONDED);
            row.put("item",
                    lines.isEmpty() ? "General requirement"
                            : lines.get(0).getProduct().getProductName());
            row.put("quantity", lines.isEmpty() ? null : lines.get(0).getQuantity());
            row.put("lines", lines.stream().map(l -> {
                Product prod = l.getProduct();
                Map<String, Object> line = new LinkedHashMap<>();
                line.put("rfqLineId", l.getId());
                line.put("productId", prod.getId());
                line.put("productName", prod.getProductName());
                line.put("sku", prod.getSku());
                line.put("quantity", l.getQuantity());
                line.put("estimatedUnitPrice", l.getEstimatedUnitPrice());
                line.put("requiredDate", l.getRequiredDate());
                return line;
            }).toList());
            rows.add(row);
        }
        PageResponse<Map<String, Object>> result = new PageResponse<>(
                rows, invited.getNumber(), invited.getSize(),
                invited.getTotalElements(), invited.getTotalPages(), invited.isLast());
        return ApiResponse.success(result);
    }

    /** Quotations belonging to the authenticated vendor. */
    @GetMapping("/quotations")
    public ApiResponse<PageResponse<VendorQuotationResponse>> quotations(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) com.procurement.vendorquotation.entity.VendorQuotationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        Vendor vendor = myVendor();
        return ApiResponse.success(quotationService.search(keyword, null, vendor.getId(), status,
                p(page, size, sort, direction)));
    }

    /** Purchase orders issued to the authenticated vendor only. */
    @GetMapping("/purchase-orders")
    public ApiResponse<PageResponse<PurchaseOrderResponse>> purchaseOrders(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) com.procurement.purchaseorder.entity.PurchaseOrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "orderDate") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        Vendor vendor = myVendor();
        Page<PurchaseOrder> all = pos.findAll(
                (root, query, cb) -> {
                    var conjunction = cb.conjunction();
                    conjunction = cb.and(conjunction, cb.equal(root.get("vendor").get("id"), vendor.getId()));
                    if (status != null) conjunction = cb.and(conjunction, cb.equal(root.get("status"), status));
                    if (keyword != null && !keyword.isBlank()) {
                        String like = "%" + keyword.toLowerCase() + "%";
                        conjunction = cb.and(conjunction,
                                cb.or(cb.like(cb.lower(root.get("poNumber")), like),
                                        cb.like(cb.lower(root.get("vendor").get("vendorName")), like)));
                    }
                    return conjunction;
                },
                p(page, size, sort, direction));
        List<PurchaseOrderResponse> rows = all.getContent().stream().map(poMapper::po).toList();
        PageResponse<PurchaseOrderResponse> result = new PageResponse<>(
                rows, all.getNumber(), all.getSize(), all.getTotalElements(),
                all.getTotalPages(), all.isLast());
        return ApiResponse.success(result);
    }

    @GetMapping("/purchase-orders/{id}")
    public ApiResponse<PurchaseOrderResponse> purchaseOrder(@PathVariable Long id) {
        PurchaseOrder po = pos.findById(id)
                .filter(x -> x.getVendor().getId().equals(myVendor().getId()))
                .orElseThrow(() -> new com.procurement.purchaseorder.exception.PurchaseOrderNotFoundException(id));
        return ApiResponse.success(poMapper.po(po));
    }

    /** Vendor accepts the PO — only their own PO can be acknowledged. */
    /** Invoices belonging to the authenticated vendor (financial visibility). */
    @GetMapping("/invoices")
    public ApiResponse<PageResponse<Map<String, Object>>> invoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Vendor vendor = myVendor();
        var list = invoices.findByVendorId(vendor.getId());
        list.sort((a, b) -> (b.getInvoiceDate() == null ? java.time.LocalDate.MIN : b.getInvoiceDate())
                .compareTo(a.getInvoiceDate() == null ? java.time.LocalDate.MIN : a.getInvoiceDate()));
        List<Map<String, Object>> rows = list.stream().skip((long) page * size).limit(size).map(inv -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", inv.getId());
            row.put("invoiceNumber", inv.getInvoiceNumber());
            row.put("vendorInvoiceNumber", inv.getVendorInvoiceNumber());
            row.put("purchaseOrderId", inv.getPurchaseOrder().getId());
            row.put("poNumber", inv.getPurchaseOrder().getPoNumber());
            row.put("invoiceDate", inv.getInvoiceDate());
            row.put("dueDate", inv.getDueDate());
            row.put("currency", inv.getCurrency());
            row.put("subtotal", inv.getSubtotal());
            row.put("discountAmount", inv.getDiscountAmount());
            row.put("taxAmount", inv.getTaxAmount());
            row.put("shippingCharges", inv.getShippingCharges());
            row.put("otherCharges", inv.getOtherCharges());
            row.put("grandTotal", inv.getGrandTotal());
            row.put("status", inv.getStatus());
            return row;
        }).toList();
        PageResponse<Map<String, Object>> result = new PageResponse<>(
                rows, page, size, list.size(),
                (int) Math.ceil(list.size() / (double) size), rows.size() < size);
        return ApiResponse.success(result);
    }

    /** Payments belonging to the authenticated vendor (payment status visibility). */
    @GetMapping("/payments")
    public ApiResponse<PageResponse<Map<String, Object>>> payments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Vendor vendor = myVendor();
        var list = payments.findByVendorId(vendor.getId());
        list.sort((a, b) -> (b.getPaymentDate() == null ? java.time.LocalDate.MIN : b.getPaymentDate())
                .compareTo(a.getPaymentDate() == null ? java.time.LocalDate.MIN : a.getPaymentDate()));
        List<Map<String, Object>> rows = list.stream().skip((long) page * size).limit(size).map(p -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", p.getId());
            row.put("paymentNumber", p.getPaymentNumber());
            row.put("invoiceId", p.getInvoice() == null ? null : p.getInvoice().getId());
            row.put("invoiceNumber", p.getInvoice() == null ? null : p.getInvoice().getInvoiceNumber());
            row.put("purchaseOrderId", p.getPurchaseOrder() == null ? null : p.getPurchaseOrder().getId());
            row.put("purchaseOrderNumber", p.getPurchaseOrder() == null ? null : p.getPurchaseOrder().getPoNumber());
            row.put("paymentDate", p.getPaymentDate());
            row.put("paymentMethod", p.getPaymentMethod());
            row.put("paymentReference", p.getPaymentReference());
            row.put("bankReference", p.getBankReference());
            row.put("currency", p.getCurrency());
            row.put("grossAmount", p.getGrossAmount());
            row.put("netAmount", p.getNetAmount());
            row.put("paidAmount", p.getPaidAmount());
            row.put("status", p.getStatus());
            return row;
        }).toList();
        PageResponse<Map<String, Object>> result = new PageResponse<>(
                rows, page, size, list.size(),
                (int) Math.ceil(list.size() / (double) size), rows.size() < size);
        return ApiResponse.success(result);
    }

    /** Goods receipt notes (delivery status) for the authenticated vendor's purchase orders. */
    @GetMapping("/deliveries")
    public ApiResponse<List<Map<String, Object>>> deliveries() {
        Vendor vendor = myVendor();
        var grns = grnRepo.findByVendorId(vendor.getId());
        List<Map<String, Object>> rows = grns.stream().map(g -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", g.getId());
            row.put("grnNumber", g.getGrnNumber());
            row.put("purchaseOrderId", g.getPurchaseOrder().getId());
            row.put("poNumber", g.getPurchaseOrder().getPoNumber());
            row.put("receiptDate", g.getReceiptDate());
            row.put("status", g.getStatus());
            row.put("remarks", g.getRemarks());
            return row;
        }).toList();
        return ApiResponse.success(rows);
    }

    @PostMapping("/purchase-orders/{id}/acknowledge")
    @Transactional
    public ApiResponse<PurchaseOrderResponse> acknowledge(@PathVariable Long id) {
        PurchaseOrder po = pos.findById(id)
                .filter(x -> x.getVendor().getId().equals(myVendor().getId()))
                .orElseThrow(() -> new com.procurement.purchaseorder.exception.PurchaseOrderNotFoundException(id));
        return ApiResponse.success("Purchase order acknowledged", poService.acknowledge(po.getId()));
    }

    /** Vendor rejects / cancels the PO — only their own PO. */
    @PostMapping("/purchase-orders/{id}/reject")
    @Transactional
    public ApiResponse<PurchaseOrderResponse> reject(@PathVariable Long id) {
        PurchaseOrder po = pos.findById(id)
                .filter(x -> x.getVendor().getId().equals(myVendor().getId()))
                .orElseThrow(() -> new com.procurement.purchaseorder.exception.PurchaseOrderNotFoundException(id));
        return ApiResponse.success("Purchase order rejected", poService.cancel(po.getId()));
    }

    /** Create a quotation draft — the vendor is always the authenticated vendor. */
    @PostMapping("/quotations")
    @Transactional
    public ResponseEntity<ApiResponse<VendorQuotationResponse>> createQuotation(
            @Valid @RequestBody com.procurement.vendorquotation.dto.request.VendorQuotationRequest request) {
        Vendor vendor = myVendor();
        var scoped = new com.procurement.vendorquotation.dto.request.VendorQuotationRequest(
                request.rfqId(), vendor.getId(), request.validUntil(), request.currency(),
                request.discountAmount(), request.taxAmount(), request.shippingCharges(),
                request.otherCharges(), request.paymentTerms(), request.deliveryDays(),
                request.deliveryLocation(), request.warrantyMonths(), request.remarks());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vendor quotation created", quotationService.create(scoped)));
    }

    @PostMapping("/quotations/{id}/submit")
    @Transactional
    public ApiResponse<VendorQuotationResponse> submitQuotation(@PathVariable Long id) {
        return ApiResponse.success("Vendor quotation submitted", quotationService.submit(id));
    }

    /** Add a line to my own draft quotation. */
    @PostMapping("/quotations/{id}/lines")
    @Transactional
    public ResponseEntity<ApiResponse<com.procurement.vendorquotation.dto.response.VendorQuotationLineResponse>> addLine(
            @PathVariable Long id,
            @Valid @RequestBody com.procurement.vendorquotation.dto.request.VendorQuotationLineRequest request) {
        VendorQuotation quotation = quotations.findById(id)
                .filter(q -> q.getVendor().getId().equals(myVendor().getId()))
                .orElseThrow(() -> new com.procurement.vendorquotation.exception.VendorQuotationNotFoundException(id));
        var scoped = new com.procurement.vendorquotation.dto.request.VendorQuotationLineRequest(
                quotation.getId(), request.rfqLineId(), request.quantity(), request.unitPrice(),
                request.discountPercentage(), request.taxPercentage(), request.remarks());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Quotation line added", quotationService.addLine(scoped)));
    }

    @GetMapping("/quotations/{id}/lines")
    public ApiResponse<PageResponse<com.procurement.vendorquotation.dto.response.VendorQuotationLineResponse>> lines(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        VendorQuotation quotation = quotations.findById(id)
                .filter(q -> q.getVendor().getId().equals(myVendor().getId()))
                .orElseThrow(() -> new com.procurement.vendorquotation.exception.VendorQuotationNotFoundException(id));
        return ApiResponse.success(quotationService.lines(quotation.getId(), PageRequest.of(page, size)));
    }
}
