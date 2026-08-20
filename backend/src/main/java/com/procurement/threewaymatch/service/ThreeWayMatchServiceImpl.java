package com.procurement.threewaymatch.service;

import com.procurement.common.exception.*;
import com.procurement.common.response.PageResponse;
import com.procurement.goodsreceipt.entity.GoodsReceiptLine;
import com.procurement.goodsreceipt.repository.GoodsReceiptLineRepository;
import com.procurement.goodsreceipt.repository.GoodsReceiptNoteRepository;
import com.procurement.invoice.entity.InvoiceLine;
import com.procurement.invoice.repository.InvoiceLineRepository;
import com.procurement.invoice.repository.InvoiceRepository;
import com.procurement.purchaseorder.entity.PurchaseOrderLine;
import com.procurement.purchaseorder.repository.PurchaseOrderLineRepository;
import com.procurement.purchaseorder.repository.PurchaseOrderRepository;
import com.procurement.threewaymatch.dto.request.ThreeWayMatchRequest;
import com.procurement.threewaymatch.dto.response.*;
import com.procurement.threewaymatch.entity.*;
import com.procurement.threewaymatch.exception.ThreeWayMatchNotFoundException;
import com.procurement.threewaymatch.mapper.ThreeWayMatchMapper;
import com.procurement.threewaymatch.repository.*;
import com.procurement.threewaymatch.specification.ThreeWayMatchSpecification;
import com.procurement.vendor.entity.Vendor;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ThreeWayMatchServiceImpl implements ThreeWayMatchService {
    private final ThreeWayMatchRepository repo;
    private final ThreeWayMatchLineRepository lineRepo;
    private final ThreeWayMatchHistoryRepository historyRepo;
    private final PurchaseOrderRepository poRepo;
    private final PurchaseOrderLineRepository poLineRepo;
    private final GoodsReceiptNoteRepository grnRepo;
    private final GoodsReceiptLineRepository grnLineRepo;
    private final InvoiceRepository invoiceRepo;
    private final InvoiceLineRepository invoiceLineRepo;
    private final ThreeWayMatchMapper mapper;
    @PersistenceContext private EntityManager em;
    @Value("${app.three-way-match.quantity-tolerance-percent:0}") private BigDecimal quantityTolerancePercent;
    @Value("${app.three-way-match.price-tolerance-percent:2}") private BigDecimal priceTolerancePercent;

    public ThreeWayMatchServiceImpl(ThreeWayMatchRepository repo, ThreeWayMatchLineRepository lineRepo, ThreeWayMatchHistoryRepository historyRepo, PurchaseOrderRepository poRepo, PurchaseOrderLineRepository poLineRepo, GoodsReceiptNoteRepository grnRepo, GoodsReceiptLineRepository grnLineRepo, InvoiceRepository invoiceRepo, InvoiceLineRepository invoiceLineRepo, ThreeWayMatchMapper mapper) {
        this.repo = repo; this.lineRepo = lineRepo; this.historyRepo = historyRepo; this.poRepo = poRepo; this.poLineRepo = poLineRepo; this.grnRepo = grnRepo; this.grnLineRepo = grnLineRepo; this.invoiceRepo = invoiceRepo; this.invoiceLineRepo = invoiceLineRepo; this.mapper = mapper;
    }

    private String user() { var a = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication(); return a == null ? "system" : a.getName(); }
    private ThreeWayMatch find(Long id) { return repo.findById(id).orElseThrow(() -> new ThreeWayMatchNotFoundException(id)); }
    private BigDecimal nz(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }
    private BigDecimal absPct(BigDecimal expected, BigDecimal actual) {
        if (expected.compareTo(BigDecimal.ZERO) == 0) return actual.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ZERO : BigDecimal.valueOf(100);
        return expected.subtract(actual).abs().multiply(BigDecimal.valueOf(100)).divide(expected.abs(), 4, RoundingMode.HALF_UP);
    }
    private void history(ThreeWayMatch m, String action, ThreeWayMatchStatus oldStatus, ThreeWayMatchStatus newStatus, String remarks) {
        historyRepo.save(ThreeWayMatchHistory.builder().threeWayMatch(m).action(action).performedBy(user()).oldStatus(oldStatus).newStatus(newStatus).remarks(remarks).build());
    }
    private boolean qtyMatch(BigDecimal ordered, BigDecimal received, BigDecimal invoiced) {
        var tol = quantityTolerancePercent == null ? BigDecimal.ZERO : quantityTolerancePercent;
        return absPct(ordered, invoiced).compareTo(tol) <= 0 && invoiced.compareTo(received) <= 0;
    }
    private boolean priceMatch(BigDecimal orderedPrice, BigDecimal invoicedPrice) {
        var tol = priceTolerancePercent == null ? BigDecimal.valueOf(2) : priceTolerancePercent;
        return absPct(orderedPrice, invoicedPrice).compareTo(tol) <= 0;
    }

    @Transactional
    public ThreeWayMatchResponse create(ThreeWayMatchRequest request) {
        var po = poRepo.findById(request.purchaseOrderId()).orElseThrow(() -> new ResourceNotFoundException("Purchase order not found"));
        var grn = grnRepo.findById(request.goodsReceiptNoteId()).orElseThrow(() -> new ResourceNotFoundException("Goods receipt note not found"));
        var invoice = invoiceRepo.findById(request.invoiceId()).orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        if (!po.getVendor().getId().equals(grn.getVendor().getId()) || !po.getVendor().getId().equals(invoice.getVendor().getId())) throw new BadRequestException("Vendor mismatch across PO, GRN, and Invoice");
        if (!po.getId().equals(grn.getPurchaseOrder().getId())) throw new BadRequestException("GRN must belong to the purchase order");
        if (!po.getId().equals(invoice.getPurchaseOrder().getId())) throw new BadRequestException("Invoice must reference the purchase order");
        if (!grn.getId().equals(invoice.getGoodsReceiptNote().getId())) throw new BadRequestException("Invoice must reference the goods receipt note");
        if (repo.existsByMatchNumber("TWM-"+LocalDate.now().getYear()+"-"+String.format("%06d", repo.count()+1))) throw new ConflictException("Match number already exists");
        var match = ThreeWayMatch.builder()
                .matchNumber("TWM-"+LocalDate.now().getYear()+"-"+String.format("%06d", repo.count()+1))
                .purchaseOrder(po).goodsReceiptNote(grn).invoice(invoice).vendor(po.getVendor())
                .matchDate(LocalDate.now()).performedBy(user()).remarks(request.remarks())
                .createdBy(user()).updatedBy(user()).status(ThreeWayMatchStatus.PENDING).overallResult(ThreeWayMatchResult.WARNING)
                .build();
        var saved = repo.save(match);
        history(saved, "CREATED", null, ThreeWayMatchStatus.PENDING, "Three-way match created");
        return mapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<ThreeWayMatchResponse> search(String keyword, Long vendorId, ThreeWayMatchStatus status, Pageable pageable) {
        var page = repo.findAll(ThreeWayMatchSpecification.search(keyword, vendorId, status), pageable).map(mapper::toResponse);
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Transactional(readOnly = true)
    public ThreeWayMatchResponse get(Long id) { return mapper.toResponse(find(id)); }

    @Transactional
    public ThreeWayMatchResponse generate(Long id) {
        var match = find(id);
        if (match.getStatus() == ThreeWayMatchStatus.APPROVED || match.getStatus() == ThreeWayMatchStatus.REJECTED) throw new ConflictException("Three-way match cannot be regenerated");
        lineRepo.deleteAll(lineRepo.findByThreeWayMatchId(id));
        var poLines = poLineRepo.findByPurchaseOrderId(match.getPurchaseOrder().getId());
        var grnLines = grnLineRepo.findByGoodsReceiptNoteId(match.getGoodsReceiptNote().getId()).stream().collect(Collectors.toMap(l -> l.getProduct().getId(), l -> l, (a, b) -> a));
        var invoiceLines = invoiceLineRepo.findByInvoiceId(match.getInvoice().getId()).stream().collect(Collectors.toMap(l -> l.getProduct().getId(), l -> l, (a, b) -> a));
        ThreeWayMatchResult overall = ThreeWayMatchResult.PASS;
        for (PurchaseOrderLine pol : poLines) {
            var grl = grnLines.get(pol.getProduct().getId());
            var il = invoiceLines.get(pol.getProduct().getId());
            if (grl == null || il == null) {
                overall = ThreeWayMatchResult.FAIL;
                lineRepo.save(ThreeWayMatchLine.builder().threeWayMatch(match).purchaseOrderLine(pol).goodsReceiptLine(grl).invoiceLine(il).product(pol.getProduct()).orderedQuantity(pol.getQuantityOrdered()).receivedQuantity(grl == null ? BigDecimal.ZERO : grl.getAcceptedQuantity()).invoicedQuantity(il == null ? BigDecimal.ZERO : il.getQuantity()).orderedPrice(pol.getUnitPrice()).invoicedPrice(il == null ? BigDecimal.ZERO : il.getUnitPrice()).quantityMatched(false).priceMatched(false).result(ThreeWayMatchResult.FAIL).remarks("Missing matching line").build());
                continue;
            }
            var qMatch = qtyMatch(pol.getQuantityOrdered(), grl.getAcceptedQuantity(), il.getQuantity());
            var pMatch = priceMatch(pol.getUnitPrice(), il.getUnitPrice());
            var result = qMatch && pMatch ? ThreeWayMatchResult.PASS : (qMatch || pMatch ? ThreeWayMatchResult.WARNING : ThreeWayMatchResult.FAIL);
            if (result == ThreeWayMatchResult.FAIL) overall = ThreeWayMatchResult.FAIL; else if (result == ThreeWayMatchResult.WARNING && overall == ThreeWayMatchResult.PASS) overall = ThreeWayMatchResult.WARNING;
            lineRepo.save(ThreeWayMatchLine.builder().threeWayMatch(match).purchaseOrderLine(pol).goodsReceiptLine(grl).invoiceLine(il).product(pol.getProduct()).orderedQuantity(pol.getQuantityOrdered()).receivedQuantity(grl.getAcceptedQuantity()).invoicedQuantity(il.getQuantity()).orderedPrice(pol.getUnitPrice()).invoicedPrice(il.getUnitPrice()).quantityMatched(qMatch).priceMatched(pMatch).result(result).remarks(result == ThreeWayMatchResult.PASS ? "Matched" : "Tolerance or mismatch detected").build());
        }
        var old = match.getStatus();
        match.setOverallResult(overall);
        match.setStatus(overall == ThreeWayMatchResult.PASS ? ThreeWayMatchStatus.MATCHED : ThreeWayMatchStatus.MISMATCH);
        match.setUpdatedBy(user());
        var saved = repo.save(match);
        history(saved, "GENERATED", old, saved.getStatus(), "Three-way match generated");
        return mapper.toResponse(saved);
    }

    @Transactional
    public ThreeWayMatchResponse approve(Long id) {
        var match = find(id);
        if (match.getStatus() != ThreeWayMatchStatus.MATCHED) throw new ConflictException("Only matched records can be approved");
        var old = match.getStatus();
        match.setStatus(ThreeWayMatchStatus.APPROVED);
        match.setOverallResult(ThreeWayMatchResult.PASS);
        match.setUpdatedBy(user());
        var saved = repo.save(match);
        history(saved, "APPROVED", old, ThreeWayMatchStatus.APPROVED, "Finance approved three-way match");
        return mapper.toResponse(saved);
    }

    @Transactional
    public ThreeWayMatchResponse reject(Long id) {
        var match = find(id);
        var old = match.getStatus();
        match.setStatus(ThreeWayMatchStatus.REJECTED);
        match.setOverallResult(ThreeWayMatchResult.FAIL);
        match.setUpdatedBy(user());
        var saved = repo.save(match);
        history(saved, "REJECTED", old, ThreeWayMatchStatus.REJECTED, "Three-way match rejected");
        return mapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<ThreeWayMatchLineResponse> lines(Long id, Pageable pageable) {
        var mapped = lineRepo.findByThreeWayMatchId(id).stream().map(mapper::toLineResponse).toList();
        var page = new PageImpl<>(mapped, pageable, mapped.size());
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Transactional(readOnly = true)
    public ThreeWayMatchLineResponse getLine(Long id) {
        return lineRepo.findById(id).map(mapper::toLineResponse).orElseThrow(() -> new ResourceNotFoundException("Three-way match line not found"));
    }

    @Transactional(readOnly = true)
    public PageResponse<ThreeWayMatchHistoryResponse> history(Long id, Pageable pageable) {
        var mapped = historyRepo.findByThreeWayMatchIdOrderByPerformedAtDesc(id).stream().map(mapper::toHistoryResponse).toList();
        var page = new PageImpl<>(mapped, pageable, mapped.size());
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isLast());
    }
}
