package com.procurement.product.service;

import com.procurement.category.entity.Category;
import com.procurement.category.repository.CategoryRepository;
import com.procurement.common.exception.ConflictException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.response.PageResponse;
import com.procurement.product.dto.request.NewCatalogueItemRequest;
import com.procurement.product.dto.request.ProductRequest;
import com.procurement.product.dto.response.ProductResponse;
import com.procurement.product.entity.Product;
import com.procurement.product.exception.ProductNotFoundException;
import com.procurement.product.mapper.ProductMapper;
import com.procurement.product.repository.ProductRepository;
import com.procurement.product.specification.ProductSpecification;
import com.procurement.product.validator.ProductValidator;
import com.procurement.uom.entity.UnitOfMeasure;
import com.procurement.uom.repository.UnitOfMeasureRepository;
import com.procurement.vendor.entity.Vendor;
import com.procurement.vendor.repository.VendorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final VendorRepository vendorRepository;
    private final UnitOfMeasureRepository unitOfMeasureRepository;
    private final ProductMapper productMapper;
    private final ProductValidator productValidator;

    public ProductServiceImpl(ProductRepository productRepository,
                              CategoryRepository categoryRepository,
                              VendorRepository vendorRepository,
                              UnitOfMeasureRepository unitOfMeasureRepository,
                              ProductMapper productMapper,
                              ProductValidator productValidator) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.vendorRepository = vendorRepository;
        this.unitOfMeasureRepository = unitOfMeasureRepository;
        this.productMapper = productMapper;
        this.productValidator = productValidator;
    }

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request) {
        productValidator.validate(request);
        ensureUnique(request, null);
        Product product = productMapper.toEntity(request, findCategory(request.categoryId()),
                findVendor(request.vendorId()), findUnitOfMeasure(request.unitOfMeasureId()));
        applyDefaults(product);
        String username = currentUsername();
        product.setCreatedBy(username);
        product.setUpdatedBy(username);
        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse requestNewCatalogueItem(NewCatalogueItemRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.categoryId()));
        // Sensible defaults: first vendor, first/"PCS" UoM, INR, zero stock levels.
        Vendor vendor = vendorRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No vendor is configured to associate the catalogue item"));
        UnitOfMeasure uom = unitOfMeasureRepository.findByUomCode("PCS")
                .orElseGet(() -> unitOfMeasureRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("No unit of measure is configured")));
        String suffix = String.valueOf(System.currentTimeMillis());
        Product product = new Product();
        product.setProductCode("PRD-" + suffix);
        product.setSku("SKU-" + suffix);
        product.setProductName(request.productName().trim());
        product.setDescription(request.description());
        product.setBrand(request.brand());
        product.setManufacturer(request.brand());
        product.setCategory(category);
        product.setVendor(vendor);
        product.setUnitOfMeasure(uom);
        product.setUnitPrice(request.unitPrice());
        product.setCurrency(request.currency() == null || request.currency().isBlank() ? "INR" : request.currency().trim().toUpperCase());
        product.setMinimumStock(0);
        product.setMaximumStock(0);
        product.setReorderLevel(0);
        product.setLeadTimeDays(7);
        product.setTaxPercentage(new BigDecimal("18.00"));
        product.setIsDigital(Boolean.TRUE.equals(request.isDigital()));
        product.setActive(true);
        String username = currentUsername();
        product.setCreatedBy(username);
        product.setUpdatedBy(username);
        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> search(String keyword, Long categoryId, Long vendorId,
                                                Boolean active, Pageable pageable) {
        Page<ProductResponse> page = productRepository
                .findAll(ProductSpecification.search(keyword, categoryId, vendorId, active), pageable)
                .map(productMapper::toResponse);
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return productMapper.toResponse(findProduct(id));
    }

    @Override
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        productValidator.validate(request);
        Product product = findProduct(id);
        ensureUnique(request, id);
        productMapper.updateEntity(product, request, findCategory(request.categoryId()),
                findVendor(request.vendorId()), findUnitOfMeasure(request.unitOfMeasureId()));
        applyDefaults(product);
        product.setUpdatedBy(currentUsername());
        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        productRepository.delete(findProduct(id));
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
    }

    private Vendor findVendor(Long id) {
        return vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found: " + id));
    }

    private UnitOfMeasure findUnitOfMeasure(Long id) {
        return unitOfMeasureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit of measure not found: " + id));
    }

    private void ensureUnique(ProductRequest request, Long currentId) {
        productRepository.findByProductCode(request.productCode()).ifPresent(existing -> {
            if (!existing.getId().equals(currentId)) {
                throw new ConflictException("Product code is already in use");
            }
        });
        productRepository.findBySku(request.sku()).ifPresent(existing -> {
            if (!existing.getId().equals(currentId)) {
                throw new ConflictException("SKU is already in use");
            }
        });
    }

    private void applyDefaults(Product product) {
        if (product.getActive() == null) {
            product.setActive(true);
        }
    }

    private String currentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? "system" : authentication.getName();
    }
}
