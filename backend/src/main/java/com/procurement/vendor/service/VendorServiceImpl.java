package com.procurement.vendor.service;

import com.procurement.common.exception.ConflictException;
import com.procurement.common.response.PageResponse;
import com.procurement.vendor.dto.request.VendorRequest;
import com.procurement.vendor.dto.response.VendorResponse;
import com.procurement.vendor.entity.Vendor;
import com.procurement.vendor.exception.VendorNotFoundException;
import com.procurement.vendor.mapper.VendorMapper;
import com.procurement.vendor.repository.VendorRepository;
import com.procurement.vendor.specification.VendorSpecification;
import com.procurement.vendor.validator.VendorValidator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VendorServiceImpl implements VendorService {

    private final VendorRepository vendorRepository;
    private final VendorMapper vendorMapper;
    private final VendorValidator vendorValidator;

    public VendorServiceImpl(VendorRepository vendorRepository, VendorMapper vendorMapper,
                             VendorValidator vendorValidator) {
        this.vendorRepository = vendorRepository;
        this.vendorMapper = vendorMapper;
        this.vendorValidator = vendorValidator;
    }

    @Override
    @Transactional
    public VendorResponse create(VendorRequest request) {
        vendorValidator.validate(request);
        ensureUnique(request, null);
        Vendor vendor = vendorMapper.toEntity(request);
        applyDefaults(vendor);
        String username = currentUsername();
        vendor.setCreatedBy(username);
        vendor.setUpdatedBy(username);
        return vendorMapper.toResponse(vendorRepository.save(vendor));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<VendorResponse> search(String keyword, String vendorType, String status,
                                               Boolean approved, Pageable pageable) {
        Page<VendorResponse> page = vendorRepository
                .findAll(VendorSpecification.search(keyword, vendorType, status, approved), pageable)
                .map(vendorMapper::toResponse);
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public VendorResponse getById(Long id) {
        return vendorMapper.toResponse(findVendor(id));
    }

    @Override
    @Transactional
    public VendorResponse update(Long id, VendorRequest request) {
        vendorValidator.validate(request);
        Vendor vendor = findVendor(id);
        ensureUnique(request, id);
        vendorMapper.updateEntity(vendor, request);
        applyDefaults(vendor);
        vendor.setUpdatedBy(currentUsername());
        return vendorMapper.toResponse(vendorRepository.save(vendor));
    }

    @Override
    @Transactional
    public VendorResponse updateStatus(Long id, String status, Boolean approved) {
        Vendor vendor = findVendor(id);
        if (status != null && !status.isBlank()) {
            vendor.setStatus(status.trim().toUpperCase());
        }
        if (approved != null) {
            vendor.setApproved(approved);
        }
        vendor.setUpdatedBy(currentUsername());
        return vendorMapper.toResponse(vendorRepository.save(vendor));
    }

    @Override
    @Transactional
    public VendorResponse updateKyc(Long id, String decision, String reason) {
        Vendor vendor = findVendor(id);
        if ("APPROVE".equalsIgnoreCase(decision)) {
            vendor.setStatus("ACTIVE");
            vendor.setApproved(true);
        } else if ("REJECT".equalsIgnoreCase(decision)) {
            vendor.setStatus("REJECTED");
            vendor.setApproved(false);
        } else if ("SUSPEND".equalsIgnoreCase(decision)) {
            vendor.setStatus("SUSPENDED");
        } else if ("BLACKLIST".equalsIgnoreCase(decision)) {
            vendor.setStatus("BLACKLISTED");
            vendor.setApproved(false);
        } else if ("ACTIVATE".equalsIgnoreCase(decision)) {
            vendor.setStatus("ACTIVE");
            vendor.setApproved(true);
        }
        vendor.setUpdatedBy(currentUsername());
        Vendor saved = vendorRepository.save(vendor);
        return vendorMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Vendor vendor = findVendor(id);
        vendorRepository.delete(vendor);
    }

    private Vendor findVendor(Long id) {
        return vendorRepository.findById(id).orElseThrow(() -> new VendorNotFoundException(id));
    }

    private void ensureUnique(VendorRequest request, Long currentId) {
        vendorRepository.findByVendorCode(request.vendorCode()).ifPresent(existing -> {
            if (!existing.getId().equals(currentId)) {
                throw new ConflictException("Vendor code is already in use");
            }
        });
        if (request.gstNumber() != null && !request.gstNumber().isBlank()) {
            vendorRepository.findByGstNumber(request.gstNumber()).ifPresent(existing -> {
                if (!existing.getId().equals(currentId)) {
                    throw new ConflictException("GST number is already in use");
                }
            });
        }
    }

    private void applyDefaults(Vendor vendor) {
        if (vendor.getStatus() == null || vendor.getStatus().isBlank()) {
            vendor.setStatus("ACTIVE");
        } else {
            vendor.setStatus(vendor.getStatus().trim().toUpperCase());
        }
        if (vendor.getApproved() == null) {
            vendor.setApproved(false);
        }
        if (vendor.getCurrency() != null) {
            vendor.setCurrency(vendor.getCurrency().trim().toUpperCase());
        }
    }

    private String currentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? "system" : authentication.getName();
    }
}
