package com.procurement.category.service;

import com.procurement.auditlog.service.AuditLogService;
import com.procurement.category.dto.request.CategoryRequest;
import com.procurement.category.dto.response.CategoryResponse;
import com.procurement.category.entity.Category;
import com.procurement.category.repository.CategoryRepository;
import com.procurement.common.exception.ConflictException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.response.PageResponse;
import com.procurement.product.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final AuditLogService auditLogService;

    public CategoryService(CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           AuditLogService auditLogService) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByCategoryCode(request.categoryCode())) {
            throw new ConflictException("Category code is already registered: " + request.categoryCode());
        }
        Category category = new Category();
        category.setCategoryCode(request.categoryCode().trim().toUpperCase());
        category.setCategoryName(request.categoryName().trim());
        category.setDescription(request.description());
        if (request.parentCategoryId() != null) {
            category.setParentCategory(find(request.parentCategoryId()));
        }
        category.setActive(request.active() == null || request.active());
        Category saved = categoryRepository.save(category);
        auditLogService.record("Category", "Category", saved.getId(), "CREATE",
                saved.getCategoryCode(), "CATEGORY", true, null, catDetails(saved),
                "Category created by admin");
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<CategoryResponse> search(String keyword, Boolean active, Long parentCategoryId, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<Category> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            if (keyword != null && !keyword.isBlank()) {
                String like = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("categoryCode")), like),
                        cb.like(cb.lower(root.get("categoryName")), like)
                ));
            }
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }
            if (parentCategoryId != null) {
                predicates.add(cb.equal(root.get("parentCategory").get("id"), parentCategoryId));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        Page<CategoryResponse> page = categoryRepository.findAll(spec, pageable).map(this::toResponse);
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listAll() {
        return categoryRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listRoot() {
        return categoryRepository.findAll().stream()
                .filter(c -> c.getParentCategory() == null)
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listChildren(Long parentId) {
        return categoryRepository.findByParentCategoryId(parentId).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        return toResponse(find(id));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = find(id);
        String old = catDetails(category);
        if (request.categoryCode() != null && !request.categoryCode().isBlank()
                && !category.getCategoryCode().equalsIgnoreCase(request.categoryCode())
                && categoryRepository.existsByCategoryCode(request.categoryCode())) {
            throw new ConflictException("Category code is already registered: " + request.categoryCode());
        }
        if (request.categoryCode() != null && !request.categoryCode().isBlank()) {
            category.setCategoryCode(request.categoryCode().trim().toUpperCase());
        }
        if (request.categoryName() != null && !request.categoryName().isBlank()) {
            category.setCategoryName(request.categoryName().trim());
        }
        category.setDescription(request.description());
        if (request.parentCategoryId() != null) {
            if (request.parentCategoryId().equals(category.getId())) {
                throw new ConflictException("A category cannot be its own parent");
            }
            category.setParentCategory(find(request.parentCategoryId()));
        } else {
            // Explicit null clears the parent (top-level category).
            category.setParentCategory(null);
        }
        if (request.active() != null) {
            category.setActive(request.active());
        }
        Category saved = categoryRepository.save(category);
        auditLogService.record("Category", "Category", saved.getId(), "UPDATE",
                saved.getCategoryCode(), "CATEGORY", true, old, catDetails(saved),
                "Category updated by admin");
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        Category category = find(id);
        long products = productRepository.countByCategoryId(id);
        long children = categoryRepository.countByParentCategoryId(id);
        if (products > 0 || children > 0) {
            throw new ConflictException("Category has " + products + " product(s) and "
                    + children + " sub-category(ies); deactivate instead of deleting");
        }
        categoryRepository.delete(category);
        auditLogService.record("Category", "Category", id, "DELETE",
                category.getCategoryCode(), "CATEGORY", true, catDetails(category), null,
                "Category deleted by admin");
    }

    private Category find(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getCategoryCode(),
                category.getCategoryName(), category.getDescription(),
                category.getParentCategory() == null ? null : category.getParentCategory().getId(),
                category.getParentCategory() == null ? null : category.getParentCategory().getCategoryName(),
                category.getActive(),
                productRepository.countByCategoryId(category.getId()),
                categoryRepository.countByParentCategoryId(category.getId()),
                category.getCreatedAt(), category.getUpdatedAt());
    }

    private String catDetails(Category c) {
        return "{code=" + c.getCategoryCode() + ", name=" + c.getCategoryName()
                + ", active=" + c.getActive() + "}";
    }
}
