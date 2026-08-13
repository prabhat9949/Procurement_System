package com.procurement.category.controller;

import com.procurement.category.dto.request.CategoryRequest;
import com.procurement.category.dto.response.CategoryResponse;
import com.procurement.category.service.CategoryService;
import com.procurement.common.response.ApiResponse;
import com.procurement.common.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Category", description = "Product category and subcategory master data")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    @Operation(summary = "Create category")
    public ResponseEntity<ApiResponse<CategoryResponse>> create(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", categoryService.create(request)));
    }

    @GetMapping
    @Operation(summary = "Search categories")
    public ApiResponse<PageResponse<CategoryResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Long parentCategoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "categoryName") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.fromString(direction), sort));
        return ApiResponse.success(categoryService.search(keyword, active, parentCategoryId, pageable));
    }

    @GetMapping("/all")
    @Operation(summary = "List all categories (for dropdowns)")
    public ApiResponse<List<CategoryResponse>> listAll() {
        return ApiResponse.success(categoryService.listAll());
    }

    @GetMapping("/root")
    @Operation(summary = "List top-level categories")
    public ApiResponse<List<CategoryResponse>> listRoot() {
        return ApiResponse.success(categoryService.listRoot());
    }

    @GetMapping("/children/{parentId}")
    @Operation(summary = "List sub-categories for a parent (dependent dropdown)")
    public ApiResponse<List<CategoryResponse>> listChildren(@PathVariable Long parentId) {
        return ApiResponse.success(categoryService.listChildren(parentId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by id")
    public ApiResponse<CategoryResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(categoryService.getById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update category")
    public ApiResponse<CategoryResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody CategoryRequest request) {
        return ApiResponse.success("Category updated", categoryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category", description = "Only allowed when no products or sub-categories reference it")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
