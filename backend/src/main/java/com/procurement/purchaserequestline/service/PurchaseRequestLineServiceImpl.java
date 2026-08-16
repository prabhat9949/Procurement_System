package com.procurement.purchaserequestline.service;

import com.procurement.common.exception.ConflictException;
import com.procurement.common.exception.ForbiddenException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.response.PageResponse;
import com.procurement.product.entity.Product;
import com.procurement.product.repository.ProductRepository;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.purchaserequest.entity.PurchaseRequestStatus;
import com.procurement.purchaserequest.repository.PurchaseRequestRepository;
import com.procurement.purchaserequestline.dto.request.PurchaseRequestLineRequest;
import com.procurement.purchaserequestline.dto.response.PurchaseRequestLineResponse;
import com.procurement.purchaserequestline.entity.PurchaseRequestLine;
import com.procurement.purchaserequestline.exception.PurchaseRequestLineNotFoundException;
import com.procurement.purchaserequestline.mapper.PurchaseRequestLineMapper;
import com.procurement.purchaserequestline.repository.PurchaseRequestLineRepository;
import com.procurement.purchaserequestline.specification.PurchaseRequestLineSpecification;
import com.procurement.purchaserequestline.validator.PurchaseRequestLineValidator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class PurchaseRequestLineServiceImpl implements PurchaseRequestLineService {

    private final PurchaseRequestLineRepository lineRepository;
    private final PurchaseRequestRepository purchaseRequestRepository;
    private final ProductRepository productRepository;
    private final PurchaseRequestLineMapper lineMapper;
    private final PurchaseRequestLineValidator lineValidator;

    public PurchaseRequestLineServiceImpl(PurchaseRequestLineRepository lineRepository,
                                          PurchaseRequestRepository purchaseRequestRepository,
                                          ProductRepository productRepository,
                                          PurchaseRequestLineMapper lineMapper,
                                          PurchaseRequestLineValidator lineValidator) {
        this.lineRepository = lineRepository;
        this.purchaseRequestRepository = purchaseRequestRepository;
        this.productRepository = productRepository;
        this.lineMapper = lineMapper;
        this.lineValidator = lineValidator;
    }

    @Override
    @Transactional
    public PurchaseRequestLineResponse create(PurchaseRequestLineRequest request) {
        lineValidator.validate(request);
        PurchaseRequest purchaseRequest = findPurchaseRequest(request.purchaseRequestId());
        ensureDraftAndOwner(purchaseRequest);
        Product product = findProduct(request.productId());
        ensureUnique(request.purchaseRequestId(), request.productId(), null);
        PurchaseRequestLine line = lineMapper.toEntity(request, purchaseRequest, product);
        PurchaseRequestLineResponse response = lineMapper.toResponse(lineRepository.save(line));
        recalculateHeader(purchaseRequest);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PurchaseRequestLineResponse> search(String keyword,
                                                            Long purchaseRequestId,
                                                            Long productId,
                                                            Pageable pageable) {
        Page<PurchaseRequestLineResponse> page = lineRepository.findAll(
                        PurchaseRequestLineSpecification.search(keyword, purchaseRequestId, productId), pageable)
                .map(lineMapper::toResponse);
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseRequestLineResponse getById(Long id) {
        return lineMapper.toResponse(findLine(id));
    }

    @Override
    @Transactional
    public PurchaseRequestLineResponse update(Long id, PurchaseRequestLineRequest request) {
        lineValidator.validate(request);
        PurchaseRequestLine line = findLine(id);
        PurchaseRequest oldRequest = line.getPurchaseRequest();
        ensureDraftAndOwner(oldRequest);
        PurchaseRequest newRequest = findPurchaseRequest(request.purchaseRequestId());
        ensureDraftAndOwner(newRequest);
        Product product = findProduct(request.productId());
        ensureUnique(request.purchaseRequestId(), request.productId(), id);
        lineMapper.updateEntity(line, request, newRequest, product);
        PurchaseRequestLineResponse response = lineMapper.toResponse(lineRepository.save(line));
        recalculateHeader(oldRequest);
        if (!oldRequest.getId().equals(newRequest.getId())) {
            recalculateHeader(newRequest);
        }
        return response;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        PurchaseRequestLine line = findLine(id);
        PurchaseRequest purchaseRequest = line.getPurchaseRequest();
        ensureDraftAndOwner(purchaseRequest);
        lineRepository.delete(line);
        recalculateHeader(purchaseRequest);
    }

    private PurchaseRequestLine findLine(Long id) {
        return lineRepository.findById(id)
                .orElseThrow(() -> new PurchaseRequestLineNotFoundException(id));
    }

    private PurchaseRequest findPurchaseRequest(Long id) {
        return purchaseRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase request not found: " + id));
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    private void ensureUnique(Long purchaseRequestId, Long productId, Long currentId) {
        lineRepository.findByPurchaseRequestIdAndProductId(purchaseRequestId, productId)
                .ifPresent(existing -> {
                    if (!existing.getId().equals(currentId)) {
                        throw new ConflictException("Product already exists on this purchase request");
                    }
                });
    }

    private void recalculateHeader(PurchaseRequest purchaseRequest) {
        BigDecimal total = lineRepository.findByPurchaseRequestId(purchaseRequest.getId()).stream()
                .map(PurchaseRequestLine::getEstimatedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        purchaseRequest.setEstimatedAmount(total);
        purchaseRequestRepository.save(purchaseRequest);
    }

    private void ensureDraftAndOwner(PurchaseRequest purchaseRequest) {
        if (purchaseRequest.getStatus() != PurchaseRequestStatus.DRAFT) {
            throw new ConflictException("Lines can only be changed on a draft purchase request");
        }
        String username = currentUsername();
        if (!"system".equals(purchaseRequest.getCreatedBy())
                && !purchaseRequest.getCreatedBy().equals(username)) {
            throw new ForbiddenException("Only the requester can change purchase request lines");
        }
    }

    private String currentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? "system" : authentication.getName();
    }
}
